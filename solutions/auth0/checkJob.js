const axios = require('axios').default;

const cred = require('./credentials');

const {
  domain, token,
} = cred;

const id = process.argv.slice(2);
const options = {
  method: 'GET',
  url: `https://${domain}/api/v2/jobs/${id}`,
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
  },
};

console.log(id);

axios.request(options).then((response) => {
  console.log(response.data);
}).catch((error) => {
  console.error(error);
});
