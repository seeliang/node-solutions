// imports
const util = require('util');
const fs = require('fs');
const ejs = require('ejs');

// promisify
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);


const render = ({ config, data }) => {
  const { ejsFolder, dist } = config;
  data.forEach(async (i) => {
    const { content, set } = i;
    try {
    // create output directory
      await mkdir(dist, { recursive: true });

      // render ejs template to html string
      const html = await ejs
        .renderFile(`${ejsFolder}/${set.template}.ejs`, content)
        .then((output) => output);

      // create file and write html
      await writeFile(`${dist}/${set.page}.html`, html, 'utf8');
    } catch (error) {
      console.log(error);
    }
  });
};


module.exports = render;
