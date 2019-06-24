var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressValidator = require("express-validator");
var passport = require("passport");
var session = require("express-session");
require("./passport");
var indexRoute = require("./routes/index");
var authRoute = require("./routes/auth");
var taskRoute = require("./routes/task");

var mongoose = require("mongoose");
var config = require("./config");
mongoose
  .connect(config.dbConnstring, {
    useCreateIndex: true,
    useNewUrlParser: true
  })
  .then(() => console.log("mongodb connecton established successfully"))
  .catch(err => console.log(err));
global.User = require("./models/user");
global.Task = require("./models/tasks");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // always run before session()
app.use(expressValidator());

/*
When a client makes an HTTP request, and that request doesn't contain a session 
cookie, a new session will be created by express-session. 
Creating a new session does a few things:
1.Generate a unique session id
2.Store that session id in a session cookie (so subsequent requests made by the client can be identified)
3.Create an empty session object, as req.session depending on the value of 
saveUninitialized, at the end of the request, the session object will be stored in the session store (which is generally some sort of database)
*/
app.use(
  //configuration for session for passport working
  session({
    secret: config.sessionKey, // used to encrypt data before getting stored
    resave: false, //What this does is tell the session store that a particular session is still active, which is necessary because some stores will delete idle (unused) sessions after some time.
    saveUninitialized: false // means session object will be stored in the session store if session object is modified or not. if we make it true, session object will store only when it is changes thoughout the session
    // ,cookie: {maxAge:60000}  By maxAge we set the time for  expiry of session. Here, session will expire after 1 min
  })
);
app.use(passport.initialize()); //responsible for bootstrapping the Passport module
app.use(passport.session()); // it using the Express session to keep track of your user’s session.

app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

app.use("/", indexRoute);
app.use("/", taskRoute);
app.use("/auth", authRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

var server = app.listen(3000, () => {
  console.log("server is running on 3000");
});
require("./socket-server")(server); //runnig socketIO with the same server

// module.exports = app; // exporting it to www file which run server using http but here we running express server
