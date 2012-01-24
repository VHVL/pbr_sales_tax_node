var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');
var mongoose = require('mongoose');
var sio = require('socket.io');
var async = require('async');

// Create mongoose model
var InvModel = mongoose.model('Invoice', new mongoose.Schema({
    number: {type: Number, unique: true},
    lastName: String,
    firstName: String,
    amount: Number,
    tax: Number,
    custno: Number
  }));

// Stores an invoice in the database.  Either inserts or updates, depending
// on which needs to be done.  Returns a function, to work with async, and provide
// the socket to emit too
function saveinvoice (self) {
  return function (invoice, callback) {
    InvModel.findOne({number: +invoice.Invoice}, function (err, doc) {
      var created;
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
          self.now.addInvoice('<b>Error ' + (created ? 'creating' : 'updating') +
            ' invoice number ' + (+invoice.Invoice) + '.  Msg: ' + err + '</b>');
        } else {
          self.now.addInvoice((created ? 'Created' : 'Updated') + ' invoice number ' + (+invoice.Invoice));
        }
        callback();
      });
    });
  };
}

module.exports = function (file) {
  var parser, self;
  self = this;
  console.log(util.inspect(this));
  console.log('here');
  parser = new xml2js.Parser({emptyTag: ''});
  self.now.addStatus('Parsing file.');
  mongoose.connect('mongodb://localhost/pbr');

  fs.readFile(file, function (err, data) {
    if (err) {
      return self.now.addStatus('There was an issue opening the file.  Error: ' + err);
    }
    parser.parseString(data, function (err, result){
      if (err) {
        return self.now.addStatus('There was an issue parsing the file.  Error: ' + err);
      }
      self.now.addStatus('Reading invoices.');

      async.forEach(result.SalesTaxReportPreview, saveinvoice(self), function (err) {
        if (err) {
          self.now.addStatus('There was an error saving the invoices.  Error: ' + err);
        } else {
          self.now.addStatus('Finished uploading invoices.');
        }
        fs.unlink(file);
        mongoose.connection.close();
      });
    });
  });
};