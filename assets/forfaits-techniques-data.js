/* Données tarifaires du forfait technique IRM, par classe de puissance d'aimant.
   Source unique, partagée entre simulateur-recettes.html et les pages de synthèse
   par date (forfait-technique.html, sources-forfaits-techniques.html) — ne pas
   dupliquer ces chiffres ailleurs, ne modifier qu'ici.
   Historique 2018/2019/2024 confirmé par Cédric sur les PDF sources (fusion des
   colonnes ≤0,5T / >0,5T-<1,5T / 1,5T quand identiques à ces dates-là — voir
   mémoire du site). 2025-2027 croisé et confirmé avec le suivi financier interne
   pour la classe "≤ 0,5 T" uniquement. */
var FT_CLASSES = {
  le05: {
    label: "≤ 0,5 T", REF: 3500, SEUIL1: 8000, SEUIL2: 11000,
    dates: [
      { iso: "2018-07-01", label: "1er juil. 2018", plein: { paris: { amorti: 124.62, nonAmorti: 125.15 }, idf: { amorti: 120.94, nonAmorti: 121.53 }, province: { amorti: 119.68, nonAmorti: 115.83 } }, reduits: { seuil1: 69.00, seuil2: 52.54, plafond: 26.11 } },
      { iso: "2019-01-01", label: "1er janv. 2019", plein: { paris: { amorti: 124.62, nonAmorti: 125.15 }, idf: { amorti: 120.94, nonAmorti: 121.53 }, province: { amorti: 119.68, nonAmorti: 115.83 } }, reduits: { seuil1: 70.10, seuil2: 55.69, plafond: 26.11 } },
      { iso: "2024-03-01", label: "1er mars 2024", plein: { paris: { amorti: 130.54, nonAmorti: 131.07 }, idf: { amorti: 126.86, nonAmorti: 127.45 }, province: { amorti: 125.60, nonAmorti: 121.75 } }, reduits: { seuil1: 73.94, seuil2: 59.53, plafond: 29.95 } },
      { iso: "2025-11-05", label: "5 nov. 2025", plein: { paris: { amorti: 125.32, nonAmorti: 120.58 }, idf: { amorti: 121.79, nonAmorti: 117.25 }, province: { amorti: 120.58, nonAmorti: 112.01 } }, reduits: { seuil1: 62.85, seuil2: 50.60, plafond: 25.46 } },
      { iso: "2026-01-01", label: "1er janv. 2026", plein: { paris: { amorti: 125.32, nonAmorti: 120.58 }, idf: { amorti: 121.79, nonAmorti: 117.25 }, province: { amorti: 120.58, nonAmorti: 112.01 } }, reduits: { seuil1: 73.94, seuil2: 59.53, plafond: 29.95 } },
      { iso: "2026-07-01", label: "1er juil. 2026", plein: { paris: { amorti: 124.01, nonAmorti: 117.96 }, idf: { amorti: 120.52, nonAmorti: 114.71 }, province: { amorti: 119.32, nonAmorti: 109.58 } }, reduits: { seuil1: 73.94, seuil2: 59.53, plafond: 29.95 } },
      { iso: "2027-01-01", label: "1er janv. 2027", plein: { paris: { amorti: 122.71, nonAmorti: 114.56 }, idf: { amorti: 119.25, nonAmorti: 111.39 }, province: { amorti: 118.06, nonAmorti: 106.41 } }, reduits: { seuil1: 73.94, seuil2: 59.53, plafond: 29.95 } }
    ]
  },
  mid: {
    label: "> 0,5 T et < 1,5 T", REF: 4000, SEUIL1: 8000, SEUIL2: 11000,
    dates: [
      { iso: "2018-07-01", label: "1er juil. 2018", plein: { paris: { amorti: 124.62, nonAmorti: 188.36 }, idf: { amorti: 120.94, nonAmorti: 183.96 }, province: { amorti: 119.68, nonAmorti: 184.00 } }, reduits: { seuil1: 69.00, seuil2: 52.54, plafond: 26.11 } },
      { iso: "2019-01-01", label: "1er janv. 2019", plein: { paris: { amorti: 124.62, nonAmorti: 188.36 }, idf: { amorti: 120.94, nonAmorti: 183.96 }, province: { amorti: 119.68, nonAmorti: 184.00 } }, reduits: { seuil1: 70.10, seuil2: 55.69, plafond: 26.11 } },
      { iso: "2024-03-01", label: "1er mars 2024", plein: { paris: { amorti: 130.54, nonAmorti: 194.28 }, idf: { amorti: 126.86, nonAmorti: 189.88 }, province: { amorti: 125.60, nonAmorti: 189.92 } }, reduits: { seuil1: 73.94, seuil2: 59.53, plafond: 29.95 } },
      { iso: "2025-11-05", label: "5 nov. 2025", plein: { paris: { amorti: 75.42, nonAmorti: 178.73 }, idf: { amorti: 74.97, nonAmorti: 174.69 }, province: { amorti: 74.81, nonAmorti: 174.72 } }, reduits: { seuil1: 42.93, seuil2: 36.18, plafond: 23.83 } },
      { iso: "2026-01-01", label: "1er janv. 2026", plein: { paris: { amorti: 75.42, nonAmorti: 178.73 }, idf: { amorti: 74.97, nonAmorti: 174.69 }, province: { amorti: 74.81, nonAmorti: 174.72 } }, reduits: { seuil1: 50.51, seuil2: 42.57, plafond: 28.04 } },
      { iso: "2026-07-01", label: "1er juil. 2026", plein: { paris: { amorti: 74.63, nonAmorti: 174.85 }, idf: { amorti: 74.19, nonAmorti: 170.89 }, province: { amorti: 74.03, nonAmorti: 170.92 } }, reduits: { seuil1: 50.51, seuil2: 42.57, plafond: 28.04 } },
      { iso: "2027-01-01", label: "1er janv. 2027", plein: { paris: { amorti: 73.85, nonAmorti: 169.80 }, idf: { amorti: 73.40, nonAmorti: 165.95 }, province: { amorti: 73.25, nonAmorti: 165.99 } }, reduits: { seuil1: 50.51, seuil2: 42.57, plafond: 28.04 } }
    ]
  },
  t15: {
    label: "1,5 T standard", REF: 4750, SEUIL1: 8000, SEUIL2: 11000,
    dates: [
      { iso: "2018-07-01", label: "1er juil. 2018", plein: { paris: { amorti: 124.62, nonAmorti: 170.24 }, idf: { amorti: 120.94, nonAmorti: 166.55 }, province: { amorti: 119.68, nonAmorti: 165.22 } }, reduits: { seuil1: 69.00, seuil2: 52.54, plafond: 26.11 } },
      { iso: "2019-01-01", label: "1er janv. 2019", plein: { paris: { amorti: 124.62, nonAmorti: 171.09 }, idf: { amorti: 120.94, nonAmorti: 167.38 }, province: { amorti: 119.68, nonAmorti: 166.05 } }, reduits: { seuil1: 70.10, seuil2: 55.69, plafond: 26.11 } },
      { iso: "2024-03-01", label: "1er mars 2024", plein: { paris: { amorti: 130.54, nonAmorti: 177.01 }, idf: { amorti: 126.86, nonAmorti: 173.30 }, province: { amorti: 125.60, nonAmorti: 171.97 } }, reduits: { seuil1: 73.94, seuil2: 59.53, plafond: 29.95 } },
      { iso: "2025-11-05", label: "5 nov. 2025", plein: { paris: { amorti: 87.94, nonAmorti: 162.85 }, idf: { amorti: 86.94, nonAmorti: 159.44 }, province: { amorti: 86.59, nonAmorti: 158.21 } }, reduits: { seuil1: 44.81, seuil2: 37.89, plafond: 24.91 } },
      { iso: "2026-01-01", label: "1er janv. 2026", plein: { paris: { amorti: 87.94, nonAmorti: 162.85 }, idf: { amorti: 86.94, nonAmorti: 159.44 }, province: { amorti: 86.59, nonAmorti: 158.21 } }, reduits: { seuil1: 52.72, seuil2: 44.58, plafond: 29.30 } },
      { iso: "2026-07-01", label: "1er juil. 2026", plein: { paris: { amorti: 87.02, nonAmorti: 159.31 }, idf: { amorti: 86.03, nonAmorti: 155.97 }, province: { amorti: 85.69, nonAmorti: 154.77 } }, reduits: { seuil1: 52.72, seuil2: 44.58, plafond: 29.30 } },
      { iso: "2027-01-01", label: "1er janv. 2027", plein: { paris: { amorti: 86.10, nonAmorti: 154.71 }, idf: { amorti: 85.13, nonAmorti: 151.46 }, province: { amorti: 84.79, nonAmorti: 150.30 } }, reduits: { seuil1: 52.72, seuil2: 44.58, plafond: 29.30 } }
    ]
  },
  sup15: {
    // Avait un tarif "amorti" en 2018/2019/2024 (confirmé par Cédric sur les PDF sources) ;
    // ce tarif a disparu du texte à partir de 2025 (uniquement "non amorti" ensuite).
    label: "> 1,5 T", REF: 4500, SEUIL1: 8000, SEUIL2: 11000,
    dates: [
      { iso: "2018-07-01", label: "1er juil. 2018", plein: { paris: { amorti: 138.83, nonAmorti: 197.91 }, idf: { amorti: 133.02, nonAmorti: 195.99 }, province: { amorti: 124.88, nonAmorti: 195.91 } }, reduits: { seuil1: 71.56, seuil2: 61.81, plafond: 38.63 } },
      { iso: "2019-01-01", label: "1er janv. 2019", plein: { paris: { amorti: 138.83, nonAmorti: 197.91 }, idf: { amorti: 133.02, nonAmorti: 195.99 }, province: { amorti: 124.88, nonAmorti: 195.91 } }, reduits: { seuil1: 71.56, seuil2: 61.81, plafond: 38.63 } },
      { iso: "2024-03-01", label: "1er mars 2024", plein: { paris: { amorti: 144.75, nonAmorti: 203.83 }, idf: { amorti: 138.94, nonAmorti: 201.91 }, province: { amorti: 130.80, nonAmorti: 201.43 } }, reduits: { seuil1: 75.40, seuil2: 65.65, plafond: 42.47 } },
      { iso: "2025-11-05", label: "5 nov. 2025", plein: { paris: { nonAmorti: 187.52 }, idf: { nonAmorti: 185.76 }, province: { nonAmorti: 185.32 } }, reduits: { seuil1: 64.09, seuil2: 55.80, plafond: 36.10 } },
      { iso: "2026-01-01", label: "1er janv. 2026", plein: { paris: { nonAmorti: 187.52 }, idf: { nonAmorti: 185.76 }, province: { nonAmorti: 185.32 } }, reduits: { seuil1: 75.40, seuil2: 65.65, plafond: 42.47 } },
      { iso: "2026-07-01", label: "1er juil. 2026", plein: { paris: { nonAmorti: 183.45 }, idf: { nonAmorti: 181.72 }, province: { nonAmorti: 181.29 } }, reduits: { seuil1: 75.40, seuil2: 65.65, plafond: 42.47 } },
      { iso: "2027-01-01", label: "1er janv. 2027", plein: { paris: { nonAmorti: 178.15 }, idf: { nonAmorti: 176.47 }, province: { nonAmorti: 176.05 } }, reduits: { seuil1: 75.40, seuil2: 65.65, plafond: 42.47 } }
    ]
  }
};

/* Liste des dates connues, dans l'ordre chronologique, avec le lien vers l'extrait
   officiel source (fichier PDF hébergé sur ce site — voir memoire du site pour le
   choix de n'extraire que les pages IRM, pas le texte intégral). */
var FT_DATES = [
  { iso: "2018-07-01", label: "1er juillet 2018", source: "assets/docs/arrete-2018-forfaits-techniques.pdf", sourceLabel: "Décision UNCAM du 28 mai 2018" },
  { iso: "2019-01-01", label: "1er janvier 2019", source: "assets/docs/arrete-2018-forfaits-techniques.pdf", sourceLabel: "Décision UNCAM du 28 mai 2018" },
  { iso: "2024-03-01", label: "1er mars 2024", source: "assets/docs/arrete-2024-forfaits-techniques.pdf", sourceLabel: "Arrêté du 2 février 2024" },
  { iso: "2025-11-05", label: "5 novembre 2025", source: "assets/docs/decision-2025-forfaits-techniques.pdf", sourceLabel: "Décision UNCAM du 14 octobre 2025" },
  { iso: "2026-01-01", label: "1er janvier 2026", source: "assets/docs/decision-2025-forfaits-techniques.pdf", sourceLabel: "Décision UNCAM du 14 octobre 2025" },
  { iso: "2026-07-01", label: "1er juillet 2026", source: "assets/docs/decision-2025-forfaits-techniques.pdf", sourceLabel: "Décision UNCAM du 14 octobre 2025" },
  { iso: "2027-01-01", label: "1er janvier 2027", source: "assets/docs/decision-2025-forfaits-techniques.pdf", sourceLabel: "Décision UNCAM du 14 octobre 2025" }
];

function ftDateByIso(iso) {
  return FT_DATES.filter(function (d) { return d.iso === iso; })[0];
}
