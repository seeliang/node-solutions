const axios = require('axios').default;
const cred = require('./credentials');

const {
  domain, token, file, connectionId, externalId,
} = cred;
const options = {
  method: 'POST',
  url: `https://${domain}/api/v2/jobs/users-imports`,
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
  },
  data: `-----011000010111000001101001\r\nContent-Disposition: form-data; name="users"; filename="${file}"\r\nContent-Type: text/json\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name="connection_id"\r\n\r\n${connectionId}\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name="external_id"\r\n\r\n${externalId}\r\n-----011000010111000001101001--\r\n`,
};

axios.request(options).then((response) => {
  console.log(response.data);
}).catch((error) => {
  console.error(error);
});
