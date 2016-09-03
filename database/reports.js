var db = require('./connection');
var Counter = require('./counter');
var ReportSchema = new db.Schema({
  number: {type: Number, unique: true},
  month: Number,
  year: Number,
  invoices: [{type: db.Schema.ObjectId, ref: 'Invoice', index: true}]
});

ReportSchema.pre('save', function (next) {
  var report = this;
  if (!report.number) {
    Counter.increment('Report', function (err, data) {
      report.number = data;
      next();
    });
  } else {
    next();
  }
});
var Report = db.model('Report', ReportSchema);
module.exports = Report;
