const httpProxy = require('http-proxy');

const express = require('express');

const port = 8001;
const api = express();
api.use(express.json());
api.use(
  express.urlencoded({
    extended: true,
  }),
);


const proxy = httpProxy.createProxyServer();

const externalProxy = (req, res) => proxy.web(
  req,
  res,
  {
    target: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    changeOrigin: true,
  },
  (err) => {
    console.error(err);
  },
);

api.listen(port, () => {
  console.log(`api is running on port ${port}`);
});

api.use('/word', externalProxy);


api.get('/get/users', (req, res) => {
  const users = [{ admin: 'joe' }, { user: 'lee' }];
  res.json(users);
});

api.post('/post/users', (req, res) => {
  const data = req.body;
  console.log(data);
  res.send(`POST request to success ${JSON.stringify(data)}`);
});
