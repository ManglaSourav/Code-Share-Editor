const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const config = require("./config");

/*
The basic idea about serialization and deserialization is, when a user is 
authenticated, Passport will save the user’s _id property to the session as 
req.session.passport.user. 
Later on when the user object is needed, Passport will use the _id property 
to grab the user object from the database. The reason why we don’t save the 
entire user object in session are: 
1. Reduce the size of the session; 
2. It’s much safer to not save all the user information in the session in case 
of misuse.
*/

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, function(err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    function(username, password, done) {
      User.findOne({ email: username }, function(err, user) {
        //handle error
        if (err) return done(err);
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password"
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, {
            message: "incorrect username or password"
          });
        }
        // all good return user
        return done(null, user);
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: config.fb.FACEBOOK_APP_ID,
      clientSecret: config.fb.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"]
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({ facebookId: profile.id }, function(err, user) {
        if (err) return done(err);

        if (user) {
          //If user already exists
          return done(null, user);
        } else {
          //if user exist but this time he/she logged in using facebook
          User.findOne({ email: "profile.emails[0].value" }, function(
            err,
            user
          ) {
            if (user) {
              user.facebookId = profile.id;
              return user.save(function(err) {
                if (err)
                  return done(null, false, { message: "Can't save user info" });
                return done(null, user);
              });
            }
            // Sign Up new User
            var user = new User();
            user.name = profile.displayName;
            user.email = profile.emails[0].value;
            user.facebookId = profile.id;
            user.save(function(err) {
              if (err)
                return done(null, false, { message: "Can't save user info" });
              return done(null, user);
            });
          });
        }
      });
    }
  )
);
