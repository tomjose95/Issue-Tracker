$(document).ready(function () {
  $(".user_session_details").click(function (e) {
    console.log("this :>> ", e.target);
    e.stopImmediatePropagation();
    $(".user_dropdown").slideToggle();
  });

  $(document).click(function (e) {
    var target = e.target;
    if (!$(target).is(".user_session_details")) {
      $(".user_dropdown").slideUp();
    }
  });
});
