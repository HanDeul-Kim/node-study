// express 기본 셋팅
const express = require('express');
const app = express();
// bodyParser
app.use(express.urlencoded({ extended: true }))
// ejs
app.set('view engine', 'ejs');
// public폴더 사용
app.use('/public', express.static('public'))
// MongoDB
const MongoClient = require('mongodb').MongoClient;
// method-override (put,delete요청 라이브러리)
const methodOverride = require('method-override');
const { list } = require('mongodb/lib/gridfs/grid_store');
app.use(methodOverride('_method'))
let db;
MongoClient.connect('mongodb+srv://beenzino13:1q2w3e4r@first-db.cuypcoh.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log('에러~')

    // todoapp이라는 db에 연결
    db = client.db('todoapp');

    // db연결 되면 실행 할 코드 
    app.listen(2020, () => {
        console.log('2020port')
    });


    app.post('/add', (req, res) => {
        db.collection('counter').findOne({ name: '게시물갯수' }, (err, result) => {
            let countId = result.totalPost;
            db.collection('post').insertOne({ _id: countId + 1, title: req.body.title, date: req.body.date }, (err, res) => {
                console.log('form 데이터 저장 완료.')

                // updateOne 파라미터 = 수정할 데이터(query문), 수정값, callback  (두 번째 파라미터 mongodb operator 참고!)
                db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, (err, result) => {
                    if (err) { return console.log('에러') }
                })
            })
        });

        res.send('전송 완료!')
    })
    // 데이터를 꺼낼때나 저장할때 db.collection('')로 무조건 시작 후 find, insertOne 등등 사용 하면 된다.
})

app.get('/music', (req, res) => {
    res.send('music 플랫폼 입니다.');
})
app.get('/news', (req, res) => {
    res.send('news 플랫폼 입니다.')
})

// html 파일 보내보기
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html')
    res.render('index.ejs');
})
app.get('/write', (req, res) => {
    // res.sendFile(__dirname + '/write.html')
    res.render('write.ejs');
})
// ejs 파일 보내보기 (views라는 이름의 폴더를 만들고 넣어야함.)
app.get('/list', (req, res) => {

    // post라는 collection안의 모든 데이터를 꺼내보자
    db.collection('post').find().toArray((err, result) => {
        res.render('list.ejs', { todos: result });
    });

})
app.get('/detail/:id', (req, res) => {

    db.collection('post').findOne({ _id: Number(req.params.id) }, (err, result) => {
        res.render('detail.ejs', { data: result });
    })
})
// delete 요청
app.delete('/delete', (req, res) => {
    // list.ejs에서의 ajax요청 데이터
    console.log(req.body);

    req.body._id = parseInt(req.body._id);

    // deleteOne 함수 파라미터 = query문, callback
    db.collection('post').deleteOne(req.body, (err, result) => {


        // 응답을 꼭 설정해야 list.ejs에서의 ajax요청에서 done()이 작동함.
        // 성공
        res.status(200).send({ message: '성공!' })
        // 실패
        // res.status(500).send( {message: '실패!'} )
    })
})

app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({ _id: Number(req.params.id) }, (err, result) => {
        res.render('edit.ejs', { post: result })
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

app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    res.render('login.ejs')
})