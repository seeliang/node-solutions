const express = require('express');
const bodyParser = require('body-parser');

const port = 2233;
const api = express();
api.use(bodyParser.json());
api.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

export { api, port };
