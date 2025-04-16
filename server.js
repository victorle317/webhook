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

async function startServer() {
  try {
    // const swaggerPath = path.join(__dirname, './swagger/swagger.yaml');
    // const swaggerPath2 = path.join(__dirname, './swagger/swagger.json');
    // const swaggerPath3 = path.join(__dirname, './swagger/swagger1.yaml');
    // // console.log('Loading Swagger from:', swaggerPath);
    // // const swaggerDoc = await SwaggerParser.dereference(swaggerPath);

    // // //save to file
    // // fs.writeFileSync(swaggerPath2, JSON.stringify(swaggerDoc, null, 2));
    // // fs.writeFileSync(swaggerPath3, YAML1.stringify(swaggerDoc));

    // const file  = fs.readFileSync(swaggerPath3, 'utf8')
    // const swaggerDocument = yaml.parse(file)
    // app.setSwaggerDocs(swaggerDocument);
    app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log('📌 Registered route:', r.route.path);
      }
    });
    
    server.listen(port, () => {
      
      console.log(`✅ Server running at http://localhost:${port}`);
      console.log(`📘 Swagger UI: http://localhost:${port}/api`);
    });
    server.on('error', onError);
    server.on('listening', onListening);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();



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
