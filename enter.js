// Server side functionality for enter invoices page
var InvModel = require('./database/invoices');
var ReportModel = require('./database/reports');
var async = require('async');

module.exports.getdata = function (req, res) {
  var invno = req.params.id;
  InvModel.findOne({
    number: invno
  }, function (err, doc) {
    if (err) {
      throw err;
    }
    if (doc) {
      res.render('partials/enter/good', {
        invoice: doc
      }, function (err, content) {
        if (err) { throw err; }
        res.json({
          status: 1,
          html: content
        });
      });
    } else {
      res.render('partials/enter/bad', {
        invoice: {
          number: invno
        }
      }, function (err, content) {
        if (err) { throw err; }
        res.json({
          status: 0,
          html: content
        });
      });
    }
  });
};

module.exports.submit = function (req, res) {
  var issues = [];
  var month = +req.body.month;
  var year = +req.body.year;
  var report = new ReportModel();

  if (month % 1 || month < 1 || month > 12) {
    issues.push('Invalid month');
  }
  if (year % 1 || year === 0) {
    issues.push('Invalid year');
  }
  if (issues.length) {
    res.json({issues: issues});
  }
  report.month = month;
  report.year = year;
  async.forEach(req.body.invoices, addToReport(report), function (err) {
    if (err) { throw err; }
    report.save(function (err) {
      if (err) { throw err; }
      res.json({report: report.number});
    });
  });
};

function addToReport (report) {
  return function (invoice, callback) {
    console.log(invoice);
    InvModel.findOne({
      number: invoice.number
    }, function (err, inv) {
      if (err) { throw err; }
      if (!inv) {
        console.log('creating invoice');
        inv = new InvModel();
        inv.number = invoice.number;
        inv.lastName = invoice.lastName;
        inv.firstName = invoice.firstName;
        inv.amount = invoice.amount;
        inv.tax = invoice.tax;
        inv.save(function (err) {
          if (err) { throw err; }
          report.invoices.push(inv._id);
          callback();
        });
      } else {
        console.log('using existing invoice');
        report.invoices.push(inv._id);
        callback();
      }
    });
  };
}
