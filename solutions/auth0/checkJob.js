const axios = require('axios').default;

const cred = require('./credentials');

const {
  domain, token,
} = cred;

const id = process.argv.slice(2);

const getStatus = (jobId) => {
  const options = {
    method: 'GET',
    url: `https://${domain}/api/v2/jobs/${jobId}`,
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
};

module.exports = getStatus;

getStatus(id);
