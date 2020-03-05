const generator = require('./index');

const config = {
  ejsFolder: './sample/views',
  dist: 'dist',
};

const data = [{
  content: {
    title: 'Home',
    message: 'yo',
  },
  set: {
    page: 'home',
    template: 'main',
  },
},
];

generator({ config, data });
