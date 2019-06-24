var router = require("express").Router();
var passport = require("passport");
var User = require("../models/user");

router
  .route("/login")
  .get(function(req, res, next) {
    res.render("login", { title: "Login Your Account" });
  })
  .post(
    passport.authenticate("local", {
      failureRedirect: "/auth/login"
    }),
    function(req, res) {
      res.redirect("/");
    }
  );

router
  .route("/register")
  .get(function(req, res, next) {
    res.render("register", { title: "Register a new Account" });
  })
  .post(function(req, res, next) {
    req.checkBody("name", "Empty Name").notEmpty();
    req.checkBody("email", "Invalid Name").isEmail();
    req.checkBody("password", "Empty Password").notEmpty();
    req
      .checkBody("password", "Password do not match")
      .equals(req.body.confirmPassword)
      .notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        name: req.body.name,
        email: req.body.email,
        errorMessages: errors
      });
    } else {
      var user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.setPassword(req.body.password);
      user.save(function(err) {
        if (err) {
          res.render("register", { errorMessages: err });
        } else {
          res.redirect("/auth/login");
        }
      });
    }
  });

router.get("/logout", function(req, res, next) {
  req.logout();
  // req.session.destroy();
  res.redirect("/");
});

router.get("/facebook", passport.authenticate("facebook", { scope: "email" }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/auth/login"
  })
);
module.exports = router;
