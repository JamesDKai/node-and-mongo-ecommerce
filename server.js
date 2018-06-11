// require express library
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsEngine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');

var secret = require('./config/secret');
var User = require('./models/User');
var Category = require('./models/category');

var cartLength = require('./middlewares/middlewares');

// create express object variable to shorten it
var app = express();

mongoose.connect(secret.database, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the databse");
  }
});

// to run Middlewares
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine('ejs', ejsEngine);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({ secret: '123' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.session = req.session;
  next();
});
app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {
    if (err) return (err);
    res.locals.categories = categories;
    next();
  });
});

app.use(cartLength);

// Router
var mainRoutes = require('./routes/main');
app.use(mainRoutes);
var userRoutes = require('./routes/user');
app.use(userRoutes);
var adminRoutes = require('./routes/admin')
app.use(adminRoutes);
var apiRoutes = require('./API/api');
app.use('/api', apiRoutes);

// start server on port 3000
app.listen(secret.port, function(err) {
  if (err) throw err;
  console.log("Server is running on port " + secret.port);
});
