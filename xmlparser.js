var formidable = require('formidable');
var util = require('util');

// Accpets the request object, and parses out the XML objects
module.exports = function (req, res) {
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.parse(req, function (err, fields, files) {
    if (err) { throw err; }
    res.send(util.inspect({fields: fields, files: files}));
  });
  return;
}