const generator = require('./index');

const config = {
  root: './sample/views',
  dist: 'dist',
};

const data = [{
  page: 'home',
  title: 'Home',
  message: 'yo',
},
];

generator({ config, data });
