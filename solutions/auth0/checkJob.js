const axios = require('axios').default;
const getCred = require('./getCred');

const id = process.argv.slice(2);

const getStatus = async (jobId) => {
  // console.log(jobId);
  const {
    domain, token,
  } = await getCred();
  const options = {
    method: 'GET',
    url: `https://${domain}/api/v2/jobs/${jobId}`,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  };

  let status = {};

  await axios.request(options).then((response) => {
    // console.log(response.data);
    status = response.data;
  }).catch((error) => {
    console.error(error);
  });

  console.log('status', status);
  return status;
};

module.exports = getStatus;

getStatus(id);