// Données de consommation électrique par machine — fichier propriétaire, partagé entre
// simulateur-energie.html et sources-energie.html. Ne pas dupliquer ces chiffres ailleurs.
//
// Trois états de puissance par machine (kW, puissance instantanée) :
//   - eteint      : machine hors examen ET hors plage d'ouverture (nuit, jour fermé)
//   - pret        : machine sous tension, prête, mais pas d'acquisition en cours
//                   (patient en préparation, ou salle ouverte sans patient)
//   - mesure      : pendant l'acquisition d'images (gradients actifs)
//
// coeffRefroidissement : surconsommation du système de refroidissement du local technique
// (climatisation ou eau glacée), exprimée en fraction de la consommation de la machine
// elle-même (0,33 = +33 %). 0 pour les IRM à aimant permanent (Esaote), qui n'ont pas de
// système de maintien en froid à alimenter en continu.
//
// Toutes les valeurs Esaote sont des ESTIMATIONS Ced4Scale construites à partir des guides
// d'implantation officiels publics (puissance nominale de raccordement) — voir
// sources-energie.html. Les valeurs des autres marques sont des estimations Ced4Scale
// construites à partir de recoupements techniques disponibles ; aucune d'entre elles ne doit
// être présentée comme une donnée officielle du fabricant.
var ENERGIE_MACHINES = [
  // ---------- Esaote — aimant permanent, pas de maintien en froid cryogénique ----------
  {
    key: "esaote-o-scan",
    marque: "Esaote",
    modele: "O-scan",
    aimant: "permanent",
    eteint: 0.05,
    pret: 0.3,
    mesure: 1.0,
    coeffRefroidissement: 0,
    refroidissement: "aucun système dédié (pas de local technique spécifique)",
    confiance: "Estimation Ced4Scale à partir de la puissance nominale de raccordement indiquée dans le guide d'implantation officiel (≈1000 VA). À confirmer avec Esaote."
  },
  {
    key: "esaote-s-scan",
    marque: "Esaote",
    modele: "S-scan Open",
    aimant: "permanent",
    eteint: 0.1,
    pret: 0.5,
    mesure: 1.8,
    coeffRefroidissement: 0,
    refroidissement: "aucun système dédié (pas de local technique spécifique)",
    confiance: "Estimation Ced4Scale à partir de la plage de raccordement indiquée dans le Site Planning Guide officiel (0,4 à 2,0 kVA). À confirmer avec Esaote."
  },
  {
    key: "esaote-g-scan",
    marque: "Esaote",
    modele: "G-scan Brio",
    aimant: "permanent",
    eteint: 0.15,
    pret: 0.6,
    mesure: 2.0,
    coeffRefroidissement: 0,
    refroidissement: "aucun système dédié (pas de local technique spécifique)",
    confiance: "Estimation Ced4Scale par comparaison avec le S-scan Open — guide d'implantation officiel non accessible publiquement à ce jour. À confirmer avec Esaote."
  },
  {
    key: "esaote-magnifico",
    marque: "Esaote",
    modele: "Magnifico Open",
    aimant: "permanent",
    eteint: 0.15,
    pret: 0.7,
    mesure: 2.2,
    coeffRefroidissement: 0,
    refroidissement: "aucun système dédié (pas de local technique spécifique)",
    confiance: "Estimation Ced4Scale par comparaison avec le S-scan Open — guide d'implantation officiel non accessible publiquement à ce jour. À confirmer avec Esaote."
  },

  // ---------- Siemens — aimant supraconducteur, refroidissement à eau glacée ----------
  {
    key: "siemens-sempra",
    marque: "Siemens",
    modele: "MAGNETOM Sempra (1,5 T)",
    aimant: "supraconducteur",
    eteint: 4.4,
    pret: 7.4,
    mesure: 10.8,
    coeffRefroidissement: 0.33,
    refroidissement: "eau glacée (chiller dédié)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },
  {
    key: "siemens-altea",
    marque: "Siemens",
    modele: "MAGNETOM Altea (1,5 T)",
    aimant: "supraconducteur",
    eteint: 4.3,
    pret: 8.2,
    mesure: 20.2,
    coeffRefroidissement: 0.33,
    refroidissement: "eau glacée (chiller dédié)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },
  {
    key: "siemens-vida",
    marque: "Siemens",
    modele: "MAGNETOM Vida (3 T)",
    aimant: "supraconducteur",
    eteint: 4.3,
    pret: 8.4,
    mesure: 23.1,
    coeffRefroidissement: 0.33,
    refroidissement: "eau glacée (chiller dédié)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },

  // ---------- GE HealthCare — aimant supraconducteur ----------
  {
    key: "ge-explorer",
    marque: "GE HealthCare",
    modele: "Signa Explorer (1,5 T)",
    aimant: "supraconducteur",
    eteint: 5.7,
    pret: 11.1,
    mesure: 16.1,
    coeffRefroidissement: 0.33,
    refroidissement: "à confirmer (eau glacée ou air selon configuration)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },
  {
    key: "ge-pioneer",
    marque: "GE HealthCare",
    modele: "Signa Pioneer (3 T)",
    aimant: "supraconducteur",
    eteint: 6.4,
    pret: 11.7,
    mesure: 17.5,
    coeffRefroidissement: 0.33,
    refroidissement: "à confirmer (eau glacée ou air selon configuration)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },

  // ---------- Philips — aimant supraconducteur, refroidissement à air ----------
  {
    key: "philips-ambition-s",
    marque: "Philips",
    modele: "Ingenia Ambition S (1,5 T)",
    aimant: "supraconducteur",
    eteint: 4.1,
    pret: 7.7,
    mesure: 14.5,
    coeffRefroidissement: 0.33,
    refroidissement: "air (pas de circuit d'eau glacée)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },
  {
    key: "philips-elition-x",
    marque: "Philips",
    modele: "Ingenia Elition X (3 T)",
    aimant: "supraconducteur",
    eteint: 6.0,
    pret: 13.0,
    mesure: 22.8,
    coeffRefroidissement: 0.33,
    refroidissement: "air (pas de circuit d'eau glacée)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },

  // ---------- Canon Medical — aimant supraconducteur ----------
  {
    key: "canon-elan",
    marque: "Canon Medical",
    modele: "Vantage Elan (1,5 T)",
    aimant: "supraconducteur",
    eteint: 7.2,
    pret: 10.0,
    mesure: 13.0,
    coeffRefroidissement: 0.33,
    refroidissement: "à confirmer (eau glacée ou air selon configuration)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  },
  {
    key: "canon-orian",
    marque: "Canon Medical",
    modele: "Vantage Orian (1,5 T)",
    aimant: "supraconducteur",
    eteint: 5.7,
    pret: 9.0,
    mesure: 21.2,
    coeffRefroidissement: 0.33,
    refroidissement: "à confirmer (eau glacée ou air selon configuration)",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  }
];

// Hypothèses de calcul partagées (durée moyenne d'un examen) — modifiables ici uniquement.
var ENERGIE_HYPOTHESES = {
  dureeSlotMinutes: 20,       // préparation + examen
  dureeAcquisitionMinutes: 12 // durée réelle "gradients actifs" dans le slot
};
