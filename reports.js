var ReportModel = require('./database/reports');

module.exports.display = function (req, res) {
  var dateInfo = req.params.number.split('-');
  if (dateInfo.length === 1) {
    ReportModel.findOne({number: req.params.number}).populate('invoices').exec(function (err, data) {
      if (err) { throw err; }
      calcTotals(req, res, [data]);
    });
  } else {
    ReportModel.find({month: dateInfo[0], year: dateInfo[1]}).populate('invoices').exec(function (err, data) {
      if (err) { throw err; }
      calcTotals(req, res, data);
    });
  }
};

function calcTotals (req, res, reports) {
  var totals = {amount: 0, tax: 0};
  for (var report of reports) {
    for (var invoice of report.invoices) {
      totals.amount += invoice.amount;
      totals.tax += invoice.tax;
    }
  }

  if (reports.length === 0) {
    return res.status(404).send('Report(s) not found!');
  }
  res.render(typeof req.params.op === 'undefined' ? 'report' : 'report/' + req.params.op, {reports: reports, totals: totals, path: req.path});
}
