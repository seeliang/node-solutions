const express = require('express');
const web = express();

web.get('/',(req,res)=> res.send('home'))
web.get('/hi',(req,res)=> res.send('hi'))
web.listen(8000,() => console.log('start at port localhost:8000'))