const express = require("express");
const router = express.Router();
const passport = require("passport");
const homeController = require("./../controllers/home_Controller");
router.get("/", homeController.home);
console.log("Index Router Loaded");
router.get("/project/:id", homeController.project);
router.get(
  "/profile/:id",
  passport.checkAuthentication,
  homeController.profile
);
router.get("/sign-in", homeController.signin);
router.get("/sign-up", homeController.signup);
router.get("/sign-out", homeController.destroySession);
router.post("/update/:id", passport.checkAuthentication, homeController.update);
router.post(
  "/create-project",
  passport.checkAuthentication,
  homeController.createProject
);
router.post(
  "/create-issue",
  passport.checkAuthentication,
  homeController.createIssue
);
router.post("/create", homeController.create);
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "back" }),
  homeController.createSession
);
module.exports = router;
