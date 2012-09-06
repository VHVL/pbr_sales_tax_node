// Used for Cloud 9 IDE Development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

var express = require('express');
var app = express.createServer();
var util = require('util');
var xmlparser = require('./xmlparser');
var enterjs = require('./enter.js');
var flash = require('connect-flash');
var ReportModel = require('./database/reports');

app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser({
    uploadDir: __dirname + '/tmp'
  }));
  app.use(express.query());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'pbr secret info'
  }));
  app.use(flash());
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.static(__dirname + '/static'));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  var oneYear = 3157600000;
  app.use(express.static(__dirname + '/static', {
    maxAge: oneYear
  }));
  app.use(express.errorHandler({
    dumpExceptions: false,
    showStack: false
  }));
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/enter', function(req, res) {
  res.render('enter');
});

app.get('/enter/post', function(req, res) {
  return enterjs.getdata(req, res);
});

app.post('/enter/post', function(req, res) {
  return enterjs.submit(req, res);
});

app.get('/upload', function(req, res) {
  res.render('upload');
});

app.post('/upload/post', function(req, res) {
  xmlparser(req, res);
});

app.get('/query', function(req, res) {
  res.render('query');
});

app.get('/report', function (req, res) {
  res.render('report');
});

app.get('/report/:number/:op(print)?', function(req, res) {
  ReportModel.findOne({number: req.params.number}).populate('invoices').exec(function(err, data) {
    if (err) { throw err; }
    res.render(typeof req.params.op === 'undefined' ? 'report' : 'report/' + req.params.op, {report: data});
  });
});

app.get('/users', function(req, res) {
  res.render('users');
});

app.get('/test', function(req, res) {
  req.flash('error', 'error 1');
  req.flash('error', 'error 2');
  req.flash('info', 'info 1');
  req.flash('info', 'info 2');
  res.render('index', {
    flash: req.flash()
  });
});

app.get('/:page/help', function(req, res) {
  res.render(req.params.page + '/help');
});

app.listen(process.env.PORT || 3000);