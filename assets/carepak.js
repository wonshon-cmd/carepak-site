// Onboarding form: sends to the Carepak forms backend (see assets/config.js).
document.querySelectorAll(".cp-form").forEach(function (f) {
  var status = document.createElement("p");
  status.className = "cp-status";
  status.setAttribute("role", "status");
  f.appendChild(status);
  var hp = document.createElement("input"); // spam trap, hidden from people
  hp.name = "website"; hp.tabIndex = -1; hp.autocomplete = "off"; hp.setAttribute("aria-hidden", "true");
  hp.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px";
  f.appendChild(hp);

  f.addEventListener("submit", async function (e) {
    e.preventDefault();
    var endpoint = window.CAREPAK_ENDPOINT || "";
    var v = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
    if (!endpoint) {
      status.textContent = "Online requests aren't connected yet. Please call us and we'll get you started.";
      return;
    }
    var btn = f.querySelector("button[type=submit]"), label = btn.textContent;
    btn.disabled = true; btn.textContent = "Sending…"; status.textContent = "";
    var consent = f.querySelector("input[type=checkbox]");
    var payload = {
      type: "onboarding", name: v("Name"), phone: v("Phone"), email: v("Email"),
      bestTime: v("Best time"), currentPharmacy: v("Current pharmacy"),
      consent: !!(consent && consent.checked), website: hp.value
    };
    try {
      var r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      var j = await r.json();
      if (!j.ok) throw new Error(j.error || "failed");
      f.innerHTML = '<p class="cp-done"><strong>Thank you!</strong> We received your request and will get in touch with you shortly.</p>';
    } catch (err) {
      status.textContent = "Sorry, we couldn't send your request. Please try again or call us.";
      btn.disabled = false; btn.textContent = label;
    }
  });
});
