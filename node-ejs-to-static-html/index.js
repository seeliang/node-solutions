// imports
const util = require('util');
const fs = require('fs');
const ejs = require('ejs');

// promisify
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const config = {
  root: './sample/views',
};

const data = {
  home: {
    title: 'Home',
    message: 'yo',
  },
};

async function render() {
  try {
    // create output directory
    await mkdir('dist', { recursive: true });

    // render ejs template to html string
    const html = await ejs
      .renderFile(`${config.root}/main.ejs`, data.home)
      .then((output) => output);

    // create file and write html
    await writeFile('dist/index.html', html, 'utf8');
  } catch (error) {
    console.log(error);
  }
}
render();
