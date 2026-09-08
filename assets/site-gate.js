(function () {
  var ACCESS_KEY = "ced4scale-site-access";
  var ACCESS_DAYS = 15;
  // SHA-256 du code d'accès (même code que les pages "examens métal/charge").
  // Le code est le même pour les 3 profils (pro de santé / autre / Ced4Scale) :
  // seul le bouton choisi change le profil mémorisé, pas le code à saisir.
  var ACCESS_HASH = "af64ca7a041078971b1b4993c8c855ba3d1e3a2006a4082decc68d8fb981c6f3";
  var PROFILES = { pro: "Professionnel de santé", autre: "Autre", ced4scale: "Ced4Scale" };

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

  function storedAccess() {
    try {
      var value = JSON.parse(window.localStorage.getItem(ACCESS_KEY) || "null");
      if (value && value.expiresAt && value.expiresAt > Date.now()) return value;
      return null;
    } catch (error) {
      return null;
    }
  }

  function storeAccess(profile) {
    try {
      window.localStorage.setItem(ACCESS_KEY, JSON.stringify({
        expiresAt: Date.now() + (ACCESS_DAYS * 24 * 60 * 60 * 1000),
        profile: profile || null
      }));
    } catch (error) {}
  }

  function reveal() {
    document.documentElement.style.visibility = "";
  }

  var existing = storedAccess();
  if (existing) {
    window.__ced4scaleProfile = existing.profile || null;
    reveal();
    return;
  }

  var panel = document.createElement("div");
  panel.className = "site-gate";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "siteGateTitle");
  panel.innerHTML =
    '<div class="site-gate__panel">' +
      '<span class="kicker">Site en construction</span>' +
      '<h1 id="siteGateTitle">Accès réservé</h1>' +
      '<div class="site-gate__profiles" id="siteGateProfiles">' +
        '<p>Vous êtes…</p>' +
        '<button type="button" class="btn btn--on-dark btn--ghost" data-profile="pro">Professionnel de santé</button>' +
        '<button type="button" class="btn btn--on-dark btn--ghost" data-profile="autre">Autre</button>' +
        '<button type="button" class="btn btn--on-dark btn--ghost" data-profile="ced4scale">Ced4Scale</button>' +
      '</div>' +
      '<form class="site-gate__form" id="siteGateForm" hidden>' +
        '<p>Ce site est en cours de préparation. Entrez le code d’accès pour continuer. Il restera mémorisé 15 jours sur cet appareil.</p>' +
        '<label>' +
          '<span>Code</span>' +
          '<input id="siteGateCode" type="password" inputmode="tel" autocomplete="one-time-code" required />' +
        '</label>' +
        '<p class="site-gate__error" id="siteGateError" role="alert" hidden>Code incorrect.</p>' +
        '<button class="btn" type="submit">Continuer</button>' +
      '</form>' +
    '</div>';

  function attach() {
    document.body.appendChild(panel);
    var profilesBlock = document.getElementById("siteGateProfiles");
    var form = document.getElementById("siteGateForm");
    var code = document.getElementById("siteGateCode");
    var error = document.getElementById("siteGateError");
    var selectedProfile = null;

    Array.prototype.forEach.call(profilesBlock.querySelectorAll("[data-profile]"), function (button) {
      button.addEventListener("click", function () {
        selectedProfile = button.getAttribute("data-profile");
        profilesBlock.hidden = true;
        form.hidden = false;
        code.focus();
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var normalized = normalizeCode(code.value);
      hashText(normalized).then(function (hash) {
        if (hash === ACCESS_HASH || normalized === ACCESS_HASH) {
          storeAccess(selectedProfile);
          window.__ced4scaleProfile = selectedProfile;
          panel.remove();
          reveal();
          return;
        }
        error.hidden = false;
        code.select();
      });
    });
  }

  if (document.body) attach();
  else document.addEventListener("DOMContentLoaded", attach);
})();
