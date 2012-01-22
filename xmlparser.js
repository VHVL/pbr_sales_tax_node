var formidable = require('formidable');
var util = require('util');

// Accpets the request object, and parses out the XML objects
module.exports = function (req, res) {
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.on('file', function(field, file){
    console.log(field, file);
  });
  form.parse(req);
  return;
};