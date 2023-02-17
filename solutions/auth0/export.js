const axios = require('axios').default;
const cred = require('./credentials');

const {
  domain, token, connectionId,
} = cred;


const options = {
  method: 'POST',
  url: `https://${domain}/api/v2/jobs/users-exports`,
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  },
  data: {
    connection_id: connectionId,
    format: 'json',
    limit: 300,
    fields: [{ name: 'email' }, { name: 'identities[0].connection', export_as: 'provider' }],
  },
};

axios.request(options).then((response) => {
  console.log(response.data);
}).catch((error) => {
  console.error(error);
});
