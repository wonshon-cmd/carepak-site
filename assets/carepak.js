// Preview-only form handling: opens the visitor's email app with the answers filled in.
// On the live Wix site, use a Wix Form instead (submissions go to your Wix inbox).
var CAREPAK_EMAIL = "[EMAIL]";
document.querySelectorAll(".cp-form").forEach(function (f) {
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var lines = [];
    f.querySelectorAll("[name]").forEach(function (el) {
      if (el.value) lines.push(el.name + ": " + el.value);
    });
    location.href = "mailto:" + CAREPAK_EMAIL +
      "?subject=" + encodeURIComponent(f.dataset.subject || "Website message") +
      "&body=" + encodeURIComponent(lines.join("\n"));
  });
});
