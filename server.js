// express 기본 셋팅
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))
const MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect('mongodb+srv://beenzino13:1q2w3e4r@first-db.cuypcoh.mongodb.net/?retryWrites=true&w=majority', (err, client) => {
    if(err) return console.log('에러~')

    // todoapp database에 연결
    db = client.db('todoapp');
    db.collection('post').insertOne('저장할데이터', (err, res) => {
        console.log('저장완료');
    });
    // db연결 되면 실행 할 코드 
    app.listen(2020, () => {
        console.log('2020port')
    });

})

// app.listen(2020, (req, res) => {
//     console.log('2020port')
// });
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
app.post('/add', (req, res) => {
    // console창에 출력만 하지말고 클라이언트가 보낸 데이터를 db에 영구적으로 저장을 해보자
    console.log(req.body);
    console.log(req.body.title);
    res.send('전송 완료!')
})

