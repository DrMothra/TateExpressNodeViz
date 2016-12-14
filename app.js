var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var gc = require("graphcommons");
var accesskey = process.env.GRAPH_COMMONS_API_KEY;
var graphcommons = new gc(accesskey, function(result) {
    console.log("Created graph commons = ", result);
});
var graph_id = "288bd5c8-f7e1-4bf4-945b-4a65bdfc749a";

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.post("/process_post", function(req, res) {
    var graphData = {
        "name": "My express test graph",
        "description": "Tester",
        "status": 0
    };
    graphcommons.new_graph(graphData, function(result) {
        console.log(result.properties.id);
        res.render("index", { graphID: result.properties.id });
    });
});

app.post("/process_search", function(req, res) {
    var search_query = {
        "query": req.body.nodeValue,
        "graph": req.body.graph_id
    };
    graphcommons.nodes_search(search_query, function(results) {
        console.log(results);
        res.render("index", { graphID: req.body.graph_id});
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
