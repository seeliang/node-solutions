const express = require('express'),
  path = require('path'),
  pathTo = {
    static: path.join(__dirname, 'assets')
  },
  web = express();

web.get('/',(req,res)=> res.send('home'))
web.get('/hi',(req,res)=> res.send('hi'))
console.log(pathTo)
web.use('/static', express.static(pathTo.static))

web.listen(8000,() => console.log('start at port localhost:8000'))