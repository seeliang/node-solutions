const express = require('express');

const server = express();

server.set('view engine', 'ejs');

server.get('/', (req, res) => res.render('main', { title: 'Home', message: 'Hello! homepage for you' }));
server.get('/login', (req, res) => res.render('main', { title: 'login', message: 'please login guys!' }));
server.get('/profile', (req, res) => res.render('main', { title: 'profile', message: 'oh it is you!' }));

server.listen(1200, () => console.log('start at port localhost:1200'));
