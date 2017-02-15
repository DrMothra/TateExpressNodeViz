var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var index = require('./routes/index');
var loginUser = require('./routes/loginUser');
var update = require('./routes/update');
var modifyGraph = require('./routes/modifyGraph');
var addNode = require('./routes/addNode');
var addLink = require('./routes/addLink');
var createAccount = require('./routes/createAccount');
var graphs = require('./routes/graphs');
var http = require('http');
//Database
var Client = require('mariasql');

var app = express();

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.Server(app);

var io = require('socket.io')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

var address = '0.0.0.0';
server.listen(port, address);
//server.listen(port, '127.0.0.1');
server.on('error', onError);
server.on('listening', onListening);

//Database
var c = new Client();
c.connect( {
    host: '127.0.0.1',
    user: 'root',
    password: 'RAV4oct16',
    db: 'tate'
});

c.on('connect', function() {
  console.log("Client connected");
})
.on('error', function(err) {
  console.log("Client error: " + err);
});

var socket;

io.sockets.on('connection', function(s) {
  console.log("User connected");
  socket = s;
});

graphs.manager.emitter.on("NodeCreated", function(data) {
  console.log("Received nodes created ", data);
  socket.emit("NewNodeCreated", {msg: data});
});

graphs.manager.emitter.on("NodesToCreate", function(data) {
  console.log("Received number nodes", data);
  socket.emit("NodesToCreate", {msg: data});
});

graphs.manager.emitter.on("EdgeCreated", function(data) {
    console.log("Received edge created ", data);
    socket.emit("NewEdgeCreated", {msg: data});
});

graphs.manager.emitter.on("EdgesToCreate", function(data) {
    console.log("Received number edges", data);
    socket.emit("EdgesToCreate", {msg: data});
});

graphs.manager.emitter.on("GraphCompleted", function(data) {
    console.log("Received GraphCompleted", data);
    socket.emit("GraphCompleted", {msg: data});
});

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
//app.use(express.static('public'));
app.use(fileUpload());

app.use('/', index);
app.use('/updateNode', update);
app.use('/addNode', addNode);
app.use('/addLink', addLink);
app.use('/modifyGraph', modifyGraph);
app.use('/createAccount', createAccount);

app.post("/createGraph", graphs.generateNewGraph);
app.post("/generateGraph", graphs.generateGraph);
app.post("/searchGraph", graphs.searchGraph);
app.post("/processLinks", graphs.processLinks);
app.post("/addNewNode", graphs.addNewNode);
app.post("/addNewLink", graphs.addNewLink);
app.post("/processSearch", graphs.searchCommons);
app.post("/login", loginUser.login);
app.post("/newAccount", loginUser.createAccount);

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

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  console.log("Server = ", addr);
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
