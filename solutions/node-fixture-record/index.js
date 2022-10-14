const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const web = express();
const axios = require('axios');

const extApi = 'https://api.dictionaryapi.dev/api/v2/entries/en/hello';

const shallUseFixture = true;
const fixturePath = path.join(__dirname, '/fixture/');

const storeFixture = (api, response) => {
  const record = `${fixturePath + extApi.split('://')[1]}.json`;
  fs.ensureFile(record);
  fs.writeFileSync(record, JSON.stringify(response.data));
};
const fixtureLayer = (req, res, next) => {
  const thatStaticFile = `${fixturePath}api.dictionaryapi.dev/api/v2/entries/en/hello.json`;
  if (!shallUseFixture) {
    return next();
  }
  try {
    if (fs.existsSync(thatStaticFile)) {
      const result = JSON.parse(fs.readFileSync(thatStaticFile));
      return res.status(200).json(result);
    }
    return next();
  } catch (err) {
    throw new Error(err);
  }
};

web.get('/', fixtureLayer, (req, res) => {
  axios.get(extApi, {})
    .then((response) => {
      console.log('call ext');
      storeFixture(extApi, response);
      res.json(response.data);
    });
});

const port = 8002;
web.listen(port, () => console.log(`start at port localhost:${port}`));
