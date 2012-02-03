var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');
var async = require('async');

// Create mongoose model
var InvModel = require('./database/invoices');

// Stores an invoice in the database.  Either inserts or updates, depending
// on which needs to be done.  Returns a function, to work with async, and provide
// the socket to emit too
function saveinvoice (invoices) {
  return function (invoice, callback) {
    InvModel.findOne({number: +invoice.Invoice}, function (err, doc) {
      var created = false;
      if (err) { throw err; }
      if (!doc) {
        doc = new InvModel();
        created = true;
      }
      doc.number = invoice.Invoice;
      doc.lastName = invoice.LastName;
      doc.firstName = invoice.FirstName;
      doc.amount = invoice.Amount;
      doc.tax = invoice.Tax;
      doc.custno = +invoice.CustNo;

      doc.save(function (err) {
        if (err) {
          invoices.error[+invoice.Invoice]={created: created, error: err};
        } else {
          invoices.good[+invoice.Invoice]={created: created};
        }
        callback();
      });
    });
  };
}

// Use closure to avoid repeating parameters in code
function cleanup (req, res, invoices, file, connection) {
  return function () {
    console.log(util.inspect(invoices));
    res.render('./upload/post', {locals: {invoices:invoices, flash:req.flash()}});
    fs.unlink(file);
    connection.close();
  };
}

module.exports = function (req, res) {
  var parser, self, invoices, file, savefunc, done;
  self = this;
  file = req.files.xmlfile.path;
  parser = new xml2js.Parser({emptyTag: ''});
  invoices = {};
  invoices.good = {};
  invoices.error = {};
  savefunc = saveinvoice(invoices);

  done = cleanup(req, res, invoices, file, mongoose.connection);

  fs.readFile(file, function (err, data) {
    if (err) {
      req.flash('error','There was an error while reading the file.  Error: ' + err);
      return done();
    }
    parser.parseString(data, function (err, result){
      if (err) {
        req.flash('error','There was an issue parsing the file.  Error: ' + err);
        return done();
      }

      async.forEach(result.SalesTaxReportPreview, savefunc, function (err) {
        if (err) {
          req.flash('error','There was an error saving the invoices.  Error: ' + err);
        }
        return done();
      });
    });
  });
};