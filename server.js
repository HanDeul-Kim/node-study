// express 기본 셋팅
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) 
app.listen(2020, (req, res) => {
    console.log('2020port')
});

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

