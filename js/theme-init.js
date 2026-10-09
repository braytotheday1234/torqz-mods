/* Apply saved theme before CSS paints. No remote dependencies. */
(function () {
  var allowed = ["carbon", "copper", "violet"];
  var selected = "carbon";
  try {
    var stored = localStorage.getItem("torqz-theme-v3");
    if (allowed.indexOf(stored) !== -1) selected = stored;
  } catch (_) {}
  document.documentElement.setAttribute("data-theme", selected);
})();
