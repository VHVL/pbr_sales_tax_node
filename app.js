var express = require('express');
var app = express();
var path = require('path');
var xmlparser = require('./xmlparser');
var enterjs = require('./enter.js');
var reportjs = require('./reports.js');
var flash = require('express-flash');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: path.join(__dirname, 'tmp/')});
var session = require('express-session');
var errorHandler = require('errorhandler');

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'pbr secret info',
  store: require('./database/mongoStore')
}));
app.use(flash());

if (app.get('env') === 'development') {
  app.use(express.static(path.join(__dirname, '/bower_components')));
  app.use(express.static(path.join(__dirname, '/static')));
  app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
} else {
  var oneYear = 3157600000;
  app.use(express.static(path.join(__dirname, '/bower_components'), { maxAge: oneYear }));
  app.use(express.static(path.join(__dirname, '/static'), { maxAge: oneYear }));
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
  })
  .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
    return enterjs.submit(req, res);
  });

app.route('/enter/:id')
  .get(function (req, res) {
    return enterjs.getdata(req, res);
  })
  ;

app.route('/upload')
  .get(function (req, res) {
    res.render('upload');
  })
  .post(upload.single('xmlfile'), function (req, res) {
    xmlparser(req, res);
  });

app.route('/query')
  .get(function (req, res) {
    res.render('query');
  });

app.route('/report')
  .get(function (req, res) {
    res.render('report');
  })
  .post(bodyParser.urlencoded({extended: false}), function (req, res) {
    if (req.body.numSearch) {
      return res.redirect('/report/' + req.body.reportNumber);
    }
    return res.redirect('/report/' + req.body.month + '-' + req.body.year);
  });

app.route('/report/:number/:op(print)?')
  .get(function (req, res) {
    reportjs.display(req, res);
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
    res.redirect('/');
  });

module.exports = app;
