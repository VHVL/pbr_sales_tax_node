// Server side functionality for enter invoices page
var InvModel = require('./database/invoices');
var util = require('util');

module.exports.getdata = function (req, res) {
  var invno = req.body.invno;
  InvModel.findOne({number: invno}, function (err, doc) {
    if (err) {
      throw err;
    }
    if (doc) {
      return res.render('partials/enter/good', {layout: false, invoice:doc});
    }
    return res.end('no invoice');
  });
};