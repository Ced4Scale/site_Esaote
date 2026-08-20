(function () {
  var ACCESS_KEY = "ced4scale-site-access";
  var ACCESS_DAYS = 15;
  // SHA-256 du code d'accès (même code que les pages "examens métal/charge").
  var ACCESS_HASH = "af64ca7a041078971b1b4993c8c855ba3d1e3a2006a4082decc68d8fb981c6f3";

  function normalizeCode(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.indexOf("0033") === 0) digits = "0" + digits.slice(4);
    if (digits.indexOf("33") === 0 && digits.length === 11) digits = "0" + digits.slice(2);
    return digits;
  }

  function hashText(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return Promise.resolve(value);
    }
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then(function (buffer) {
      return Array.from(new Uint8Array(buffer)).map(function (byte) {
        return byte.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  function storedAccessIsValid() {
    try {
      var value = JSON.parse(window.localStorage.getItem(ACCESS_KEY) || "null");
      return Boolean(value && value.expiresAt && value.expiresAt > Date.now());
    } catch (error) {
      return false;
    }
  }

  function storeAccess() {
    try {
      window.localStorage.setItem(ACCESS_KEY, JSON.stringify({
        expiresAt: Date.now() + (ACCESS_DAYS * 24 * 60 * 60 * 1000)
      }));
    } catch (error) {}
  }

  function reveal() {
    document.documentElement.style.visibility = "";
  }

  if (storedAccessIsValid()) {
    reveal();
    return;
  }

  var panel = document.createElement("div");
  panel.className = "site-gate";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "siteGateTitle");
  panel.innerHTML =
    '<form class="site-gate__panel" id="siteGateForm">' +
      '<span class="kicker">Site en construction</span>' +
      '<h1 id="siteGateTitle">Accès réservé</h1>' +
      '<p>Ce site est en cours de préparation. Entrez le code d’accès pour continuer. Il restera mémorisé 15 jours sur cet appareil.</p>' +
      '<label>' +
        '<span>Code</span>' +
        '<input id="siteGateCode" type="password" inputmode="tel" autocomplete="one-time-code" required />' +
      '</label>' +
      '<p class="site-gate__error" id="siteGateError" role="alert" hidden>Code incorrect.</p>' +
      '<button class="btn" type="submit">Continuer</button>' +
    '</form>';

  function attach() {
    document.body.appendChild(panel);
    var form = document.getElementById("siteGateForm");
    var code = document.getElementById("siteGateCode");
    var error = document.getElementById("siteGateError");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var normalized = normalizeCode(code.value);
      hashText(normalized).then(function (hash) {
        if (hash === ACCESS_HASH || normalized === ACCESS_HASH) {
          storeAccess();
          panel.remove();
          reveal();
          return;
        }
        error.hidden = false;
        code.select();
      });
    });
    code.focus();
  }

  if (document.body) attach();
  else document.addEventListener("DOMContentLoaded", attach);
})();
