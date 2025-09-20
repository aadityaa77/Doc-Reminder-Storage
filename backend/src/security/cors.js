const cors = require('cors');
const { corsOrigin } = require('../config/env');

module.exports = () => cors({
  origin: corsOrigin,
  credentials: true
});
