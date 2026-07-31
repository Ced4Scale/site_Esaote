(function () {
  var CONFIG = {
    accessKey: "ced4scale-stats-access",
    accessDays: 3650,
    accessHash: "06aed24d03304913838c3c9687f71d4777894a151fd7bb7799c43e972792f178",
    dashboardUrl: "https://ced4scale.goatcounter.com",
    apiBase: "https://ced4scale.goatcounter.com/api/v0",
    apiToken: "1bx47layog4rphvj2aoeaua0jn151juvoj46a10ce0wpd2m0y2",
    rangeDays: 180
  };

  var PRODUCT_NAMES = {
    "o-scan": "O-scan",
    "s-scan": "S-scan",
    "g-scan": "G-scan",
    "magnifico": "Magnifico",
    "i-genius": "I-Genius"
  };

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
      var value = JSON.parse(window.localStorage.getItem(CONFIG.accessKey) || "null");
      return Boolean(value && value.expiresAt && value.expiresAt > Date.now());
    } catch (error) {
      return false;
    }
  }

  function storeAccess() {
    try {
      window.localStorage.setItem(CONFIG.accessKey, JSON.stringify({
        expiresAt: Date.now() + (CONFIG.accessDays * 24 * 60 * 60 * 1000)
      }));
    } catch (error) {}
  }

  /* --------------------------- panneau code d'accès --------------------------- */
  var gateOverlay = null;
  var gateForm, gateInput, gateError, gateCancel, gateCloseTimer, gateTrigger;

  function buildGate() {
    if (gateOverlay) return;
    gateOverlay = document.createElement("div");
    gateOverlay.className = "modal-overlay stats-gate";
    gateOverlay.hidden = true;
    gateOverlay.setAttribute("role", "dialog");
    gateOverlay.setAttribute("aria-modal", "true");
    gateOverlay.setAttribute("aria-labelledby", "statsGateTitle");
    gateOverlay.innerHTML =
      '<form class="stats-gate__panel" id="statsGateForm">' +
        '<span class="kicker">Accès réservé</span>' +
        '<h1 id="statsGateTitle">Statistiques du site</h1>' +
        "<p>Entrez le code d'accès pour ouvrir le tableau de bord. L'autorisation restera mémorisée sur cet appareil.</p>" +
        "<label>" +
          "<span>Code</span>" +
          '<input id="statsGateCode" type="password" autocomplete="off" required />' +
        "</label>" +
        '<p class="stats-gate__error" id="statsGateError" role="alert" hidden>Code incorrect.</p>' +
        '<div class="stats-gate__actions">' +
          '<button class="btn" type="submit">Ouvrir</button>' +
          '<button class="btn btn--ghost" type="button" id="statsGateCancel">Annuler</button>' +
        "</div>" +
      "</form>";
    document.body.appendChild(gateOverlay);

    gateForm = gateOverlay.querySelector("#statsGateForm");
    gateInput = gateOverlay.querySelector("#statsGateCode");
    gateError = gateOverlay.querySelector("#statsGateError");
    gateCancel = gateOverlay.querySelector("#statsGateCancel");

    gateForm.addEventListener("submit", function (event) {
      event.preventDefault();
      hashText(gateInput.value.trim()).then(function (hash) {
        if (hash === CONFIG.accessHash) {
          storeAccess();
          var trigger = gateTrigger;
          closeGate();
          openDashboard(trigger);
          return;
        }
        gateError.hidden = false;
        gateInput.select();
      });
    });

    gateCancel.addEventListener("click", closeGate);
    gateOverlay.addEventListener("click", function (event) {
      if (event.target === gateOverlay) closeGate();
    });
    gateOverlay.querySelector(".stats-gate__panel").addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !gateOverlay.classList.contains("is-open")) return;
      closeGate();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || !gateOverlay.classList.contains("is-open")) return;
      var focusables = gateOverlay.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  function openGate(trigger) {
    buildGate();
    gateTrigger = trigger;
    gateError.hidden = true;
    gateInput.value = "";
    gateOverlay.hidden = false;
    gateOverlay.style.display = "flex";
    void gateOverlay.offsetWidth;
    gateOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    gateInput.focus();
  }

  function closeGate() {
    if (!gateOverlay || !gateOverlay.classList.contains("is-open")) return;
    gateOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    var finish = function (e) {
      if (e && e.target !== gateOverlay) return;
      gateOverlay.style.display = "none";
      gateOverlay.hidden = true;
      gateOverlay.removeEventListener("transitionend", finish);
      clearTimeout(gateCloseTimer);
      if (gateTrigger && typeof gateTrigger.focus === "function") gateTrigger.focus();
      gateTrigger = null;
    };
    gateOverlay.addEventListener("transitionend", finish);
    gateCloseTimer = setTimeout(finish, 280);
  }

  /* --------------------------- appels API GoatCounter --------------------------- */
  function apiGet(path, params) {
    var url = CONFIG.apiBase + path + "?" + Object.keys(params || {}).map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    }).join("&");
    return fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + CONFIG.apiToken
      }
    }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    });
  }

  function isoRangeStart() {
    var d = new Date(Date.now() - CONFIG.rangeDays * 24 * 60 * 60 * 1000);
    d.setUTCMinutes(0, 0, 0);
    return d.toISOString();
  }

  function classifyEvent(path) {
    if (path.indexOf("produit-") === 0) return { group: "produits", key: path.slice(8) };
    if (path === "cta-presentation-teams") return { group: "teams" };
    if (path.indexOf("qcm-resultat-") === 0) return { group: "qcm", key: path.slice(13) };
    if (path === "contact-formulaire-envoye") return { group: "contact" };
    if (path.indexOf("examens-deverrouilles-") === 0) return { group: "examens", key: path.slice(22) };
    if (path.indexOf("document-") === 0) return { group: "documents", key: path.slice(9) };
    if (path.indexOf("reference-") === 0) return { group: "references", key: path.slice(10) };
    return { group: "autre" };
  }

  function productLabel(key) {
    return PRODUCT_NAMES[key] || key;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function barRow(label, count, max) {
    var pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
    return '<div class="stats-bar">' +
      '<span class="stats-bar__label">' + escapeHtml(label) + "</span>" +
      '<span class="stats-bar__track"><span class="stats-bar__fill" style="width:' + pct + '%"></span></span>' +
      '<span class="stats-bar__count">' + count + "</span>" +
    "</div>";
  }

  function renderDashboard(body, total, hits) {
    var pages = [];
    var events = { produits: {}, teams: 0, qcm: {}, contact: 0, examens: {}, documents: {}, references: {}, autre: 0 };

    hits.forEach(function (hit) {
      if (hit.event) {
        var c = classifyEvent(hit.path);
        if (c.group === "produits") events.produits[c.key] = (events.produits[c.key] || 0) + hit.count;
        else if (c.group === "qcm") events.qcm[c.key] = (events.qcm[c.key] || 0) + hit.count;
        else if (c.group === "examens") events.examens[c.key] = (events.examens[c.key] || 0) + hit.count;
        else if (c.group === "documents") events.documents[hit.title || c.key] = (events.documents[hit.title || c.key] || 0) + hit.count;
        else if (c.group === "references") events.references[hit.title || c.key] = (events.references[hit.title || c.key] || 0) + hit.count;
        else if (c.group === "teams") events.teams += hit.count;
        else if (c.group === "contact") events.contact += hit.count;
        else events.autre += hit.count;
      } else {
        pages.push(hit);
      }
    });

    pages.sort(function (a, b) { return b.count - a.count; });

    var productEntries = Object.keys(events.produits).map(function (key) {
      return { label: productLabel(key), count: events.produits[key] };
    }).sort(function (a, b) { return b.count - a.count; });
    var topProduct = productEntries[0];
    var maxProduct = productEntries.length ? productEntries[0].count : 0;

    var qcmEntries = Object.keys(events.qcm).map(function (key) {
      return { label: productLabel(key), count: events.qcm[key] };
    }).sort(function (a, b) { return b.count - a.count; });
    var maxQcm = qcmEntries.length ? qcmEntries[0].count : 0;

    var examensLabels = { metal: "Métal", charge: "En charge" };
    var examensEntries = Object.keys(events.examens).map(function (key) {
      return { label: examensLabels[key] || key, count: events.examens[key] };
    });

    var docEntries = Object.keys(events.documents).map(function (key) {
      return { label: key, count: events.documents[key] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);
    var maxDoc = docEntries.length ? docEntries[0].count : 0;

    var refEntries = Object.keys(events.references).map(function (key) {
      return { label: key, count: events.references[key] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);
    var maxRef = refEntries.length ? refEntries[0].count : 0;

    var totalVisits = total.total || 0;
    var maxDaily = Math.max.apply(null, (total.stats || []).map(function (d) { return d.daily || 0; }).concat([1]));
    var sparkline = (total.stats || []).map(function (d) {
      var h = Math.max(3, Math.round((d.daily / maxDaily) * 34));
      return '<span class="stats-spark__bar" style="height:' + h + 'px" title="' + d.day + ' : ' + d.daily + '"></span>';
    }).join("");

    var maxPage = pages.length ? pages[0].count : 0;

    body.innerHTML =
      '<div class="stats-tiles">' +
        '<div class="stats-tile">' +
          '<span class="stats-tile__label">Visites (' + CONFIG.rangeDays + ' j.)</span>' +
          '<span class="stats-tile__value">' + totalVisits + "</span>" +
          '<span class="stats-spark">' + sparkline + "</span>" +
        "</div>" +
        '<div class="stats-tile">' +
          '<span class="stats-tile__label">Formulaires envoyés</span>' +
          '<span class="stats-tile__value">' + events.contact + "</span>" +
        "</div>" +
        '<div class="stats-tile">' +
          '<span class="stats-tile__label">IRM la plus demandée</span>' +
          '<span class="stats-tile__value stats-tile__value--text">' + (topProduct ? escapeHtml(topProduct.label) : "—") + "</span>" +
        "</div>" +
      "</div>" +

      '<section class="stats-section">' +
        "<h3>Vos IRM — clics par produit</h3>" +
        (productEntries.length
          ? productEntries.map(function (e) { return barRow(e.label, e.count, maxProduct); }).join("")
          : '<p class="stats-empty">Pas encore de clic enregistré.</p>') +
      "</section>" +

      '<section class="stats-section">' +
        "<h3>QCM aide au choix — résultat obtenu</h3>" +
        (qcmEntries.length
          ? qcmEntries.map(function (e) { return barRow(e.label, e.count, maxQcm); }).join("")
          : '<p class="stats-empty">Pas encore de QCM complété.</p>') +
      "</section>" +

      '<section class="stats-section">' +
        "<h3>Examens débloqués</h3>" +
        (examensEntries.length
          ? '<div class="stats-chips">' + examensEntries.map(function (e) {
              return '<span class="stats-chip">' + escapeHtml(e.label) + " · " + e.count + "</span>";
            }).join("") + "</div>"
          : '<p class="stats-empty">Aucun déverrouillage enregistré.</p>') +
      "</section>" +

      '<section class="stats-section stats-section--split">' +
        "<div>" +
          "<h3>Documents consultés</h3>" +
          (docEntries.length
            ? docEntries.map(function (e) { return barRow(e.label, e.count, maxDoc); }).join("")
            : '<p class="stats-empty">Aucune brochure consultée.</p>') +
        "</div>" +
        "<div>" +
          "<h3>Références consultées</h3>" +
          (refEntries.length
            ? refEntries.map(function (e) { return barRow(e.label, e.count, maxRef); }).join("")
            : '<p class="stats-empty">Aucune référence consultée.</p>') +
        "</div>" +
      "</section>" +

      '<section class="stats-section">' +
        "<h3>Pages les plus vues</h3>" +
        (pages.length
          ? '<div class="table-wrap"><table class="stats-table">' +
              "<thead><tr><th>Page</th><th>Visites</th></tr></thead><tbody>" +
              pages.slice(0, 8).map(function (p) {
                return "<tr><td>" + escapeHtml(p.path) + "</td><td>" +
                  '<span class="stats-bar stats-bar--table"><span class="stats-bar__track"><span class="stats-bar__fill" style="width:' +
                  Math.max(4, Math.round((p.count / maxPage) * 100)) + '%"></span></span><span class="stats-bar__count">' + p.count + "</span></span>" +
                  "</td></tr>";
              }).join("") +
            "</tbody></table></div>"
          : '<p class="stats-empty">Aucune page vue enregistrée pour l’instant.</p>') +
      "</section>" +

      '<section class="stats-section">' +
        '<div class="stats-timeline__head">' +
          "<h3>Chronologie du jour</h3>" +
          '<input type="date" id="statsTimelineDate" value="' + todayIso() + '" max="' + todayIso() + '" />' +
        "</div>" +
        '<p class="stats-timeline__hint">Pour recouper une visite avec l\'heure d\'un e-mail reçu via le formulaire de contact.</p>' +
        '<div id="statsTimelineBody" class="stats-timeline__body"><p class="stats-empty">Chargement…</p></div>' +
      "</section>";

    initTimeline(body);
  }

  function todayIso() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function eventLabel(hit) {
    var c = classifyEvent(hit.path);
    if (c.group === "produits") return "Clic IRM " + productLabel(c.key);
    if (c.group === "teams") return "Demande présentation Teams";
    if (c.group === "qcm") return "QCM → " + productLabel(c.key);
    if (c.group === "contact") return "Formulaire de contact envoyé";
    if (c.group === "examens") return "Examens débloqués (" + (c.key === "metal" ? "métal" : "charge") + ")";
    if (c.group === "documents") return "Document : " + (hit.title || c.key);
    if (c.group === "references") return "Référence : " + (hit.title || c.key);
    return hit.title || hit.path;
  }

  function initTimeline(body) {
    var input = body.querySelector("#statsTimelineDate");
    var out = body.querySelector("#statsTimelineBody");
    if (!input || !out) return;

    function load(dateStr) {
      out.innerHTML = '<p class="stats-empty">Chargement…</p>';
      /* GoatCounter renvoie déjà "day" et "hourly" à l'heure du fuseau réglé sur le compte
         (Europe/Paris) — donc pas de conversion de fuseau ici, sous peine de décaler l'heure
         affichée (bug corrigé le 31/07/2026). On élargit juste la fenêtre demandée par sécurité,
         puis on ne garde que les tranches horaires de la journée exacte demandée. */
      var reqStart = new Date(dateStr + "T00:00:00");
      reqStart.setHours(reqStart.getHours() - 6);
      var reqEnd = new Date(dateStr + "T00:00:00");
      reqEnd.setDate(reqEnd.getDate() + 1);
      reqEnd.setHours(reqEnd.getHours() + 6);

      apiGet("/stats/hits", { start: reqStart.toISOString(), end: reqEnd.toISOString(), limit: 200 }).then(function (data) {
        var buckets = {};
        (data.hits || []).forEach(function (hit) {
          var label = hit.event ? eventLabel(hit) : hit.path;
          (hit.stats || []).forEach(function (dayEntry) {
            if (dayEntry.day !== dateStr) return;
            (dayEntry.hourly || []).forEach(function (count, h) {
              if (!count) return;
              buckets[h] = buckets[h] || {};
              buckets[h][label] = (buckets[h][label] || 0) + count;
            });
          });
        });

        var hours = Object.keys(buckets).map(Number).sort(function (a, b) { return a - b; });
        if (!hours.length) {
          out.innerHTML = '<p class="stats-empty">Aucune activité ce jour-là.</p>';
          return;
        }
        out.innerHTML = '<ul class="stats-timeline__list">' + hours.map(function (h) {
          var items = Object.keys(buckets[h]).map(function (label) {
            return escapeHtml(label) + " (" + buckets[h][label] + ")";
          }).join(", ");
          return '<li><strong>' + (h < 10 ? "0" + h : h) + "h</strong> — " + items + "</li>";
        }).join("") + "</ul>";
      }).catch(function () {
        out.innerHTML = '<p class="stats-empty">Impossible de charger cette journée.</p>';
      });
    }

    input.addEventListener("change", function () {
      if (input.value) load(input.value);
    });
    load(input.value);
  }

  function renderError(body, message) {
    body.innerHTML =
      '<div class="stats-state stats-state--error">' +
        "<p>" + escapeHtml(message) + "</p>" +
        '<a class="btn btn--ghost" href="' + CONFIG.dashboardUrl + '" target="_blank" rel="noopener">Ouvrir le tableau de bord complet ↗</a>' +
      "</div>";
  }

  function loadDashboardData(body) {
    body.innerHTML = '<div class="stats-state"><p>Chargement des statistiques…</p></div>';
    var start = isoRangeStart();
    Promise.all([
      apiGet("/stats/total", { start: start }),
      apiGet("/stats/hits", { start: start, limit: 200 })
    ]).then(function (results) {
      renderDashboard(body, results[0], results[1].hits || []);
    }).catch(function () {
      renderError(body, "Impossible de charger les statistiques pour le moment (connexion, ou clé d'API à vérifier).");
    });
  }

  /* --------------------------- panneau tableau de bord --------------------------- */
  var dashOverlay = null;
  var dashClose, dashCloseTimer, dashTrigger, dashBody;

  function buildDashboard() {
    if (dashOverlay) return;
    dashOverlay = document.createElement("div");
    dashOverlay.className = "modal-overlay stats-dashboard";
    dashOverlay.hidden = true;
    dashOverlay.setAttribute("role", "dialog");
    dashOverlay.setAttribute("aria-modal", "true");
    dashOverlay.setAttribute("aria-label", "Statistiques du site");
    dashOverlay.innerHTML =
      '<div class="stats-dashboard__panel">' +
        '<div class="stats-dashboard__bar">' +
          "<span>Statistiques du site</span>" +
          '<a href="' + CONFIG.dashboardUrl + '" target="_blank" rel="noopener">Tableau complet ↗</a>' +
          '<button type="button" id="statsDashboardClose" aria-label="Fermer les statistiques">&times;</button>' +
        "</div>" +
        '<div class="stats-dashboard__body" id="statsDashboardBody"></div>' +
      "</div>";
    document.body.appendChild(dashOverlay);

    dashClose = dashOverlay.querySelector("#statsDashboardClose");
    dashBody = dashOverlay.querySelector("#statsDashboardBody");

    dashClose.addEventListener("click", closeDashboard);
    dashOverlay.addEventListener("click", function (event) {
      if (event.target === dashOverlay) closeDashboard();
    });
    dashOverlay.querySelector(".stats-dashboard__panel").addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !dashOverlay.classList.contains("is-open")) return;
      closeDashboard();
    });
  }

  function openDashboard(trigger) {
    buildDashboard();
    dashTrigger = trigger || dashTrigger;
    dashOverlay.hidden = false;
    dashOverlay.style.display = "flex";
    void dashOverlay.offsetWidth;
    dashOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    loadDashboardData(dashBody);
  }

  function closeDashboard() {
    if (!dashOverlay || !dashOverlay.classList.contains("is-open")) return;
    dashOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    var finish = function (e) {
      if (e && e.target !== dashOverlay) return;
      dashOverlay.style.display = "none";
      dashOverlay.hidden = true;
      dashOverlay.removeEventListener("transitionend", finish);
      clearTimeout(dashCloseTimer);
      if (dashTrigger && typeof dashTrigger.focus === "function") dashTrigger.focus();
      dashTrigger = null;
    };
    dashOverlay.addEventListener("transitionend", finish);
    dashCloseTimer = setTimeout(finish, 280);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var triggers = document.querySelectorAll("[data-stats-trigger]");
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        if (storedAccessIsValid()) {
          openDashboard(trigger);
          return;
        }
        openGate(trigger);
      });
    });
  });
})();
