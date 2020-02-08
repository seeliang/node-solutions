const express = require('express');
const bodyParser = require('body-parser');

const port = 8001;
const api = express();
api.use(bodyParser.json());
api.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

api.listen(port, () => {
  console.log(`api is running on port ${port}`);
});

api.get('/get/users', (req, res) => {
  const users = [{ admin: 'joe' }, { user: 'lee' }];
  res.json(users);
});

api.post('/post/users', (req, res) => {
  const data = req.body;
  console.log(data);
  res.send(`POST request to success ${JSON.stringify(data)}`);
});
