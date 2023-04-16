require("dotenv").config();
const express = require("express");
const port = 3000;
const path = require("path");
var expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");
const session = require("express-session");
const sassMiddleware = require("node-sass-middleware");
const multer = require("multer");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const flash = require("connect-flash");
const customMware = require("./config/middleware");
const MongoStore = require("connect-mongo")(session);
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
app.use(express.urlencoded());
app.use(express.static("./assests"));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  session({
    name: "issuetracker",
    secret: "project",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: new MongoStore(
      {
        mongooseConnection: db,
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "connect-mongodb setup ok");
      }
    ),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);

app.use("/", require("./routes"));
app.listen(port, (err) => {
  if (err) {
    console.log("Error in running server at PORT :>> ", port);
  }
  console.log("Server is running at port :>> ", port);
});
