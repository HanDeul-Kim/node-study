// express 기본 셋팅
const express = require('express');
const app = express();
// bodyParser
app.use(express.urlencoded({ extended: true }))
// ejs
app.set('view engine', 'ejs');
// MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://beenzino13:1q2w3e4r@first-db.cuypcoh.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, client) => {
    if(err) return console.log('에러~')

    // todoapp이라는 db에 연결
    db = client.db('todoapp');

    // post라는 파일에 insertOne {자료}
    // db.collection('post').insertOne({_id : 0, 이름 : 'kim', age : 29}, (err, res) => {
    //     console.log('저장완료');
    // });

    // db연결 되면 실행 할 코드 
    app.listen(2020, () => {
        console.log('2020port')
    });


    app.post('/add', (req, res) => {
        db.collection('post').insertOne({ title : req.body.title, date : req.body.date}, (err, res) => {
            console.log('form 데이터 저장 완료.')
        })
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
    res.sendFile(__dirname + '/index.html')
})
app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html')
})
// ejs 파일 보내보기 (views라는 이름의 폴더를 만들고 넣어야함.)
app.get('/list', (req, res) => {

    // post라는 collection안의 모든 데이터를 꺼내보자
    db.collection('post').find().toArray( (err, result) => {
        console.log(result);
        res.render('list.ejs', {todos : result});
    });

    
})

// app.post('/add', (req, res) => {
//     // console창에 출력만 하지말고 클라이언트가 보낸 데이터를 db에 영구적으로 저장을 해보자
//     // console.log(req.body);
//     console.log(req.body.title);
//     console.log(req.body.date);
//     res.send('전송 완료!')
// })

