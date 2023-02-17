const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('fs');
const cred = require('./credentials');

const {
  domain, token, file, connectionId,
} = cred;

const script = async () => {
  const formData = new FormData();
  formData.append('connection_id', connectionId); // Replace with correct connection ID
  formData.append('users', fs.createReadStream(file));

  try {
    const res = await axios.post(`https://${domain}/api/v2/jobs/users-imports`, formData, {
      headers: { ...formData.getHeaders(), authorization: `Bearer ${token}` },
    });
    console.log(res.data);
  } catch (err) {
    console.log(err);
  }
};

script();
