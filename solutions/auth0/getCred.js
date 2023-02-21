const credentials = require('./credentials');
const getToken = require('./getToken');

const getFullCred = async () => {
  const token = await getToken();
  return { ...credentials, token };
};

module.exports = getFullCred;
