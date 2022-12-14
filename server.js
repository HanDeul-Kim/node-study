// express 기본 셋팅
const express = require('express');
const app = express();
// bodyParser
app.use(express.urlencoded({ extended: true }))
// ejs
app.set('view engine', 'ejs');
// public폴더 사용
app.use('/public', express.static('public'))
require('dotenv').config()
// MongoDB
const MongoClient = require('mongodb').MongoClient;
// method-override (put,delete요청 라이브러리)
const methodOverride = require('method-override');
const { list } = require('mongodb/lib/gridfs/grid_store');
app.use(methodOverride('_method'))


let db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log('에러~')

    // todoapp이라는 db에 연결
    db = client.db('todoapp');

    // db연결 되면 실행 할 코드 

    app.listen(process.env.PORT, () => {
        console.log('2020port')
    })

    
    // 데이터를 꺼낼때나 저장할때 db.collection('')로 무조건 시작 후 find, insertOne 등등 사용 하면 된다.
})

app.get('/music', (req, res) => {
    res.send('music 플랫폼 입니다.');
})
app.get('/news', (req, res) => {
    res.send('news 플랫폼 입니다.')
})




app.get('/detail/:id', (req, res) => {

    db.collection('post').findOne({ _id: Number(req.params.id) }, (err, result) => {
        res.render('detail.ejs', { data: result });
    })
})



app.put('/edit', (req, res) => {
    db.collection('post').updateOne({ _id: parseInt(req.body.id) }, { $set: { title: req.body.title, date: req.body.date } }, (err, result) => {
        console.log('put요청 성공')
        // 항상 요청 후 응답이 있어야 작동.  (게시글 수정 후 list.ejs 보여줘!) 
        res.redirect('/list')
    })
})


//******************** 로그인 라이브러리 셋팅 ********************//

// passport
const passport = require('passport');
// passport-local
const LocalStrategy = require('passport-local');
// express-session
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    const newArr = [];
    newArr.push(req.user);
    res.render('login.ejs', {text: newArr})
})
app.get('/fail', (req, res) => {
    res.render('fail.ejs')
})

//******************** login!!  ********************//
app.post('/login', passport.authenticate('local', {
    // 로그인 실패 하면 /fail로 이동 
    failureRedirect: '/fail'
}), (req, res) => {
    // 로그인 성공시 home
    res.send(`<script>alert('${req.body.id}님 반갑습니다!'); window.location.replace('/')</script>;`)
    // res.redirect('/')
})

// html 파일 보내보기
app.get('/', (req, res) => {
    res.render('index.ejs');
})

app.get('/write', 로그인했니, (req, res) => {
    res.render('write.ejs');
})
// 로그인 상태관리 
app.get('/mypage', 로그인했니, (req, res) => {
    // console.log(req.user);
    res.render('mypage.ejs', {user: req.user})
})

// 미들웨어
function 로그인했니(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.send(`<script>alert('로그인을 먼저 해주세요.'); window.location.replace('/')</script>;`)
    }
}

// ejs 파일 보내보기 (views라는 이름의 폴더를 만들고 넣어야함.)
app.get('/list', 로그인했니, (req, res) => {
    // post라는 collection안의 모든 데이터를 꺼내보자
    db.collection('post').find().toArray((err, result) => {
        res.render('list.ejs', { todos: result });
    });
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,

}, (입력한아이디, 입력한비번, done) => {
    // console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, (err, result) => {
        if (err) return done(err)
        if (!result) return done(null, false, { message: '존재하지 않는 아이디입니다.' })
        if (입력한비번 == result.pw) {
            return done(null, result)
        } else {
            return done(null, false, { message: '비밀번호가 틀렸습니다.' })
        }
    })
}));


// 로그인 성공시 세션 + 쿠키 생성 
passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((아이디, done) => {
    db.collection('login').findOne({ id: 아이디 }, (err, result) => {
        done(null, result)
    })
})


//******************** register!!  ********************//
app.post('/register', (req, res) => {
    db.collection('login').findOne({ id: req.body.id }, (err, result) => {
        if (result == null) {
            db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw }, (err, result) => {
                res.send(`<script>alert('${req.body.id}님 회원가입을 축하드립니다!'); window.location.replace('/')</script>;`)
            })
        } else {
            res.send("<script>alert('중복된 아이디입니다!'); window.location.replace('/login')</script>;")
        }
    })
    
})


app.post('/add', (req, res) => {

    db.collection('counter').findOne({ name: '게시물갯수' }, (err, result) => {
        // date 함수 
        const offset = 1000 * 60 * 60 * 9
        const koreaNow = new Date((new Date()).getTime() + offset)
        
        let countId = result.totalPost;
        const writeList = { _id: countId + 1, user: req.user._id, title: req.body.title, date: req.body.date, test: koreaNow.toISOString().replace("T", " ").split('.')[0]} 
        db.collection('post').insertOne(writeList, (err, result) => {
            console.log('form 데이터 저장 완료.')
            // updateOne 파라미터 = 수정할 데이터(query문), 수정값, callback  (두 번째 파라미터 mongodb operator 참고!)
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, (err, result) => {
                if (err) { return console.log('에러') }
            })
        })
    });

    res.send(`<script>alert('todo 등록 완료!'); window.location.replace('/')</script>;`)
})

// delete 요청
app.delete('/delete', (req, res) => {
    // list.ejs에서의 ajax요청 데이터
  
    // console.log(req.body);
    // console.log(req.user);
    db.collection('post').findOne({ _id: Number(req.body._id), user: req.user._id}, (err, result) => {
        if(result == null) {
            res.status(500).send({message:'실패'})
        } else {
            req.body._id = parseInt(req.body._id);
            let 삭제할데이터 = { _id: req.body._id, user: req.user._id}
            db.collection('post').deleteOne(삭제할데이터, (err, result) => {
                res.status(200).send({message: '성공'})
            })
        }
    })
})



app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({ _id: Number(req.params.id), user: req.user._id }, (err, result) => {
        if(result == null) {
            res.send(`<script>alert('권한이 없습니다. 회원정보가 다릅니다.'); window.location.replace('/detail/${req.params.id}')</script>`)
        } else {
            res.render('edit.ejs', { post: result })
        }
    })
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
})





//******************** search  ********************//
// query string으로 전달한 데이터 꺼내오기
app.get('/search', (req, res) => {
    // 검색 조건
    const requirement = [
        {
            $search: {
                index: 'titleSearch',       // mongoDB 아틀라스에서 만든 search index명
                text: {
                    query: req.query.value,
                    path: "title"       //  title, text 둘 다 찾고 싶으면 ['title', 'text']
                }
            }
        },
        {
            $sort: { _id: 1 },
        },

        // -- $project 연산자 -- 1 = 값 보여줘, 0 = 값 보여주지마 
        // {
        //     $project: { _id: 1, title: 0, date: 0,  score: { $meta: "searchScore"}}
        // }
    ]

    db.collection('post').aggregate(requirement).toArray((err, result) => {
        res.render('search.ejs', { sResult: result });
    })
})


// multer (image 업로드) 라이브러리
let multer = require('multer')
var storage = multer.diskStorage({
    // image저장 경로
    destination: function(req, file, cb) {
        cb(null, './public/image')
    },
    // 저장한 image 파일명 설정
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})
var path = require('path');
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
});

app.get('/upload', (req, res) => {
    res.render('upload.ejs')
})
app.post('/upload', upload.single('uploadImg'), (req, res) => {
    res.send('업로드 완료')
})
app.get('/image/:imgName', (req, res) => {
    res.sendFile( __dirname + '/public/image/' + req.params.imgName)
})
