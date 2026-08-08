// Données de consommation électrique par machine — fichier propriétaire, partagé entre
// simulateur-energie.html et sources-energie.html. Ne pas dupliquer ces chiffres ailleurs.
//
// Trois états de puissance par machine (kW, puissance instantanée) — consommation de l'IRM
// elle-même, hors refroidissement et climatisation :
//   - eteint      : machine hors examen ET hors plage d'ouverture (nuit, jour fermé)
//   - pret        : machine sous tension, prête, mais pas d'acquisition en cours
//                   (patient en préparation, ou salle ouverte sans patient)
//   - mesure      : pendant l'acquisition d'images (gradients actifs)
//
// Deux postes de consommation s'ajoutent à la machine elle-même :
//   - coeffRefroidissementLT : surconsommation du refroidissement du LOCAL TECHNIQUE (eau
//     glacée ou air, pour maintenir l'aimant supraconducteur au froid), exprimée en fraction
//     de la consommation de la machine elle-même (0,33 = +33 %), à tout instant. 0 pour les
//     IRM à aimant permanent (Esaote), qui n'ont pas de maintien en froid à alimenter.
//   - climSalleKw : climatisation de la SALLE D'EXAMEN elle-même — obligatoire pour toute
//     IRM (confort du patient, stabilité thermique de l'électronique et de l'aimant), y
//     compris pour les IRM Esaote qui n'ont pas de local technique dédié. Comptée en continu
//     (24 h/24, 365 j/an) car la stabilité thermique de la salle est requise même hors
//     ouverture, pas seulement pendant les examens.
//
// dureeAcquisitionMinutes : durée moyenne par défaut d'une acquisition (gradients actifs),
// PROPRE À CHAQUE MACHINE — un champ plus bas (moins de signal, plus de moyennage) prend en
// général plus de temps par séquence qu'un champ plus élevé. C'est une valeur de départ,
// modifiable par le visiteur sur la page (les protocoles varient selon l'examen demandé).
//
// Toutes les valeurs Esaote sont des ESTIMATIONS Ced4Scale construites à partir des guides
// d'implantation officiels publics (puissance nominale de raccordement) — voir
// sources-energie.html. Les valeurs des autres marques sont des estimations Ced4Scale
// construites à partir de recoupements techniques disponibles ; aucune d'entre elles ne doit
// être présentée comme une donnée officielle du fabricant. Les valeurs climSalleKw sont un
// ordre de grandeur (taille de salle et puissance à évacuer), pas une étude thermique.
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
    dureeAcquisitionMinutes: 15,
    coeffRefroidissementLT: 0,
    climSalleKw: 1.0,
    refroidissement: "aucun local technique dédié — climatisation de la salle d'examen seule, comme pour toute IRM",
    confiance: "Estimation Ced4Scale à partir de la puissance nominale de raccordement indiquée dans le guide d'implantation officiel (≈1000 VA). Climatisation de salle estimée (ordre de grandeur, petite salle). À confirmer avec Esaote."
  },
  {
    key: "esaote-s-scan",
    marque: "Esaote",
    modele: "S-scan Open",
    aimant: "permanent",
    eteint: 0.1,
    pret: 0.5,
    mesure: 1.8,
    dureeAcquisitionMinutes: 18,
    coeffRefroidissementLT: 0,
    climSalleKw: 1.3,
    refroidissement: "aucun local technique dédié — climatisation de la salle d'examen seule, comme pour toute IRM",
    confiance: "Estimation Ced4Scale à partir de la plage de raccordement indiquée dans le Site Planning Guide officiel (0,4 à 2,0 kVA). Climatisation de salle estimée (ordre de grandeur). À confirmer avec Esaote."
  },
  {
    key: "esaote-g-scan",
    marque: "Esaote",
    modele: "G-scan Brio",
    aimant: "permanent",
    eteint: 0.15,
    pret: 0.6,
    mesure: 2.0,
    dureeAcquisitionMinutes: 16,
    coeffRefroidissementLT: 0,
    climSalleKw: 1.5,
    refroidissement: "aucun local technique dédié — climatisation de la salle d'examen seule, comme pour toute IRM",
    confiance: "Estimation Ced4Scale par comparaison avec le S-scan Open — guide d'implantation officiel non accessible publiquement à ce jour. Climatisation de salle estimée. À confirmer avec Esaote."
  },
  {
    key: "esaote-magnifico",
    marque: "Esaote",
    modele: "Magnifico Open",
    aimant: "permanent",
    eteint: 0.15,
    pret: 0.7,
    mesure: 2.2,
    dureeAcquisitionMinutes: 15,
    coeffRefroidissementLT: 0,
    climSalleKw: 1.6,
    refroidissement: "aucun local technique dédié — climatisation de la salle d'examen seule, comme pour toute IRM",
    confiance: "Estimation Ced4Scale par comparaison avec le S-scan Open — guide d'implantation officiel non accessible publiquement à ce jour. Climatisation de salle estimée. À confirmer avec Esaote."
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
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "air (pas de circuit d'eau glacée) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "air (pas de circuit d'eau glacée) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
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
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant."
  }
];

