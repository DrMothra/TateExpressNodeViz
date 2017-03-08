var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var start = require('./routes/start');
var loginUser = require('./routes/loginUser');
var update = require('./routes/update');
var addNode = require('./routes/addNode');
var deleteNode = require('./routes/deleteNode');
var addLink = require('./routes/addLink');
var deleteLink = require('./routes/deleteLink');
var createAccount = require('./routes/createAccount');
var graphs = require('./routes/graphs');
var modify = require('./routes/modify');
var show = require('./routes/show');
var http = require('http');

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
server.on('error', onError);
server.on('listening', onListening);

//Sockets and emitters
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

//Routing
//Main page
app.use('/', start);

//User login, account validation
app.post("/login", loginUser.login);
app.post("/newAccount", loginUser.createAccount);
app.use('/createAccount', createAccount);

//Node/link related functionality
app.post('/updateNode', update.update);
app.post('/addNode', addNode.addNode);
app.post('/deleteNode', deleteNode.deleteNode);
app.post('/addLink', addLink.addLink);
app.post('/deleteLink', deleteLink.deleteLink);
app.use('/modifyGraph', modify.modify);
app.use('/showGraphs', show.showGraphs);

//All graph-related functionality
app.post("/createGraph", graphs.generateNewGraph);
app.post("/generateGraph", graphs.generateGraph);
app.post("/copyGraph", graphs.copyGraph);
app.post("/searchGraph", graphs.searchGraph);
app.post("/findNodes", graphs.findNode);
app.post("/processLinks", graphs.processLinks);
app.post("/addNewNode", graphs.addNewNode);
app.post("/addNewLink", graphs.addNewLink);
app.post("/deleteALink", graphs.deleteALink);
app.post("/deleteANode", graphs.deleteANode);
app.post("/processSearch", graphs.searchCommons);
app.post("/deleteGraph", graphs.deleteGraph);
app.post('/getNodeNames', graphs.getNodeNames);
app.post('/getLinkTypes', graphs.getLinkTypes);
app.post('/getNodeTypes', graphs.getNodeTypes);


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
