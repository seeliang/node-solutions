const axios = require('axios').default;

const cred = require('./credentials');

const {
  domain, clientId, clientSecret, audience,
} = cred;


const options = {
  method: 'POST',
  url: `https://${domain}/oauth/token`,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  data: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    audience,
  }),
};

const getToken = async () => {
  const data = await axios.request(options).then((response) => response.data).catch((error) => {
    console.error(error);
  });
  // console.log(data);
  return data.access_token;
};

module.exports = getToken;
getToken();
