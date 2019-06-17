var express = require("express");
var router = express.Router();

var nodeMailer = require("nodemailer");
var config = require("../config");
var transporter = nodeMailer.createTransport(config.mailer);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/home", function(req, res, next) {
  res.render("home", { title: "from home" });
});

router.get("/about", (req, res) => {
  res.render("about", { title: "data from about end point" });
});

router
  .route("/contact")
  .get((req, res, next) => {
    res.render("contact", { title: " Contact Us " });
  })
  .post((req, res, next) => {
    req.checkBody("name", "Empty Name").notEmpty();
    req.checkBody("email", "Invalid Email").isEmail();
    req.checkBody("message", "Empty Message").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      res.render("contact", {
        title: "Error",
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        errorMessages: errors
      });
    } else {
      //if we got all data from user
      var mailOption = {
        from: "Code Share App",
        to: "findvalueofy@gmail.com",
        subject: " You got a new message from visitor 🤓",
        text: req.body.message
      };
      transporter.sendMail(mailOption, function(error, info) {
        if (error) {
          return console.log(error);
        }
        res.render("thank", { data: "post from /contact" });
      });
    }
  });

module.exports = router;
