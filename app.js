var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var accountRoutes = require('./routes/account');
var nodeLinkRoutes = require('./routes/nodeLinks');
var graphRoutes = require('./routes/graphs');
var http = require('http');

var app = express();

var port = process.env.PORT || '3000';
app.set('port', port);

var server = http.Server(app);

var io = require('socket.io')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

var address = '0.0.0.0';
server.listen(port, address);
server.on('error', onError);
server.on('listening', onListening);

//Sockets and emitters
var socket;

io.sockets.on('connection', function(s) {
  console.log("User connected");
  socket = s;
});

graphRoutes.manager.emitter.on("NodeCreated", function(data) {
  console.log("Received nodes created ", data);
  socket.emit("NewNodeCreated", {msg: data});
});

graphRoutes.manager.emitter.on("NodesToCreate", function(data) {
  console.log("Received number nodes", data);
  socket.emit("NodesToCreate", {msg: data});
});

graphRoutes.manager.emitter.on("EdgeCreated", function(data) {
    console.log("Received edge created ", data);
    socket.emit("NewEdgeCreated", {msg: data});
});

graphRoutes.manager.emitter.on("EdgesToCreate", function(data) {
    console.log("Received number edges", data);
    socket.emit("EdgesToCreate", {msg: data});
});

graphRoutes.manager.emitter.on("GraphCompleted", function(data) {
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

//Routing
//Main page
app.get('/', accountRoutes.home);

//User login, account validation
app.post("/login", accountRoutes.login);
app.post("/newAccount", accountRoutes.newAccount);
app.get('/createAccount', accountRoutes.createAccount);

//Node/link related functionality
app.post('/updateNode', nodeLinkRoutes.update);
app.post('/addNode', nodeLinkRoutes.addNode);
app.post('/deleteNode', nodeLinkRoutes.deleteNode);
app.post('/addLink', nodeLinkRoutes.addLink);
app.post('/deleteLink', nodeLinkRoutes.deleteLink);
app.get('/modifyGraph', nodeLinkRoutes.modify);
app.get('/showGraphs', nodeLinkRoutes.showGraphs);

//All graph-related functionality
app.post("/createGraph", graphRoutes.generateNewGraph);
app.post("/generateGraph", graphRoutes.generateGraph);
app.post("/copyGraph", graphRoutes.copyGraph);
app.post("/searchGraph", graphRoutes.searchGraph);
app.post("/findNodes", graphRoutes.findNode);
app.post("/processLinks", graphRoutes.processLinks);
app.post("/addNewNode", graphRoutes.addNewNode);
app.post("/addNewLink", graphRoutes.addNewLink);
app.post("/deleteALink", graphRoutes.deleteALink);
app.post("/deleteANode", graphRoutes.deleteANode);
app.post("/processSearch", graphRoutes.searchCommons);
app.post("/deleteGraph", graphRoutes.deleteGraph);
app.post('/getNodeNames', graphRoutes.getNodeNames);
app.post('/getLinkTypes', graphRoutes.getLinkTypes);
app.post('/getNodeTypes', graphRoutes.getNodeTypes);

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
