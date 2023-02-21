const axios = require('axios').default;
const https = require('https');
const fs = require('fs');
const getCred = require('./getCred');
const getStatus = require('./checkJob');

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const getUrl = async (cb) => {
  const {
    domain, token, connectionId,
  } = await getCred();

  const callHeader = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };


  const options = {
    method: 'POST',
    url: `https://${domain}/api/v2/jobs/users-exports`,
    headers: callHeader,
    data: {
      connection_id: connectionId,
      format: 'json',
      fields: [{ name: 'email' }],
    },
  };
  const data = await axios.request(options).then((response) => {
    console.log('could access');
    return response.data;
  }).catch((error) => {
    console.log('has error');
    console.error(error);
  });
  if (data && data.id) {
    // console.log('job id', data.id);
    await sleep(3000);
    const jobStatus = await getStatus(data.id);
    const { location } = jobStatus;
    console.log(location);
    if (cb) {
      cb(location);
    }
  }
};
const download = (url) => {
  const file = fs.createWriteStream('export.json.gz');
  https.get(url, (response) => {
    response.pipe(file);
    // after download completed close filestream
    file.on('finish', () => {
      file.close();
      console.log('Download Completed');
    });
  });
};

getUrl(download);
