$(document).ready(function () {
  $(".home_sidebar_createbtn").click(function () {
    console.log("object :>> ");
    $(".overlay").addClass("display");
    $(".overlay_project").addClass("display");
  });
});

$(document).ready(function () {
  $(".home_sidebar_issuebtn").click(function () {
    console.log("object :>> ");
    $(".overlay").addClass("display");
    $(".overlay_issue").addClass("display");
  });
});
