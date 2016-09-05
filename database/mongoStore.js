const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

module.exports = new MongoStore({
  mongooseConnection: require('./connection').connection,
  touchAfter: 3600
});
