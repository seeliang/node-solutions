const axios = require('axios').default;


const getCred = require('./getCred');

const script = async () => {
  const {
    domain, token, userId,
  } = await getCred();


  const options = {
    method: 'PATCH',
    url: `https://${domain}/api/v2/users/${userId}`,
    data: { email_verified: true },
    headers: { authorization: `Bearer ${token}` },
  };

  axios.request(options).then((response) => {
    console.log(response.data);
    return response.data;
  }).catch((error) => {
    console.error(error);
  });
};

script();
