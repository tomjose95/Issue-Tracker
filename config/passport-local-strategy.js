const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/user");

// authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      let hashedPassword = await bcrypt.hash(password, 10);
      // find a user and establish the identity
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }

        if (user && bcrypt.compareSync(password, user.password)) {
          return done(null, user);
        }
        req.flash("error", "Invalid Username/Password");
        return done(null, false);
      });
    }
  )
);

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err) {
      console.log("Error in finding user --> Passport");
      return done(err);
    }

    return done(null, user);
  });
});

// check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
  // if the user is signed in, then pass on the request to the next function(controller's action)
  if (req.isAuthenticated()) {
    return next();
  }

  // if the user is not signed in
  return res.redirect("/");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    console.log("req.user :>> ", req.user);
    res.locals.users = req.user;
    console.log("res.locals.user :>> ", res.locals.users);
  }

  next();
};

module.exports = passport;
