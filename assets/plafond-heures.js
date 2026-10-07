/* Plafond d'heures d'ouverture par jour (06/10/2026, demande de Cédric) : nombre d'heures au choix (24 h maximum), 13 h par défaut (07/10/2026).
   Partagé par les simulateurs (point mort, IRM vs scanner, énergie, bascule O-scan). Le simulateur unifié a sa propre version (unHeuresMax). */
(function () {
  window.ced4PlafondHeures = function (caseId, champsIds) {
    var box = document.getElementById(caseId);
    if (!box) return;
    function maxi() { var v = parseFloat(String(box.value).replace(",", ".")); return isFinite(v) ? Math.max(1, Math.min(24, v)) : 13; }
    function champs() { return champsIds.map(function (id) { return document.getElementById(id); }).filter(Boolean); }
    function borne(el) {
      var mx = maxi();
      el.max = mx;
      if ((parseFloat(el.value) || 0) > mx) { el.value = mx; el.dispatchEvent(new Event("input", { bubbles: true })); }
    }
    champs().forEach(function (el) {
      el.max = maxi();
      el.addEventListener("input", function () { borne(el); });
      el.addEventListener("change", function () { borne(el); });
    });
    box.addEventListener("change", function () { champs().forEach(borne); });
    champs().forEach(borne);
  };
})();
