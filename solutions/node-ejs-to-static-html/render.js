const generator = require('./index');

const config = {
  ejsFolder: './sample/views',
  dist: 'dist',
};

const data = [
  {
    content: {
      title: 'Home',
      message: 'yo',
    },
    set: {
      page: 'home',
      template: 'main',
    },
  },
  {
    content: {
      title: 'get',
      message: 'you',
    },
    set: {
      page: 'get',
      template: 'main',
    },
  },
];

generator({ config, data });
