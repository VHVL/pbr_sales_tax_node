// Consolidate the code to access the database here.  This should only
// be called from other modules in the database folder.
var mongoose = require('mongoose');

module.exports = (function () {
  if (typeof mongoose.connection === 'undefined' || mongoose.connection.readyState !== 1) {
    mongoose.connect('mongodb://localhost/pbr');
  }
  return mongoose;
}());
