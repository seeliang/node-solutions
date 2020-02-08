const express = require('express');
const path = require('path');

const pathTo = {
  static: path.join(__dirname, 'assets'),
};
const web = express();

web.set('view engine', 'pug');

web.get('/', (req, res) => res.render('index', { title: 'Hey', message: 'Hello there!' }));
web.get('/hi', (req, res) => res.render('index', { title: 'Hi', message: 'Hi guys!' }));
console.log(pathTo);
web.use('/static', express.static(pathTo.static));

web.listen(8000, () => console.log('start at port localhost:8000'));
