require('dotenv').config({path: '../.env'});
const pkg = require('../../../package.json');
process.env.VERSION = pkg.version;
export default process.env;