const {env} = require('process');

const config = {
  DATA_STORE: env.DATA_STORE || `${__dirname}/dataBase/commentHistory.json`
};

module.exports = config;
