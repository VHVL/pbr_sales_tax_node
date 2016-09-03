var express = require('express');
var app = express();
var util = require('util');
var path = require('path');
var xmlparser = require('./xmlparser');
var enterjs = require('./enter.js');
var flash = require('express-flash');
var ReportModel = require('./database/reports');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: 'tmp/'});
var session = require('express-session');
var errorHandler = require('errorhandler');

app.use(express.query());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'pbr secret info'
}));
app.use(flash());

if (app.get('env') === 'development') {
  app.use(express.static(path.join(__dirname, '/bower_components')));
  app.use(express.static(path.join(__dirname, '/static')));
  app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
}

if (app.get('env') === 'production') {
  var oneYear = 3157600000;
  app.use(express.static(path.join(__dirname, '/bower_components', { maxAge: oneYear })));
  app.use(express.static(path.join(__dirname, '/static', { maxAge: oneYear })));
  app.use(errorHandler({
    dumpExceptions: false,
    showStack: false
  }));
}

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

app.route('/')
  .get(function (req, res) {
    res.render('index');
  });

app.route('/:page/help')
.get(function (req, res) {
  res.render(req.params.page + '/help');
});

app.route('/enter')
  .get(function (req, res) {
    res.render('enter');
  });

app.route('enter/post')
  .get(function (req, res) {
    return enterjs.getdata(req, res);
  })
  .post(function (req, res) {
    return enterjs.submit(req, res);
  });

app.route('/upload')
  .get(function (req, res) {
    res.render('upload');
  })
  .post(function (req, res) {
    xmlparser(req, res);
  });

app.route('/query')
  .get(function (req, res) {
    res.render('query');
  });

app.route('/report')
  .get(function (req, res) {
    res.render('report');
  });

app.route('/report/:number/:op(print)?')
  .get(function (req, res) {
    ReportModel.findOne({number: req.params.number}).populate('invoices').exec(function (err, data) {
      if (err) { throw err; }
      res.render(typeof req.params.op === 'undefined' ? 'report' : 'report/' + req.params.op, {report: data});
    });
  });

app.route('/users')
  .get(function (req, res) {
    res.render('users');
  });

app.route('/test')
  .get(function (req, res) {
    req.flash('error', 'error 1');
    req.flash('error', 'error 2');
    req.flash('info', 'info 1');
    req.flash('info', 'info 2');
    res.render('index', {
      flash: req.flash()
    });
  });

module.exports = app;
