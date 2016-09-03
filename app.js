// Used for Cloud 9 IDE Development
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV='development';
}

var express = require('express');
var app = express.createServer();
var util = require('util');
var nowjs = require('now');
var everyone = nowjs.initialize(app);

everyone.now.parseFile = require('./xmlparser.js');

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser({uploadDir:__dirname + '/tmp'}));
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.static(__dirname + '/static'));
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function () {
  var oneYear = 3157600000;
  app.use(express.static(__dirname + '/static', { maxAge: oneYear }));
  app.use(express.errorHandler({dumpExceptions: false, showStack: false}));
});

app.set('views',__dirname + '/views');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/enter', function (req, res) {
  res.render('enter');
});

app.post('/enter/post', function (req, res) {
  res.end('stub')
});

app.get('/upload', function (req, res) {
  res.render('upload');
});

app.post('/upload/post', function (req, res) {
  res.render('upload/post', { xmlfile: req.files.xmlfile.path });
  //require('./xmlparser')(req, res, app);
});

app.get('/query', function (req, res) {
  res.render('query');
});

app.get('/report', function (req, res) {
  res.render('report');
});

app.get('/users', function (req, res) {
  res.render('users');
});

app.get('/:page/help', function (req, res) {
  res.render(req.params.page + '/help');
});

app.listen(process.env.PORT);