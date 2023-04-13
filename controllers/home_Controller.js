const User = require("./../models/user");
const Issue = require("./../models/Issue");
const Project = require("./../models/project");
const passport = require("passport");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

module.exports.signin = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return res.render("sign_in", {
    title: "Sign In | Issue Tracker",
  });
};

module.exports.signup = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return res.render("sign_up", {
    title: "Sign Up | Issue Tracker",
  });
};
module.exports.home = async (req, res) => {
  let projects = await Project.find({})
    .sort("-createdAt")
    .populate("user")
    .populate({
      path: "issues",
      populate: {
        path: "user",
      },
    });
  let projectCount = await Project.find({}).count();
  let userCount = await User.find({}).count();
  let users = await User.find({}).sort({ _id: 1 }).limit(5);
  let projectMonthCount = await Project.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);
  let projectYearCount = await Project.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);

  let projectTodayCount = await Project.aggregate([
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);
  console.log("projectTodayCount :>> ", projectTodayCount);
  return res.render("home", {
    title: "Issue Tracker | Home",
    project: projects,
    user: users,
    projectCount: projectCount,
    userCount: userCount,
    projectMonthCount: projectMonthCount,
    projectYearCount: projectYearCount,
    projectTodayCount: projectTodayCount,
  });
};

module.exports.project = async (req, res) => {
  console.log("req.params.id :>> ", req.params.id);
  let issueCount = await Project.aggregate([
    {
      $match: {
        id: req.params.id,
      },
    },
    {
      $project: {
        count: { $size: "$issue" },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
      },
    },
  ]);
  let userCount = await User.find({}).count();
  let users = await User.find({}).sort({ _id: 1 }).limit(5);
  let projectMonthCount = await Project.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);
  let projectYearCount = await Project.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);

  let projectTodayCount = await Project.aggregate([
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);
  let projects = await Project.findById(req.params.id)
    .populate("user")
    .populate({
      path: "issues",
      populate: {
        path: "user",
      },
    });
  return res.render("project_details", {
    title: "Issue Tracker | project",
    project: projects,
    user: users,
    issueCount: issueCount,
    userCount: userCount,
    projectMonthCount: projectMonthCount,
    projectYearCount: projectYearCount,
    projectTodayCount: projectTodayCount,
  });
};

module.exports.profile = async (req, res) => {
  let projectCount = await Project.find({}).count();
  let userCount = await User.find({}).count();
  let users = await User.find({}).sort({ _id: 1 }).limit(5);
  let projectMonthCount = await Project.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);
  let projectYearCount = await Project.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);

  let projectTodayCount = await Project.aggregate([
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        projectNumber: { $sum: 1 },
      },
    },
  ]);
  return res.render("profile", {
    title: "Issue Tracker | Profile",
    user: users,
    projectCount: projectCount,
    userCount: userCount,
    projectMonthCount: projectMonthCount,
    projectYearCount: projectYearCount,
    projectTodayCount: projectTodayCount,
  });
};
module.exports.create = async (req, res) => {
  if (req.body.password != req.body.confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/");
  }
  User.findOne({ email: req.body.email }, async function (err, user) {
    if (err) {
      console.log("error find", err);
      req.flash("error", err);
      return;
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      User.create(
        {
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          avatar: req.body.avatar,
          role: req.body.role,
        },
        function (err, user) {
          if (err) {
            console.log("error create", err);
            req.flash("error", err);
            return;
          }

          return res.redirect("/");
        }
      );
    } else {
      req.flash("success", "You have signed up, login to continue!");
      return res.redirect("/");
    }
  });
};

module.exports.createSession = async (req, res) => {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};

module.exports.createIssue = async (req, res) => {
  try {
    console.log("req.params.id :>> ", req.body.project);
    let project = await Project.findById(req.body.project);
    if (project) {
      let issue = await Issue.create({
        title: req.body.title,
        description: req.body.description,
        label: req.body.label,
        user: req.user._id,
        project: req.body.project,
      });
      project.issues.push(issue);
      project.save();
      req.flash("success", "Issue published!");

      res.redirect("back");
    }
  } catch (err) {
    req.flash("error", err);
    return res.redirect("back");
  }
};
module.exports.createProject = async (req, res) => {
  try {
    let project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user._id,
    });
    console.log("post published :>> ", project);
    req.flash("success", "Project published!");
    return res.redirect("back");
  } catch (err) {
    req.flash("error", err);
    console.log(err);
    return res.redirect("back");
  }
};

module.exports.destroySession = function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      res.redirect("back");
    }
    console.log("logout");
    req.flash("success", "Logged Out Successfully");
    return res.redirect("/");
  });
};

module.exports.update = async (req, res) => {
  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);
      User.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log("*****Multer Error: ", err);
        }

        user.username = req.body.username;
        user.email = req.body.email;

        if (req.file) {
          // this is saving the path of the uploaded file into the avatar field in the user
          user.avatar = User.avatarPath + "/" + req.file.filename;
        }
        user.save();
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorized!");
    return res.status(401).send("Unauthorized");
  }
};
