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
    refroidissement: "eau glacée ou air selon configuration (chiller/échangeur en local technique) + climatisation de la salle d'examen",
    confiance: "Valeurs identiques à celles publiées par Siemens dans la Déclaration Environnementale de Produit (EPD) officielle du MAGNETOM Sola, plateforme 1,5T de même génération : « System off 4.3 kW / System ready to measure 8.2 kW / Scan 20.2 kW » (source publique Siemens Healthineers, 2021). Surcoût local technique et climatisation salle restent des estimations Ced4Scale."
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
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.3 kW / System ready to measure 8.4 kW / Scan 23.1 kW », refroidissement à eau confirmé (2017). Surcoût local technique et climatisation salle restent des estimations Ced4Scale."
  },
  {
    key: "siemens-amira",
    marque: "Siemens",
    modele: "MAGNETOM Amira (1,5 T, entrée de gamme)",
    aimant: "supraconducteur",
    eteint: 4.4,
    pret: 8.7,
    mesure: 13.1,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.4 kW / System ready to measure 8.7 kW / Scan 13.1 kW », refroidissement à eau confirmé. Surcoût local technique et climatisation salle restent des estimations Ced4Scale."
  },
  {
    key: "siemens-prisma",
    marque: "Siemens",
    modele: "MAGNETOM Prisma (3 T, recherche)",
    aimant: "supraconducteur",
    eteint: 4.8,
    pret: 10.8,
    mesure: 22.4,
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "eau glacée (standard, air en option) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers, mesurée selon la méthodologie sectorielle COCIR : « System off 4.8 kW / System ready to measure 10.8 kW / Scan 22.4 kW ». Surcoût local technique et climatisation salle restent des estimations Ced4Scale."
  },
  {
    key: "siemens-terra",
    marque: "Siemens",
    modele: "MAGNETOM Terra (7 T, ultra-haut champ)",
    aimant: "supraconducteur",
    eteint: 9.8,
    pret: 17.5,
    mesure: 25.7,
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.5,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 9.8 kW / System ready to measure 17.5 kW / Scan 25.7 kW », refroidissement à eau confirmé. Un champ aussi élevé (7T, usage recherche) consomme nettement plus au repos que les 1,5T/3T cliniques — cohérent avec un aimant plus gros à maintenir au froid. Surcoût local technique et climatisation salle restent des estimations Ced4Scale."
  },
  {
    key: "siemens-avanto-2011",
    marque: "Siemens",
    modele: "MAGNETOM Avanto (1,5 T, génération 2011, ancien modèle)",
    aimant: "supraconducteur",
    eteint: 20,
    pret: 20,
    mesure: 30,
    dureeAcquisitionMinutes: 15,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
    confiance: "CONFIRMÉ par la Déclaration Environnementale de Produit (EPD) officielle Siemens de 2011 : « charge de base ≤ 20 kW / charge pleine 30 kW ». Cette génération, antérieure aux technologies Eco Power actuelles, n'avait pas de véritable mode basse consommation à l'arrêt — la machine restait proche de sa charge de base même hors examen, jour et nuit. Ajouté à titre de comparaison \"ancien vs récent\" : le même segment 1,5T Siemens est passé de 20 kW à l'arrêt (2011) à 4,3-4,4 kW (Sola/Amira, générations 2018+), soit une division par 4-5 en une quinzaine d'années — mais reste très supérieur à un aimant permanent Esaote, à toute époque."
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
    coeffRefroidissementLT: 0.45,
    climSalleKw: 2.5,
    refroidissement: "air (pas de circuit d'eau glacée) + climatisation de la salle d'examen",
    confiance: "Puissance IRM : estimation Ced4Scale, à confirmer avec le fabricant. Surcoût local technique fixé à 45 % (borne haute documentée dans la littérature) plutôt que 33 % (mesure sur un système à eau glacée) : un refroidissement à air a en général un moins bon rendement qu'un circuit à eau glacée pour évacuer la même chaleur — hypothèse physique raisonnable, pas une mesure directe sur ce modèle."
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
    coeffRefroidissementLT: 0.45,
    climSalleKw: 3.2,
    refroidissement: "air (pas de circuit d'eau glacée) + climatisation de la salle d'examen",
    confiance: "Puissance IRM : estimation Ced4Scale, à confirmer avec le fabricant. Surcoût local technique fixé à 45 % (borne haute documentée dans la littérature) plutôt que 33 % (mesure sur un système à eau glacée) : un refroidissement à air a en général un moins bon rendement qu'un circuit à eau glacée pour évacuer la même chaleur — hypothèse physique raisonnable, pas une mesure directe sur ce modèle."
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

