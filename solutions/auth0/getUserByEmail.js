const axios = require('axios').default;


const getCred = require('./getCred');

const script = async () => {
  const {
    domain, token, email,
  } = await getCred();


  const options = {
    method: 'GET',
    url: `https://${domain}/api/v2/users-by-email`,
    params: { email },
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
