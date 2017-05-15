"use strict";
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let fileUpload = require('express-fileupload');
let accountRoutes = require('./routes/account');
let nodeLinkRoutes = require('./routes/nodeLinks');
let graphRoutes = require('./routes/graphs');
let http = require('http');

let app = express();

let port = process.env.PORT || '3000';
app.set('port', port);

let server = http.Server(app);

let io = require('socket.io')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

let address = '0.0.0.0';
server.listen(port, address);
server.on('error', onError);
server.on('listening', onListening);

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

//Sockets and emitters
let socket;

io.sockets.on('connection', function(s) {
    console.log("User connected");
    socket = s;
});

graphRoutes.manager.emitter.on("NodeCreated", data => {
    console.log("Received nodes created ", data);
    socket.emit("NewNodeCreated", {msg: data});
});

graphRoutes.manager.emitter.on("NodesToCreate", data => {
    console.log("Received number nodes", data);
    socket.emit("NodesToCreate", {msg: data});
});

graphRoutes.manager.emitter.on("LinkCreated", data => {
    console.log("Received link created ", data);
    socket.emit("NewLinkCreated", {msg: data});
});

graphRoutes.manager.emitter.on("LinksToCreate", data => {
    console.log("Received number links", data);
    socket.emit("LinksToCreate", {msg: data});
});

graphRoutes.manager.emitter.on("GraphCompleted", data => {
    console.log("Received GraphCompleted", data);
    socket.emit("GraphCompleted", {msg: data});
});

graphRoutes.manager.emitter.on("MapsMerged", data => {
    socket.emit("MapsMerged", {msg: data});
});

//Routing
//Main page
app.get('/', accountRoutes.home);

//User login, account validation
app.post("/processLogin", accountRoutes.validateLogin);
app.post("/processNewAccount", accountRoutes.validateNewAccount);
app.get('/createAccount', accountRoutes.createAccount);

//Node/link related functionality
app.post('/updateNode', nodeLinkRoutes.update);
app.post('/addNode', nodeLinkRoutes.addNode);
app.post('/deleteNode', nodeLinkRoutes.deleteNode);
app.post('/addLink', nodeLinkRoutes.addLink);
app.post('/deleteLink', nodeLinkRoutes.deleteLink);
app.get('/modifyMap', nodeLinkRoutes.modifyMap);
app.get('/showTimeLine', nodeLinkRoutes.showTimeLine);
app.get('/showGraphs', nodeLinkRoutes.showGraphs);
app.get('/showAuthorGraphs', nodeLinkRoutes.showAuthorGraphs);
app.get('/showViews', nodeLinkRoutes.showViews);
app.get('/mergeViews', nodeLinkRoutes.mergeViews);
app.get('/createView', nodeLinkRoutes.createView);
app.get('/createViewFrom', nodeLinkRoutes.createViewFrom);

//All graph-related functionality
app.post("/processGenerateNewGraphID", graphRoutes.generateNewGraphID);
app.post("/processCreateGraph", graphRoutes.createGraph);
app.post("/processCopyGraph", graphRoutes.copyGraph);
app.post("/processGetMapEdits", graphRoutes.getMapEdits);
//DEBUG
app.post("/processRollBack", graphRoutes.rollBack);

//Used for finding link info
app.post("/processSearchGraph", graphRoutes.searchGraph);

//Find nodes for deletion
app.post("/processFindNodes", graphRoutes.findNodes);

//Agree/disagree with links
app.post("/processLinks", graphRoutes.processLinks);

app.post("/processAddNewNode", graphRoutes.addNewNode);
app.post("/processAddNewLink", graphRoutes.addNewLink);
app.post("/processDeleteLink", graphRoutes.deleteLink);
app.post("/processDeleteNode", graphRoutes.deleteNode);

//Get all graph info
app.post("/processSearchCommons", graphRoutes.searchCommons);

app.post("/processDeleteMap", graphRoutes.deleteMap);
app.post("/processMergeMaps", graphRoutes.mergeMaps);

//Auto-complete functionality
app.post('/processGetNodeNames', graphRoutes.getNodeNames);
app.post('/processGetLinkTypes', graphRoutes.getLinkTypes);
app.post('/processGetNodeTypes', graphRoutes.getNodeTypes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
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
  let port = parseInt(val, 10);

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

  let bind = typeof port === 'string'
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
  let addr = server.address();
  console.log("Server = ", addr);
  let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
