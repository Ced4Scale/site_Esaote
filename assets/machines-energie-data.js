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
    nomCourt: "Esaote O-scan",
    champT: 0.31,
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
    nomCourt: "Esaote S-scan Open",
    champT: 0.25,
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
    nomCourt: "Esaote G-scan",
    champT: 0.25,
    marque: "Esaote",
    modele: "G-scan",
    aimant: "permanent",
    eteint: 0.4,
    pret: 1.2,
    mesure: 2.4,
    dureeAcquisitionMinutes: 16,
    coeffRefroidissementLT: 0,
    climSalleKw: 1.5,
    refroidissement: "aucun local technique dédié — climatisation de la salle d'examen seule, comme pour toute IRM",
    confiance: "Puissances (arrêt/prêt/acquisition) CONFIRMÉES par le Site Planning Guide officiel \"GSCANOPEN\" (MAK000409 Rev 2, 2024), obtenu directement d'Esaote le 11/08/2026 — remplace l'ancienne estimation par comparaison. Le guide donne aussi 1,5 kVA \"en rotation\" et 2,1 kVA en chauffe rapide, deux états intermédiaires non modélisés ici. Climatisation de salle toujours estimée (ordre de grandeur), en attente de confirmation Esaote."
  },
  {
    key: "esaote-magnifico",
    nomCourt: "Esaote Magnifico Open",
    champT: 0.4,
    marque: "Esaote",
    modele: "Magnifico Open",
    aimant: "permanent",
    eteint: 0.5,
    pret: 1.2,
    mesure: 2.4,
    dureeAcquisitionMinutes: 15,
    coeffRefroidissementLT: 0,
    climSalleKw: 1.6,
    refroidissement: "aucun local technique dédié — climatisation de la salle d'examen seule, comme pour toute IRM",
    confiance: "Puissances (arrêt/prêt/acquisition) CONFIRMÉES par le Site Planning Guide officiel (MAK000283 rev 7, 2022), obtenu directement d'Esaote le 11/08/2026 — remplace l'ancienne estimation par comparaison (Tab. 8 \"Power Requirements\" : 500 VA à l'arrêt, 1200 VA en veille, 2400 VA en acquisition, 2000 VA en chauffe rapide non modélisée ici). Climatisation de salle toujours estimée (ordre de grandeur), en attente de confirmation Esaote."
  },
  {
    key: "esaote-i-genius",
    nomCourt: "Esaote I-Genius",
    champT: 0.25,
    marque: "Esaote",
    modele: "I-Genius",
    // Usage per-opératoire (bloc neuro), hors grille du forfait technique diagnostic —
    // exclu explicitement des simulateurs qui calculent une recette FT (point mort,
    // comparateur CT/IRM) via ce champ `type`, même principe que `type:"ct"` pour les
    // scanners. Reste sélectionnable dans le simulateur énergie (comparaison de
    // consommation pure, pas de recette).
    type: "peroperatoire",
    aimant: "permanent",
    eteint: 0.4,
    pret: 1.1,
    mesure: 2.0,
    dureeAcquisitionMinutes: 18,
    coeffRefroidissementLT: 0,
    climSalleKw: 1.3,
    refroidissement: "aucun local technique dédié — climatisation de la salle d'examen seule, comme pour toute IRM",
    confiance: "Puissances (arrêt/prêt/acquisition) CONFIRMÉES par le Site Planning Guide officiel (MAK000449 Rev 1, 2025), obtenu directement d'Esaote le 11/08/2026 — 1re donnée électrique disponible pour cette machine (absente du simulateur jusqu'ici). Champ magnétique (0,25 T) et durée d'acquisition supposés identiques au S-scan Open (même poids de l'aimant, 6350 kg, indiqué dans les deux documents), à confirmer. Climatisation de salle : aucune valeur connue, reprise provisoirement de celle du S-scan Open en attendant la réponse d'Esaote."
  },

  // ---------- Siemens — aimant supraconducteur, refroidissement à eau glacée ----------
  {
    key: "siemens-sempra",
    nomCourt: "Siemens Sempra",
    champT: 1.5,
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
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers, mesurée selon la méthodologie sectorielle COCIR : « System off 4.4 kW / Ready for measurement 7.4 kW / Typical examination 10.8 kW », refroidissement à eau confirmé. Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000003940534/9e2d0cef2ef9/mri_magnetom-sempra_epd_1800000003940534.pdf"
  },
  {
    key: "siemens-altea",
    nomCourt: "Siemens Altea",
    champT: 1.5,
    marque: "Siemens",
    modele: "MAGNETOM Altea (1,5 T, gradients standard XJ)",
    aimant: "supraconducteur",
    eteint: 4.3,
    pret: 8.2,
    mesure: 20.2,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (standard) ou air (option) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.3 kW / System ready to measure 8.2 kW / Scan 20.2 kW (gradients XJ) ». Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000006213748/c80772f647cc/Siemens-Healthineers-MRI_MAGNETOM_Altea_EPD_Brochure_1800000006213748.pdf"
  },
  {
    key: "siemens-sola-xj",
    nomCourt: "Siemens Sola XJ",
    champT: 1.5,
    marque: "Siemens",
    modele: "MAGNETOM Sola (1,5 T, gradients standard XJ)",
    aimant: "supraconducteur",
    eteint: 4.3,
    pret: 8.2,
    mesure: 20.2,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (standard) ou air (option) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.3 kW / System ready to measure 8.2 kW / Scan 20.2 kW (gradients XJ) ». Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/97042c1a7955e256/722da1605d27/SH-MR_MAGNETOM_Sola_EPD_flyer.pdf"
  },
  {
    key: "siemens-sola-xq",
    nomCourt: "Siemens Sola XQ",
    champT: 1.5,
    marque: "Siemens",
    modele: "MAGNETOM Sola (1,5 T, gradients hypergradient XQ)",
    aimant: "supraconducteur",
    eteint: 4.3,
    pret: 8.7,
    mesure: 22.7,
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (standard) ou air (option) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.3 kW / System ready to measure 8.7 kW / Scan 22.7 kW (gradients hypergradient XQ) » — la variante hypergradient consomme davantage à l'acquisition (gradients plus puissants), mais pas à l'arrêt. Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/97042c1a7955e256/722da1605d27/SH-MR_MAGNETOM_Sola_EPD_flyer.pdf"
  },
  {
    key: "siemens-vida",
    nomCourt: "Siemens Vida XQ",
    champT: 3,
    marque: "Siemens",
    modele: "MAGNETOM Vida (3 T, gradients hypergradient XQ)",
    aimant: "supraconducteur",
    eteint: 4.3,
    pret: 8.4,
    mesure: 23.1,
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.3 kW / System ready to measure 8.4 kW / Scan 23.1 kW (gradients XQ) », refroidissement à eau confirmé (2017). Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000004342358/18d55d7bdd91/magnetom-vida_environmental-product-declaration_2017-10_1800000004342358.pdf"
  },
  {
    key: "siemens-vida-xt",
    nomCourt: "Siemens Vida XT",
    champT: 3,
    marque: "Siemens",
    modele: "MAGNETOM Vida (3 T, gradients hypergradient XT)",
    aimant: "supraconducteur",
    eteint: 4.3,
    pret: 8.4,
    mesure: 27.4,
    dureeAcquisitionMinutes: 9,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.3 kW / System ready to measure 8.4 kW / Scan 27.4 kW (gradients hypergradient XT, la variante la plus puissante) », refroidissement à eau confirmé (2017). Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000004342358/18d55d7bdd91/magnetom-vida_environmental-product-declaration_2017-10_1800000004342358.pdf"
  },
  {
    key: "siemens-skyra-2012",
    nomCourt: "Siemens Skyra",
    champT: 3,
    marque: "Siemens",
    modele: "MAGNETOM Skyra (3 T, génération 2012, ancien modèle)",
    aimant: "supraconducteur",
    eteint: 13.9,
    pret: 13.9,
    mesure: 20.7,
    dureeAcquisitionMinutes: 13,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
    confiance: "CONFIRMÉ par la Déclaration Environnementale de Produit (EPD) officielle Siemens de 2012 : « charge de base 13,9 kW / charge pleine 20,7 kW ». Cette génération, antérieure aux technologies Eco Power actuelles, n'avait pas de véritable mode basse consommation à l'arrêt. Ajouté à titre de comparaison \"ancien vs récent\" en 3T : le même segment Siemens 3T est passé de 13,9 kW à l'arrêt (2012) à 4,3 kW (Vida, génération 2017+), soit une division par plus de 3 en cinq ans.",
  sourceUrl: "https://medfau.com/wp-content/uploads/2017/12/20120112_MAGNETOM_Skyra_Environmental_Product_Declaration_final_100088623_3.pdf"
  },
  {
    key: "siemens-amira",
    nomCourt: "Siemens Amira",
    champT: 1.5,
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
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 4.4 kW / System ready to measure 8.7 kW / Scan 13.1 kW », refroidissement à eau confirmé. Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000006724994/ae4d0e8fe099/siemens-healthineers_mri_magnetom-amira-biomatrix-epd_1800000006724994.pdf"
  },
  {
    key: "siemens-prisma",
    nomCourt: "Siemens Prisma",
    champT: 3,
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
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers, mesurée selon la méthodologie sectorielle COCIR : « System off 4.8 kW / System ready to measure 10.8 kW / Scan 22.4 kW ». Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000001114614/8cb1fac3d98d/siemens-healthineers-Magnetom_Prisma_EnvironmentalProductDeclaration.pdf"
  },
  {
    key: "siemens-terra",
    nomCourt: "Siemens Terra",
    champT: 7,
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
    confiance: "Puissance IRM CONFIRMÉE par la Déclaration Environnementale de Produit (EPD) officielle Siemens Healthineers : « System off 9.8 kW / System ready to measure 17.5 kW / Scan 25.7 kW », refroidissement à eau confirmé. Un champ aussi élevé (7T, usage recherche) consomme nettement plus au repos que les 1,5T/3T cliniques — cohérent avec un aimant plus gros à maintenir au froid. Surcoût local technique et climatisation salle restent des estimations Ced4Scale.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000005657782/1c76ab0dcbcc/siemens-healthineers_mri_magnetom-terra_epd-brochure_1800000005657782.pdf"
  },
  {
    key: "siemens-avanto-2011",
    nomCourt: "Siemens Avanto",
    champT: 1.5,
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
    confiance: "CONFIRMÉ par la Déclaration Environnementale de Produit (EPD) officielle Siemens de 2011 : « charge de base ≤ 20 kW / charge pleine 30 kW ». Cette génération, antérieure aux technologies Eco Power actuelles, n'avait pas de véritable mode basse consommation à l'arrêt — la machine restait proche de sa charge de base même hors examen, jour et nuit. Ajouté à titre de comparaison \"ancien vs récent\" : le même segment 1,5T Siemens est passé de 20 kW à l'arrêt (2011) à 4,3-4,4 kW (Sola/Amira, générations 2018+), soit une division par 4-5 en une quinzaine d'années — mais reste très supérieur à un aimant permanent Esaote, à toute époque.",
  sourceUrl: "https://cdn0.scrvt.com/39b415fb07de4d9656c7b516d8e2d907/1800000000183609/e9f6a64b9f9a/MRI-MAGNETOM-Avanto-EPD_MAGNETOM_Avanto_Espree_20111010_1800000000183609.pdf"
  },

  // ---------- GE HealthCare — aimant supraconducteur ----------
  {
    key: "ge-explorer",
    nomCourt: "GE Explorer",
    champT: 1.5,
    marque: "GE HealthCare",
    modele: "Signa Explorer (1,5 T)",
    aimant: "supraconducteur",
    eteint: 9.3,
    pret: 11.1,
    mesure: 19.8,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://www.gehealthcare.com/en-us/products/magnetic-resonance-imaging/1-5t-mri-scanners/signa-explorer-mri-scanner"
  },
  {
    key: "ge-voyager",
    nomCourt: "GE Voyager",
    champT: 1.5,
    marque: "GE HealthCare",
    modele: "Signa Voyager (1,5 T)",
    aimant: "supraconducteur",
    eteint: 5.7,
    pret: 11.1,
    mesure: 16.1,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://www.gehealthcare.com/en-us/products/magnetic-resonance-imaging/1-5t-mri-scanners/signa-voyager-wide-bore-mri-scanner"
  },
  {
    key: "ge-sigma-prime",
    nomCourt: "GE Sigma Prime",
    champT: 1.5,
    marque: "GE HealthCare",
    modele: "Signa Prime (1,5 T)",
    aimant: "supraconducteur",
    eteint: 6.8,
    pret: 9.3,
    mesure: 14.6,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://www.gehealthcare.com/products/goldseal-refurbished-systems/goldseal-magnetic-resonance/optima-mr450w-with-gem"
  },
  {
    key: "ge-pioneer",
    nomCourt: "GE Pioneer",
    champT: 3,
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
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://www.gehealthcare.com/products/magnetic-resonance-imaging/3-0t/signa-pioneer"
  },
  {
    key: "ge-artist",
    nomCourt: "GE Artist",
    champT: 3,
    marque: "GE HealthCare",
    modele: "Signa Artist (3 T)",
    aimant: "supraconducteur",
    eteint: 8.1,
    pret: 23.4,
    mesure: 45,
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 3.2,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://www.gehealthcare.com/products/magnetic-resonance-imaging/1-5t-mri-scanners/signa-artist-wide-bore-mri-scanner"
  },
  {
    key: "ge-optima-mr450w",
    nomCourt: "GE Optima MR450w",
    champT: 1.5,
    marque: "GE HealthCare",
    modele: "Optima MR450w (1,5 T)",
    aimant: "supraconducteur",
    eteint: 8.1,
    pret: 23.4,
    mesure: 45,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://www.gehealthcare.com/products/goldseal-refurbished-systems/goldseal-magnetic-resonance/optima-mr450w-with-gem"
  },

  // ---------- Philips — aimant supraconducteur, refroidissement à air ----------
  {
    key: "philips-ambition-s",
    nomCourt: "Philips Ambition S",
    champT: 1.5,
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
    confiance: "Puissance IRM : estimation Ced4Scale, à confirmer avec le fabricant. Surcoût local technique fixé à 45 % (borne haute documentée dans la littérature) plutôt que 33 % (mesure sur un système à eau glacée) : un refroidissement à air a en général un moins bon rendement qu'un circuit à eau glacée pour évacuer la même chaleur — hypothèse physique raisonnable, pas une mesure directe sur ce modèle.",
  sourceUrl: "https://www.usa.philips.com/healthcare/product/HC781359/ingenia-ambition-excel-in-your-daily-mr-services-helium-free"
  },
  {
    key: "philips-ambition-x",
    nomCourt: "Philips Ambition X",
    champT: 1.5,
    marque: "Philips",
    modele: "Ingenia Ambition X (1,5 T)",
    aimant: "supraconducteur",
    eteint: 4.1,
    pret: 9.0,
    mesure: 20.4,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.45,
    climSalleKw: 2.5,
    refroidissement: "air (pas de circuit d'eau glacée) + climatisation de la salle d'examen",
    confiance: "Puissance IRM : estimation Ced4Scale, à confirmer avec le fabricant. Surcoût local technique fixé à 45 % (borne haute documentée dans la littérature) plutôt que 33 % (mesure sur un système à eau glacée).",
  sourceUrl: "https://www.usa.philips.com/healthcare/product/HC781356/ingenia-ambition-excel-in-your-daily-mr-services-helium-free"
  },
  {
    key: "philips-mr7700",
    nomCourt: "Philips MR7700",
    champT: 3,
    marque: "Philips",
    modele: "MR 7700 (3 T)",
    aimant: "supraconducteur",
    eteint: 6.5,
    pret: 14.0,
    mesure: 25.5,
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.45,
    climSalleKw: 3.2,
    refroidissement: "air (pas de circuit d'eau glacée) + climatisation de la salle d'examen",
    confiance: "Puissance IRM : estimation Ced4Scale, à confirmer avec le fabricant. Surcoût local technique fixé à 45 % (borne haute documentée dans la littérature) plutôt que 33 % (mesure sur un système à eau glacée).",
  sourceUrl: "https://www.usa.philips.com/healthcare/product/HCNMRF429/mr-7700"
  },
  {
    key: "philips-elition-x",
    nomCourt: "Philips Elition X",
    champT: 3,
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
    confiance: "Puissance IRM : estimation Ced4Scale, à confirmer avec le fabricant. Surcoût local technique fixé à 45 % (borne haute documentée dans la littérature) plutôt que 33 % (mesure sur un système à eau glacée) : un refroidissement à air a en général un moins bon rendement qu'un circuit à eau glacée pour évacuer la même chaleur — hypothèse physique raisonnable, pas une mesure directe sur ce modèle.",
  sourceUrl: "https://www.usa.philips.com/healthcare/product/HC781358/ingenia-elition-30t-x"
  },

  // ---------- Canon Medical — aimant supraconducteur ----------
  {
    key: "canon-elan",
    nomCourt: "Canon Elan",
    champT: 1.5,
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
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://us.medical.canon/products/magnetic-resonance/vantage-elan-15t/"
  },
  {
    key: "canon-orian",
    nomCourt: "Canon Orian Std",
    champT: 1.5,
    marque: "Canon Medical",
    modele: "Vantage Orian (1,5 T, gradients standard)",
    aimant: "supraconducteur",
    eteint: 5.7,
    pret: 9.0,
    mesure: 21.2,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://us.medical.canon/products/magnetic-resonance/vantage-orian-15t/"
  },
  {
    key: "canon-orian-hyp",
    nomCourt: "Canon Orian Hyp",
    champT: 1.5,
    marque: "Canon Medical",
    modele: "Vantage Orian (1,5 T, gradients hypergradient)",
    aimant: "supraconducteur",
    eteint: 5.8,
    pret: 10.5,
    mesure: 27,
    dureeAcquisitionMinutes: 10,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "local technique (eau glacée ou air selon configuration, à confirmer) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant.",
  sourceUrl: "https://us.medical.canon/products/magnetic-resonance/vantage-orian-15t/"
  },
  {
    key: "siemens-aera",
    nomCourt: "Siemens Aera",
    champT: 1.5,
    marque: "Siemens",
    modele: "MAGNETOM Aera (1,5 T, génération 2010)",
    aimant: "supraconducteur",
    eteint: 6.1,
    pret: 8.7,
    mesure: 18.9,
    dureeAcquisitionMinutes: 12,
    coeffRefroidissementLT: 0.33,
    climSalleKw: 2.5,
    refroidissement: "eau glacée (chiller dédié en local technique) + climatisation de la salle d'examen",
    confiance: "Estimation Ced4Scale, à confirmer avec le fabricant. Modèle utilisé dans l'étude indépendante Roletto et al. (European Radiology Experimental, 2026, voir « Ce que disent les études indépendantes ») comme référence de l'ancienne génération 1,5T, avant l'arrivée d'Eco Power Mode.",
  sourceUrl: "https://www.siemens-healthineers.com/en-us/magnetic-resonance-imaging/1-5t-mri-scanner/magnetom-aera"
  },
  // ---------- Scanners (CT) — pas d'aimant, comparés à une IRM Esaote sur le simulateur de
  // point mort. type:"ct" identifie ces machines pour le calcul de recette (barème scanner,
  // pas de distinction Paris/IDF/Province) et pour le filtre "gamme" du simulateur. ----------
  {
    key: "siemens-goall",
    nomCourt: "Siemens SOMATOM go.All",
    type: "ct",
    champT: null,
    marque: "Siemens",
    modele: "SOMATOM go.All (scanner CT)",
    aimant: "ct",
    eteint: 2.7,
    pret: 2.7,
    mesure: 62,
    dureeAcquisitionMinutes: 4,
    coeffRefroidissementLT: 0,
    climSalleKw: 3.5,
    refroidissement: "pas de local technique dédié (pas d'aimant à maintenir au froid) — climatisation de la salle d'examen seule.",
    confiance: "Puissance électrique officielle Siemens (guide de contraintes d'implantation \"Contraintes d'implantation SOMATOM_go.All_FR.pdf\") : veille ≤ 3 kVA, puissance nominale en fonctionnement 69,2 kVA — converties en kW avec un facteur de puissance estimé à 0,9. Climatisation de salle estimée (ordre de grandeur). À confirmer avec Siemens."
  },
  {
    key: "siemens-gotop",
    nomCourt: "Siemens SOMATOM go.Top",
    type: "ct",
    champT: null,
    marque: "Siemens",
    modele: "SOMATOM go.Top (scanner CT)",
    aimant: "ct",
    eteint: 2.7,
    pret: 2.7,
    mesure: 62,
    dureeAcquisitionMinutes: 4,
    coeffRefroidissementLT: 0,
    climSalleKw: 3.5,
    refroidissement: "pas de local technique dédié (pas d'aimant à maintenir au froid) — climatisation de la salle d'examen seule.",
    confiance: "Puissance électrique officielle Siemens (guide de contraintes d'implantation \"SOMATOM_go.Top_FR.pdf\") : veille ≤ 3 kVA, puissance nominale en fonctionnement 69,2 kVA — converties en kW avec un facteur de puissance estimé à 0,9. Même plateforme électrique que le go.All (variante cardiologie). Climatisation de salle estimée (ordre de grandeur). À confirmer avec Siemens."
  },
  /* GE, Philips, Canon — demandé par Cédric le 10/08/2026 pour élargir le volet énergétique du
     scanner. Confiance nettement plus faible que Siemens ci-dessus : aucun guide d'implantation
     officiel trouvé dans les archives locales de Cédric pour ces marques (contrairement à
     Siemens, ex-employeur de Cédric) — valeurs reconstituées à partir de documents officiels
     trouvés sur le web (fiches techniques constructeur, un vrai Technical Reference Guide
     Philips), avec une hypothèse de veille/prêt commune (~4% de la puissance en fonctionnement,
     calibrée sur le ratio observé chez Siemens) faute de valeur de veille publiée pour ces
     modèles. À confirmer avec chaque fabricant avant tout usage commercial. */
  {
    key: "ge-revolution",
    nomCourt: "GE Revolution",
    type: "ct",
    champT: null,
    marque: "GE HealthCare",
    modele: "Revolution (gamme CT, configuration standard)",
    aimant: "ct",
    eteint: 3.6,
    pret: 3.6,
    mesure: 90,
    dureeAcquisitionMinutes: 4,
    coeffRefroidissementLT: 0,
    climSalleKw: 4.5,
    refroidissement: "pas de local technique dédié (pas d'aimant à maintenir au froid) — climatisation de la salle d'examen seule.",
    confiance: "Aucun guide d'implantation officiel GE trouvé en accès libre (sites GE bloqués aux robots). Puissance en fonctionnement estimée à partir d'une alimentation dédiée de 93,75 à 125 kVA mentionnée dans la documentation de site (gamme Revolution Ascend Elite), convertie en kW avec un facteur de puissance de 0,9 — cette plage inclut une marge de dimensionnement, pas la consommation réelle mesurée. Veille et climatisation de salle estimées par extrapolation depuis Siemens. À confirmer avec GE HealthCare."
  },
  {
    key: "philips-incisive-ct",
    nomCourt: "Philips Incisive",
    type: "ct",
    champT: null,
    marque: "Philips",
    modele: "Incisive CT",
    aimant: "ct",
    eteint: 2.9,
    pret: 2.9,
    mesure: 72,
    dureeAcquisitionMinutes: 4,
    coeffRefroidissementLT: 0,
    climSalleKw: 3.7,
    refroidissement: "pas de local technique dédié (pas d'aimant à maintenir au froid) — climatisation de la salle d'examen seule.",
    confiance: "Puissance officielle Philips (Technical Reference Guide Incisive CT, documents.philips.com) : capacité de raccordement 115 kVA, puissance électrique continue du générateur 72 kW (jusqu'à 80 kW en pointe 4s selon configuration). Veille et climatisation de salle estimées par extrapolation depuis Siemens (pas de valeur de veille publiée dans ce document). À confirmer avec Philips.",
    sourceUrl: "https://www.documents.philips.com/assets/Technical%20Reference%20Guide/20230817/a73be7afa7384293bfd2b0610036bb13.pdf"
  },
  {
    key: "canon-aquilion-prime-sp",
    nomCourt: "Canon Aquilion Prime SP",
    type: "ct",
    champT: null,
    marque: "Canon Medical",
    modele: "Aquilion Prime SP",
    aimant: "ct",
    eteint: 3.1,
    pret: 3.1,
    mesure: 76.5,
    dureeAcquisitionMinutes: 4,
    coeffRefroidissementLT: 0,
    climSalleKw: 4.0,
    refroidissement: "pas de local technique dédié (pas d'aimant à maintenir au froid) — climatisation de la salle d'examen seule.",
    confiance: "Aucun guide d'implantation officiel Canon Medical trouvé en accès libre. Puissance en fonctionnement estimée à partir d'une fiche technique constructeur citant \"jusqu'à 85 kVA\" pour ce modèle, convertie en kW avec un facteur de puissance de 0,9. Veille et climatisation de salle estimées par extrapolation depuis Siemens. À confirmer avec Canon Medical Systems."
  }
];

// Facteur d'émission de l'électricité française — pour convertir le coût énergétique en
// empreinte carbone (volet RSE). Source : ADEME, Base Carbone, mix électrique moyen France
// (~56,6 g CO2e/kWh en 2023, le mix français est peu carboné grâce au nucléaire — l'argument
// carbone est donc plus modeste en France que dans le reste de l'Europe, l'argument coût reste
// entier). Valeur arrondie, à réviser si l'ADEME publie une mise à jour du facteur.
var CO2_G_PAR_KWH_FRANCE = 56.6;

// Capacité d'absorption moyenne d'un arbre adulte, en kg de CO2 par an — pour rendre
// l'empreinte carbone plus concrète ("équivalent à X arbres pendant un an"). 25 kg/an est la
// valeur la plus généralement citée (moyenne toutes essences ; un chêne adulte absorbe
// typiquement 20 à 30 kg/an). Ordre de grandeur pédagogique, pas une mesure de compensation
// carbone certifiée — la capacité réelle varie fortement selon l'essence, l'âge et le climat.
var ARBRE_KG_CO2_PAR_AN = 25;

// Études indépendantes ayant mesuré ou recoupé la consommation électrique d'IRM, utilisées
// pour étayer le volet RSE de ce simulateur (citées dans le PDF envoyé et sur
// sources-energie.html). Aucune n'est la source des valeurs par machine ci-dessus (voir champ
// "confiance" de chaque machine) — elles servent à montrer que l'approche par états de
// consommation (arrêt/prêt/mesure) et le poids du refroidissement sont documentés
// indépendamment, pas une invention Ced4Scale.
var ENERGIE_ETUDES = [
  {
    label: "Heye et al., « The Energy Consumption of Radiology », Radiology (RSNA), 2020",
    resume: "Étude de référence la plus citée du domaine : 19,9 kWh/examen en moyenne, consommation quotidienne passée de 226 à 165 kWh entre 2011 et 2017 (-30%), 25 à 33% d'économie possible en passant du mode veille au mode économie d'énergie.",
    url: "https://pubs.rsna.org/doi/10.1148/radiol.2020192084"
  },
  {
    label: "Woolen et al., « Ecodesign and Operational Strategies to Reduce the Carbon Footprint of MRI for Energy Cost Savings », Radiology, 2023",
    resume: "Quatre IRM réelles de trois fabricants différents, équipées de compteurs de puissance pendant 39 jours : 72 à 91% de l'énergie consommée est \"non productive\" (hors examen).",
    url: "https://pubs.rsna.org/doi/full/10.1148/radiol.230441"
  },
  {
    label: "Roletto et al., « Energy performance of MRI systems: on-site validation and comparison with manufacturer declarations », European Radiology Experimental, 2026",
    resume: "Mesure sur site de deux IRM Siemens réelles (Aera/Sola), comparée aux déclarations officielles du fabricant : le mode veille représente 32% de la consommation totale, à cause du maintien en froid continu.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12770147/"
  },
  {
    label: "Vosshenrich, Merkle, Heye, « The carbon footprint of modern imaging », Current Opinion in Urology, 2025",
    resume: "Revue de synthèse : consommation de veille continue de 7 à 9 kW, et le refroidissement ajoute environ 45% de consommation en plus — un facteur souvent oublié dans les bilans carbone.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12517713/"
  },
  {
    label: "Carver et al., « Measuring the Environmental Impact of MRI and CT: A Life Cycle Assessment », Journal of the American College of Radiology, 2026",
    resume: "Étude américaine (Vanderbilt University Medical Center, 800 lits, Sud-Est des États-Unis) : l'IRM de cet établissement génère 221 tonnes de CO2 équivalent par an, dont 58% viennent directement de la consommation électrique.",
    url: "https://pubmed.ncbi.nlm.nih.gov/41052702/"
  },
  {
    label: "Scherer et al., « Energy Conservation in MRI: Sequence Selection and Operational Strategies », Academic Radiology, 2026",
    resume: "Étude américaine récente : le système de santé américain représente environ 9,8% des émissions de gaz à effet de serre du pays, l'imagerie (dont l'IRM) y contribuant fortement — propose le choix de séquences comme levier d'économie encore peu exploité.",
    url: "https://www.academicradiology.org/article/S1076-6332(26)00424-1/fulltext"
  }
];

