var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');

// Accpets the request object, and parses out the XML objects
module.exports = function (req, res) {
  var parser = new xml2js.Parser();
  console.log(req.files.xmlfile);
  fs.readFile(req.files.xmlfile.path, function (err, data) {
    if (err) { throw err; }
      parser.parseString(data, function (err, result) {
        fs.unlink(req.files.xmlfile.path);
        res.end(util.inspect(result, false, null));

      });
    });
  return;
};