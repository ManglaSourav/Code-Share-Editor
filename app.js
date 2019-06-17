var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressValidator = require("express-validator");
var passport = require("passport");
var session = require("express-session");

var indexRoute = require("./routes/index");
var authRoute = require("./routes/auth");

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

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(
  //configuration for session for passport working
  session({
    secret: config.sessionKey,
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

app.use("/", indexRoute);
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
app.listen(3000, () => {
  console.log("server is running on 3000");
});

module.exports = app;
