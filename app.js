var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var { connect } = require('mongoose');

var indexRouter = require('./routes/index');
var inputTemplateRouter = require('./routes/inputTemplate');
var generateRouter = require('./routes/generate');
var modelRouter = require('./routes/modelRoutes');
// var {serverAdapter} = require('./queue/queue');
// const rateLimiter = require('./middleware/rateLimiter');
const authenticate = require('./middleware/authenticate');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

var app = express();
function customHeaders(req, res, next) {
  res.setHeader('X-Powered-By', 'https://victorle.work');
  next();
}

app.use(customHeaders);

// Swagger UI setup
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Expose swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

//queue setup

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      autoIndex: true, // Build indexes
    };

    await connect(process.env.DB_URL);
    console.log('✅ Successfully connected to MongoDB.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Exit process with failure if this is critical to your application
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// view engine setup
app.set('trust proxy', true /* number of proxies between user and server */)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use((req, res, next) => {
//   res.setHeader('X-Engineered-By', 'victorle');
//   res.setHeader('X-Engineer-Website', 'https://victorle.work');
//   res.setHeader('X-Engineer-Email', 'contact@victorle.work');
//   next();
// });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/sw.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send('// no-op service worker');
});

app.use('/', indexRouter);
app.use('/inputTemplate', inputTemplateRouter);
app.use('/model', modelRouter);
app.use('/generate', generateRouter);
// app.use('/admin/queues', serverAdapter.getRouter());


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log("Final Error Handling Middleware: " + err.message + " " + req.ip);
  res.locals.error = req.app.get('env') === 'development' ? `err` : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
