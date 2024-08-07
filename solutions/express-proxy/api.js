const httpProxy = require('http-proxy');

const express = require('express');

const port = 8001;
const api = express();

const proxy = httpProxy.createProxyServer();

const shallUseExpressJsonBeforeProxy = false;

const loadExpressJson = () => {
  api.use(express.json());
};

// proxy get
const externalGetProxy = (req, res) => proxy.web(
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
api.use('/word', externalGetProxy);
// end of proxy get

if (shallUseExpressJsonBeforeProxy) {
  loadExpressJson(); // this would break socket
}

// proxy post
const externalPostProxy = (req, res) => {
  console.log('post body:', req.body); // would like to access req body with response to create static caching
  return proxy.web(
    req,
    res,
    {
      target: 'https://webhook.site/5919eca3-f02e-4ab1-ac31-2a95a8ec9904',
      changeOrigin: true,
    },
    (err) => {
      console.error(err);
    },
  );
};
api.use('/post-ext', externalPostProxy);
// end of proxy post

if (!shallUseExpressJsonBeforeProxy) {
  loadExpressJson(); // this will make post body empty
}

api.listen(port, () => {
  console.log(`api is running on port ${port}`);
});


api.get('/get/users', (req, res) => {
  const users = [{ admin: 'joe' }, { user: 'lee' }];
  res.json(users);
});


api.post('/post/users', (req, res) => {
  const data = req.body;
  console.log(data); // with express.json(), req.body works
  res.send(`POST request to success ${JSON.stringify(data)}`);
});
