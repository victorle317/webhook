require('dotenv').config();

function checkRequiredEnv() {
  const requiredEnv = [
      // 'REDIS_URL',
      // 'REDIS_USER',
      // 'REDIS_PWD',
      // 'QUEUE_NAME',
      // 'DB_URL',
      // 'TXT2IMG_API_URL',
      // 'FACE_API_URL',
      // 'MASTER_SERVER_ADDR',
      // 'PORT',
      // 'CONCURRENCY_FACTOR',
      // 'MAX_PLAYER_TURNS',
      // 'CLIENT_AUTH_TOKEN'    
  ];

  requiredEnv.forEach((env) => {
      if (!process.env[env]) {
          console.error(`Environment variable ${env} is missing`);
          process.exit(1);
      }
  });

  console.log('All required environment variables are set');
}

checkRequiredEnv();

var app = require('./app');
var debug = require('debug')('expresstest:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

//7-1 

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port,() => {
  console.log(`Server is running on port ${port}`);
 });
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

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

/**
 * Event listener for HTTP server "error" event.
 */

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
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
