const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//socket.io connection setup
io.on('connection', socket => {

  //setup listeners from webrtc on frontend
  socket.on('CreateHostPeer', makeHostPeer);
  socket.on('SendHostData', sendHostData);
  socket.on('SendNormalData', hostReceiveData);
});
server.listen(3000);

//functions to be called by socket.io listeners

//this will tell webrtc (in frontend) to make host peer
function makeHostPeer(){
  this.broadcast.emit('MakeHostPeer');
}

//this will tell webrtc to make another peer and to send host data to other
function sendHostData(data){
  this.broadcast.emit('MakeNormalPeer', data); //data is host's data
}

//host will receive data
function hostReceiveData(data){
  this.broadcast.emit('HostReceiveData', data); //data is normal's data
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

