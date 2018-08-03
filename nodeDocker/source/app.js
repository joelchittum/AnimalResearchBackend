var express = require('express');
var cors = require('cors');
var cron = require('node-cron');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var direct = require('extdirect');
var config = require('/server/utils/config');
var data = require('/server/utils/data');
var app = express();

require("console-stamp")(console);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
if (config.cors && config.cors.enabled) {
  app.use(cors(config.cors));
}

// warm up extdirect
var directApi = direct.initApi(config.direct);
var directRouter = direct.initRouter(config.direct);

// GET method returns API
app.get(config.direct.apiUrl, function(req, res, next) {
  try {
    directApi.getAPI(
      function(api) {
        res.writeHead(200, {
          'Content-Type': 'application/javascript'
        });

        res.end(api);
      }, req, res);

  } catch (exception) {
    var err = new Error('Internal Server Error');
    err.message = exception;
    err.status = 500;
    next(err);
  }
});

// ignoring any GET requests on class path
app.get(config.direct.classRouteUrl, function(req, res, next) {
  var err = new Error('Internal Server Error');
  err.message = 'Unsupported method. Use POST instead.';
  err.status = 500;
  next(err);
});

// POST request process route and calls class
app.post(config.direct.classRouteUrl, function(req, res) {
  directRouter.processRoute(req, res);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

