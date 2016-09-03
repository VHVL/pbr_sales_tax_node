var fs = require('fs');
var xml2js = require('xml2js');
var async = require('async');

// Create mongoose model
var InvModel = require('./database/invoices');

// Stores an invoice in the database.  Either inserts or updates, depending
// on which needs to be done.  Returns a function, to work with async

function saveinvoice (invoices) {
  return function (invoice, callback) {
    InvModel.findOne({
      number: +invoice.Invoice
    }, function (err, doc) {
      var created = false;
      if (err) {
        throw err;
      }
      if (!doc) {
        doc = new InvModel();
        created = true;
      }
      doc.number = +invoice.Invoice;
      doc.lastName = invoice.LastName;
      doc.firstName = invoice.FirstName;
      doc.amount = invoice.Amount;
      doc.tax = invoice.Tax;
      doc.custno = invoice.CustNo;

      doc.save(function (err) {
        if (err) {
          invoices.error[+invoice.Invoice] = {
            created: created,
            error: err
          };
        } else {
          invoices.good[+invoice.Invoice] = {
            created: created
          };
        }
        callback();
      });
    });
  };
}

// Use closure to avoid repeating parameters in code

function cleanup (req, res, invoices, file) {
  return function () {
    res.render('./upload/post', {
      invoices: invoices,
      flash: req.flash()
    });
    fs.unlink(file, function (err) {
      if (err) { throw err; }
    });
  };
}

module.exports = function (req, res) {
  var parser, self, invoices, file, savefunc, done;
  self = this;
  file = req.file.path;
  parser = new xml2js.Parser({
    emptyTag: ''
  });
  invoices = {};
  invoices.good = {};
  invoices.error = {};
  savefunc = saveinvoice(invoices);

  done = cleanup(req, res, invoices, file);

  fs.readFile(file, function (err, data) {
    if (err) {
      req.flash('error', 'There was an error while reading the file.  Error: ' + err);
      return done();
    }
    parser.parseString(data, function (err, result) {
      var invoiceData = [];
      if (err) {
        req.flash('error', 'There was an issue parsing the file.  Error: ' + err);
        return done();
      }
      // Invoices can have multiple entries, so only get the last one.
      var invoice;
      for (var idx in result.NewDataSet.SalesTaxReportPreview) {
        var invoiceLine = result.NewDataSet.SalesTaxReportPreview[idx];
        for (var prop in invoiceLine) {
          if (invoiceLine.hasOwnProperty(prop)) {
            invoiceLine[prop] = invoiceLine[prop][0];
          }
        }

        invoiceLine.Invoice = convertInteger(invoiceLine.Invoice, null);
        invoiceLine.Amount = convertInteger(invoiceLine.Amount, 0);
        invoiceLine.Tax = convertInteger(invoiceLine.Tax, 0);

        if (!invoice || invoice.Invoice !== invoiceLine.Invoice) { // New invoice, save the old one
          invoice && invoiceData.push(invoice);
          invoice = invoiceLine;
          invoice.CustNo = convertInteger(invoice.CustNo, null);
        } else { // Total up the lines of the invoice
          invoice.Amount += convertInteger(invoiceLine.Amount, 0);
          invoice.Tax += convertInteger(invoiceLine.Tax, 0);
        }
      }
      async.forEach(invoiceData, savefunc, function (err) {
        if (err) {
          req.flash('error', 'There was an error saving the invoices.  Error: ' + err);
        }
        return done();
      });
    });
  });
};

function convertInteger (value, defaultValue) {
  if (isNaN(+value)) return defaultValue;
  return +value;
}
