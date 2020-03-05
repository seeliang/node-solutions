// imports
const util = require('util');
const fs = require('fs');
const ejs = require('ejs');

// promisify
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);


async function render({ config, data }) {
  try {
    // create output directory
    await mkdir(config.dist, { recursive: true });

    // render ejs template to html string
    const html = await ejs
      .renderFile(`${config.root}/main.ejs`, data[0])
      .then((output) => output);

    // create file and write html
    await writeFile(`${config.dist}/${data[0].page}.html`, html, 'utf8');
  } catch (error) {
    console.log(error);
  }
}
module.exports = render;
