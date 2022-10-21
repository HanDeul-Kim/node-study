// express 기본 셋팅
const express = require('express');
const app = express();
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