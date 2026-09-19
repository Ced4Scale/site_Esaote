// Données CCAM — actes intellectuels IRM et scanner (secteur 1, tarif opposable).
// Source : aideaucodage.fr (nomenclature CCAM v80.0, novembre 2025), consultée le 19/09/2026.
// Ne couvre que l'acte intellectuel (l'acte médical de réalisation + interprétation),
// jamais le forfait technique (voir forfait-technique.html pour celui-ci).
// Propriétaire unique de ces données — toute correction se fait ici, jamais dupliquée ailleurs.

// Spécialité(s) qui réalise l'acte : déduction par pratique courante en France, PAS une règle
// officielle de la nomenclature (plusieurs spécialités qualifiées peuvent légalement facturer
// le même acte) — à ajuster avec Cédric avant présentation à un client si besoin d'être plus
// précis pour une zone donnée.

// Recrutement typique : estimation Ced4Scale du mode d'adressage le plus fréquent du patient
// vers l'examen, pas une donnée officielle — sert à situer l'acte dans son contexte commercial.
var AI_RECRUTEMENT = {
  SPECIALISTE: "Adressé par un spécialiste",
  MIXTE: "Médecin traitant ou spécialiste",
  GENERALISTE_URGENCES: "Médecin traitant, urgences ou bilan hospitalier"
};

var ACTES_INTELLECTUELS = [
  // ---------- IRM (Remnographie) ----------
  { modalite: "IRM", zone: "Crâne / encéphale", code: "ACQN001", libelle: "IRM du crâne et de son contenu, sans injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.GENERALISTE_URGENCES },
  { modalite: "IRM", zone: "Crâne / encéphale", code: "ACQJ002", libelle: "IRM du crâne et de son contenu, avec injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Crâne / encéphale", code: "ACQN004", libelle: "IRM du crâne avec étude de viabilité du parenchyme cérébral (diffusion/perfusion)", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.GENERALISTE_URGENCES },
  { modalite: "IRM", zone: "Crâne / encéphale (fonctionnelle)", code: "AAQN004", libelle: "IRM fonctionnelle du cerveau (fonctions motrices — d'autres variantes existent pour fonctions visuelles/phasiques, même tarif)", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Face / ORL", code: "LAQN001", libelle: "IRM de la face, sans injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Face / ORL", code: "LAQJ001", libelle: "IRM de la face, avec injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Cou (tissus mous)", code: "LCQN001", libelle: "IRM des tissus mous du cou, sans injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Cou (tissus mous)", code: "LCQJ001", libelle: "IRM des tissus mous du cou, avec injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Rachis (1 ou 2 segments)", code: "LHQN001", libelle: "IRM d'un ou deux segments de la colonne vertébrale, sans injection", tarif: 69.00, specialites: ["Radiologue", "Rhumatologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "IRM", zone: "Rachis (1 ou 2 segments)", code: "LHQJ001", libelle: "IRM d'un ou deux segments de la colonne vertébrale, avec injection", tarif: 69.00, specialites: ["Radiologue", "Rhumatologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "IRM", zone: "Thorax", code: "ZBQN001", libelle: "IRM du thorax, sans injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "IRM", zone: "Thorax", code: "ZBQJ001", libelle: "IRM du thorax, avec injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Abdomen / pelvis", code: "ZCQN001", libelle: "IRM de l'abdomen et du petit bassin, sans injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "IRM", zone: "Abdomen / pelvis", code: "ZCQJ005", libelle: "IRM de l'abdomen et du petit bassin, avec injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Sein", code: "QEQN001", libelle: "IRM du sein, sans injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Sein", code: "QEQJ001", libelle: "IRM du sein, avec injection", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Cœur", code: "DZQN001", libelle: "IRM morphologique du cœur", tarif: 69.00, specialites: ["Radiologue", "Cardiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Cœur", code: "DZQN002", libelle: "IRM fonctionnelle du cœur, sans épreuve pharmacologique de stress", tarif: 69.00, specialites: ["Radiologue", "Cardiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Cœur", code: "DZQM008", libelle: "IRM fonctionnelle du cœur, avec épreuve pharmacologique de stress", tarif: 69.00, specialites: ["Radiologue", "Cardiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Membre supérieur (épaule/coude/poignet/main)", code: "MZQN001", libelle: "IRM uni/bilatérale de segment du membre supérieur, sans injection", tarif: 55.00, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "IRM", zone: "Membre supérieur", code: "MZQJ001", libelle: "IRM uni/bilatérale de segment du membre supérieur, avec injection", tarif: 55.00, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Membre inférieur (hanche/genou/cheville/pied)", code: "NZQN001", libelle: "IRM uni/bilatérale de segment du membre inférieur, sans injection", tarif: 55.00, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "IRM", zone: "Membre inférieur", code: "NZQJ001", libelle: "IRM uni/bilatérale de segment du membre inférieur, avec injection", tarif: 55.00, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Vasculaire (Angio-IRM cérébrale)", code: "EAQJ001", libelle: "IRM des vaisseaux encéphaliques [Angio-IRM cérébrale]", tarif: 69.00, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Vasculaire (Angio-IRM cervicocérébrale)", code: "EBQJ001", libelle: "IRM des vaisseaux cervicocéphaliques [Angio-IRM cervicocérébrale]", tarif: 69.00, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Vasculaire (Angio-IRM cervicale)", code: "EBQJ002", libelle: "IRM des vaisseaux cervicaux [Angio-IRM cervicale]", tarif: 69.00, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Vasculaire (Angio-IRM thoracique)", code: "ECQJ001", libelle: "IRM des vaisseaux du thorax [Angio-IRM thoracique]", tarif: 69.00, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Vasculaire (Angio-IRM abdomino-pelvien)", code: "ELQJ001", libelle: "IRM des vaisseaux de l'abdomen et/ou du petit bassin [Angio-IRM abdominopelvien]", tarif: 69.00, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Vasculaire (Angio-IRM membres sup.)", code: "EKQJ001", libelle: "IRM des vaisseaux des membres supérieurs [Angio-IRM]", tarif: 69.00, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Vasculaire (Angio-IRM membres inf.)", code: "EMQJ001", libelle: "IRM des vaisseaux des membres inférieurs [Angio-IRM]", tarif: 69.00, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Multi-séquences (complément)", code: "ZZQN001", libelle: "IRM comportant 6 séquences ou plus", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "IRM", zone: "Quantification tissulaire", code: "PDQN001", libelle: "Quantification des différents composants des tissus mous, par IRM (ex. surcharge graisseuse hépatique)", tarif: 69.00, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },

  // ---------- Scanner (Scanographie) ----------
  { modalite: "Scanner", zone: "Crâne / encéphale", code: "ACQK001", libelle: "Scanner du crâne et de son contenu, sans injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.GENERALISTE_URGENCES },
  { modalite: "Scanner", zone: "Crâne / encéphale", code: "ACQH003", libelle: "Scanner du crâne et de son contenu, avec injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.GENERALISTE_URGENCES },
  { modalite: "Scanner", zone: "Face", code: "LAQK013", libelle: "Scanner de la face", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "ORL (rocher / oreille moyenne)", code: "LAQK002", libelle: "Scanner uni/bilatéral du rocher et de l'oreille moyenne", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "ORL (conduit auditif interne)", code: "LAQK011", libelle: "Scanner de l'angle pontocérébelleux et/ou du conduit auditif interne", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Cou (tissus mous)", code: "LCQK001", libelle: "Scanner des tissus mous du cou, sans injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Cou (tissus mous)", code: "LCQH001", libelle: "Scanner des tissus mous du cou, avec injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Rachis (1 segment)", code: "LHQK001", libelle: "Scanner d'un segment de la colonne vertébrale, sans injection", tarif: 25.27, specialites: ["Radiologue", "Rhumatologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "Scanner", zone: "Rachis (1 segment)", code: "LHQH006", libelle: "Scanner d'un segment de la colonne vertébrale, avec injection", tarif: 25.27, specialites: ["Radiologue", "Rhumatologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "Scanner", zone: "Rachis (plusieurs segments)", code: "LHQK005", libelle: "Scanner de plusieurs segments de la colonne vertébrale, sans injection", tarif: 25.27, specialites: ["Radiologue", "Rhumatologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "Scanner", zone: "Rachis (discoscanner)", code: "LHQH005", libelle: "Discographie intervertébrale avec scanner de la colonne [Discoscanner] — acte combiné, tarif incluant l'injection intradiscale", tarif: 106.40, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Rachis (myéloscanner)", code: "AFQH003", libelle: "Myélographie avec scanner de la colonne [Myéloscanner] — acte combiné, tarif incluant l'injection intrathécale", tarif: 106.40, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Thorax", code: "ZBQK001", libelle: "Scanner du thorax, sans injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "Scanner", zone: "Thorax", code: "ZBQH001", libelle: "Scanner du thorax, avec injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Abdomen ou pelvis (1 territoire)", code: "ZCQK005 / ZCQH002", libelle: "Scanner de l'abdomen ou du petit bassin, sans/avec injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "Scanner", zone: "Abdomen et pelvis (2 territoires)", code: "ZCQK004 / ZCQH001", libelle: "Scanner de l'abdomen et du petit bassin, sans/avec injection", tarif: 50.54, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Sein", code: "QEQK006", libelle: "Scanner du sein, sans injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Sein", code: "QEQH002", libelle: "Scanner du sein, avec injection", tarif: 25.27, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Cœur / coronaires (coroscanner)", code: "ECQH010", libelle: "Scanner des vaisseaux du thorax et/ou du cœur [Angioscanner thoracique]", tarif: 25.27, specialites: ["Radiologue", "Cardiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Vasculaire (Angioscanner cérébral)", code: "EAQH002", libelle: "Scanner des vaisseaux encéphaliques [Angioscanner cérébral]", tarif: 25.27, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Vasculaire (Angioscanner cervicocérébral)", code: "EBQH004", libelle: "Scanner des vaisseaux cervicocéphaliques [Angioscanner]", tarif: 25.27, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Vasculaire (Angioscanner cervical)", code: "EBQH006", libelle: "Scanner des vaisseaux cervicaux [Angioscanner]", tarif: 25.27, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Vasculaire (Angioscanner membres sup.)", code: "EKQH001", libelle: "Scanner des vaisseaux des membres supérieurs [Angioscanner]", tarif: 25.27, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Vasculaire (Angioscanner membres inf.)", code: "EMQH001", libelle: "Scanner des vaisseaux des membres inférieurs [Angioscanner]", tarif: 25.27, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Vasculaire (Angioscanner abdomino-pelvien)", code: "ELQH002", libelle: "Scanner des vaisseaux de l'abdomen et/ou du petit bassin [Angioscanner]", tarif: 25.27, specialites: ["Radiologue", "Médecin vasculaire"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Membre supérieur", code: "MZQK002", libelle: "Scanner uni/bilatéral de segment du membre supérieur, sans injection", tarif: 25.27, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "Scanner", zone: "Membre supérieur", code: "MZQH002", libelle: "Scanner uni/bilatéral de segment du membre supérieur, avec injection", tarif: 25.27, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Membre supérieur (arthroscanner)", code: "MZQH001", libelle: "Arthrographie du membre supérieur avec scanner [Arthroscanner] — acte combiné, tarif incluant l'injection intra-articulaire", tarif: 79.80, specialites: ["Radiologue", "Rhumatologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Membre inférieur", code: "NZQK002", libelle: "Scanner uni/bilatéral de segment du membre inférieur, sans injection", tarif: 25.27, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.MIXTE },
  { modalite: "Scanner", zone: "Membre inférieur", code: "NZQH001", libelle: "Scanner uni/bilatéral de segment du membre inférieur, avec injection", tarif: 25.27, specialites: ["Radiologue", "Rhumatologue", "Médecin du sport"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Membre inférieur (arthroscanner)", code: "NZQH002", libelle: "Arthrographie du membre inférieur avec scanner [Arthroscanner] — acte combiné, tarif incluant l'injection intra-articulaire", tarif: 93.10, specialites: ["Radiologue", "Rhumatologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Côlon (coloscanner virtuel)", code: "HHQK484", libelle: "Scanner du côlon avec insufflation [coloscopie virtuelle], sans injection", tarif: 54.45, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Côlon (coloscanner virtuel)", code: "HHQH365", libelle: "Scanner du côlon avec insufflation [coloscopie virtuelle], avec injection", tarif: 74.25, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Pelvimétrie obstétricale", code: "ZCQK003", libelle: "Pelvimétrie par scanner", tarif: 25.27, specialites: ["Radiologue", "Gynécologue-obstétricien"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Corps entier (3 territoires ou plus)", code: "ZZQK024", libelle: "Scanner de 3 territoires anatomiques ou plus, sans injection (ex. bilan oncologique thoraco-abdomino-pelvien)", tarif: 75.81, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE },
  { modalite: "Scanner", zone: "Corps entier (3 territoires ou plus)", code: "ZZQH033", libelle: "Scanner de 3 territoires anatomiques ou plus, avec injection", tarif: 75.81, specialites: ["Radiologue"], recrutement: AI_RECRUTEMENT.SPECIALISTE }
];
