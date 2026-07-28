# Mémoire du projet site Esaote

Ce fichier sert de carnet de bord pour conserver le contexte du projet, les décisions prises et les prochaines modifications à faire sur le site.

## Projet

- Dépôt GitHub : https://github.com/Ced4Scale/site_Esaote.git
- Dossier local : `/Users/Cedric/Documents/site_Esaote`
- Type de site : site statique HTML / CSS / JavaScript
- Pages principales :
  - `index.html` : page d'accueil, présentation de la gamme IRM, arguments, RSE, contact
  - `contact.html` : page de contact et formulaire via `mailto:`
  - `styles.css` : styles visuels du site
  - `script.js` : menu mobile et modales produits

## Objectif

Mettre à jour progressivement le site vitrine Esaote Medical France, notamment les textes, les coordonnées, les arguments commerciaux, les détails produits et éventuellement la mise en ligne.

## Informations actuellement visibles dans le site

- Contact : Cédric Goillot
- Rôle : Consultant — Esaote Medical France
- E-mail : `cedric.goillot@ced4scale.fr`
- Téléphone : `06 80 73 52 33`
- Localisation : Bordeaux (33) — Esaote Medical France

## Contenus importants à modifier si besoin

- Titre principal de la page d'accueil : "Révolutionnez l'IRM"
- Accroche hero : IRM ouvertes, dédiées et sans hélium, complémentaires des IRM 1,5 T / 3 T
- Section produits : O-scan, S-scan, G-scan, Magnifico, I-Genius
- Section "Pourquoi Esaote" : 4 arguments affichés dans la page
- Section RSE : sobriété, zéro hélium, consommation minimale, installation simple, certifications ISO
- Page contact : textes d'introduction, coordonnées, options du formulaire, e-mail destinataire dans le script

## Points relevés

- Le site est simple à modifier : pas de framework, pas de build obligatoire.
- Le README indique "3 piliers" alors que la page affiche 4 arguments. À corriger lors d'un passage de nettoyage.

### 2026-07-28

- Ajout de phrases KOL à partager dans l'onglet "Voir les références" lorsqu'une source officielle Esaote contient une citation exploitable : O-scan, S-scan, G-scan et Magnifico. I-Genius reste sans phrase KOL de site installé faute de source nominative publique trouvée.
- Section "Champ moyen en pratique" recentrée sur la curiosité commerciale : retrait du lien "Voir le document source" et suppression de la mention "Documents Esaote France" dans l'accroche.
- Renforcement O-scan sur l'imagerie dynamique du genou : ajout des mots-clés "Genou dynamique" et "True-Motion", ajout du visuel True-Motion au carrousel et reformulation du bénéfice avec "selon configuration".
- Le bouton "Demander une présentation Teams" ouvre désormais `contact.html?demande=presentation-teams#contactForm` avec une fiche préremplie et 4 thèmes à cocher : implants/prothèses, IRM dynamique, rachis en charge, interventionnel rachis.
- Les arguments défilants des carrousels sont désormais placés sous les images, sur une ligne dédiée, avec un défilement ralenti.
- Lecteur de documents PDF corrigé : iframe fixe sous l'en-tête, scroll activé et paramètres PDF pour afficher les documents avec navigation verticale au-delà de la première page.
- Ajout des arguments défilants O-scan "Easy to use" et "Confort" sur la carte produit et dans la modale.
- Clarification des arguments IA défilants : S-scan affiche "IA e-SPADES selon config." et Magnifico affiche "IA HyperClarity" en plus de "IA e-SPADES".
- Références KOL : retrait du préfixe "Phrase KOL à partager" sur les citations O-scan, S-scan, G-scan et Magnifico pour ne conserver que la phrase.
- Enrichissement des références installées : ajout de sites publics supplémentaires avec établissement, ville/pays et référent public quand disponible (O-scan : St. Augustine, Columbia Memorial, Prof. Thermann Heidelberg ; S-scan : Prof. Thermann Heidelberg ; G-scan : Glan Clwyd, Spine Nevada ; Magnifico : ROC Aschheim).
- Section "Champ moyen en pratique" enrichie avec un 5e argument I-Genius : bloc neuro / iMRI, contrôles per-opératoires sans transfert patient. La fiche Teams ajoute aussi le thème "Bloc neuro / I-Genius" à cocher.
- Formulaire contact Teams enrichi : ajout des thèmes champs moyens, retour sur investissement et présentation produit au choix pour O-scan, S-scan, G-scan, Magnifico et I-Genius.
- I-Genius : l'onglet anciennement "Voir les examens" est renommé "Voir le workflow", car les visuels disponibles sont des visuels de workflow/démonstration et non des images d'examens diagnostiques.
- Contact : ajout de "Retour sur investissement" dans le menu Sujet. Le champ Sujet qualifie la demande principale ; les thèmes à cocher détaillent le contenu souhaité pour une présentation Teams.
- Contact : la case "Retour sur investissement" dans les thèmes Teams reçoit une couleur ambre distincte pour mieux ressortir.
- Contact : le libellé "Message *" devient "Précisions sur votre projet *".
- Audit qualité images : retrait des visuels basse définition des carrousels produits/cartes et modales. Les carrousels de présentation ne conservent que des images autour de 1080-1200 px ; les images plus petites restent uniquement dans les onglets dédiés quand elles sont utiles comme documents, examens, antennes ou workflow.
- Page champ moyen : les 5 blocs d'arguments cliniques sont affichés sur une seule ligne en desktop, avec repli en 2 colonnes puis 1 colonne sur écrans plus petits.
- Images : retrait des photos perçues comme tronquées dans les carrousels principaux O-scan et G-scan, et suppression du léger zoom au survol des cartes pour éviter tout recadrage visuel.
- Carrousel arguments : réduction de la taille de police et de la hauteur de la ligne de mots-clés qui défile sous les photos.
- Branding : remplacement du logo/libellé "Esaote Medical France" en haut de page par le logo Ced4Scale fourni par Cédric. Les crédits Esaote restent conservés dans le footer pour les marques et visuels produits.
- Footer : remplacement de la mention consultant Esaote Medical France par Ced4Scale et suppression de la phrase "Présentation commerciale de la gamme d'IRM ouvertes Esaote".
- Argument "Simple d'utilisation" : ajout de l'écran intégré au statif pour aider au positionnement patient et indiquer la présence d'un élément métallique détecté, avec formulation prudente.
- Carrousels produits : les badges de type "Open-Fauteuil · 0,31 T" restent au-dessus des images pendant le changement de photo pour éviter le clignotement.
- Argument "Simple d'utilisation" : remplacement de "sans formation lourde" par une promesse plus concrète sur un MERM opérationnel après une journée de formation, même sans expérience IRM corps entier, avec rappel de l'écran intégré au statif.
- O-scan/Open-Fauteuil : retrait de l'image générique True Motion du carrousel, jugée non adaptée pour illustrer le dynamique O-scan. Les images genou O-scan disponibles restent dans l'onglet examens car elles sont trop petites pour un carrousel principal HD.
- Documents : la brochure O-scan est rendue en 12 images PNG haute résolution dans `assets/docs/o-scan-brochure-pages/` et affichée en scroll vertical dans `document.html`, pour éviter le blocage iPad/Safari sur la première page d'un PDF dans iframe.
- Documents : ajout d'un document "Marquage CE / déclaration de conformité" dans les 5 fiches IRM. Les 4 documents O-scan, S-scan Open, G-scan Brio et Magnifico Open pointent vers les rubriques officielles Esaote DCS Revision 3.17 ; I-Genius est présenté comme conformité à confirmer car aucune déclaration CE séparée publique n'a été identifiée.
- Références : `reference.html` affiche maintenant une fiche en français dans le site, avec produit, lieu, référent public, synthèse traduite et citation quand disponible, puis un bouton vers la source originale. La croix en haut à droite reste le retour à la page précédente/au produit.
- Vidéos O-scan : ajout de la vidéo Vimeo officielle "Interview Dr Thom Lebeau - O-scan à la clinique St. Augustine" avec un sous-titrage/traduction française affiché sous la vidéo et repris dans la lightbox agrandie.
- Vidéos O-scan : retrait de l'ancienne vidéo officielle générique "Engineered for Performance, Designed for Comfort" car elle ne correspond plus au positionnement marché français actuel où une seule O-scan est commercialisée.
- I-Genius : ajout de l'argument hygiène/workflow bloc avec formulation validée par Cédric : patient maintenu au bloc, sur la même table, sans transfert vers le service d'imagerie, avec réduction de la complexité, des ruptures de workflow et du risque infectieux.
- I-Genius : remplacement de "table intégrée" / "table opératoire intégrée" par "table de bloc intégrée" dans la banderole et les bénéfices.
- O-scan : remplacement de "ou en cabinet spécialisé" par une formulation marché français : installation en radiologie centrale ou dans le service d'imagerie en coupe.
- Examens métal : création et mise en ligne de `examens-metal.html`, page publique de démonstration avec 6 séries d'images DICOM converties localement en JPEG, sans fichiers DICOM ni tags patient. Lien ajouté depuis l'argument "Implants et prothèses".
- RSE : précision de la formulation "Technologie d'aimant permanent" pour nommer la technologie sans hélium ni cryogénie.
- Le formulaire de contact fonctionne avec `mailto:`. Pour un vrai envoi automatique, prévoir Formspree, Web3Forms ou autre service équivalent.

## Journal

### 2026-07-28

- Documents officiels Esaote mis à jour pour les 5 IRM : brochures récentes O-scan, S-scan Open, G-scan Brio, Magnifico Open et I-Genius ; DICOM Conformance Statement MRI Rel. 3.17 commun ; IHE Integration Statement ajouté quand publié sur la page produit Esaote (O-scan, G-scan Brio, Magnifico Open).

- Ajout d'un onglet "Références" sur les 5 fiches IRM : Royal Bournemouth Hospital pour O-scan, Zucchi Clinical Institutes pour S-scan Open, Tristate Brain and Spine Institute pour G-scan Brio, Sport Ortho Urgent Care pour Magnifico Open, EANS 2025 et LinkedIn Esaote pour I-Genius. Création de `reference.html` avec croix de retour et bouton d'ouverture de la source officielle.

- Ajout de deux images cliniques officielles Esaote e-SPADES/HyperClarity dans les examens Magnifico, avec badge "HyperClarity" sous chaque image concernée.

- Ajout de mots-clés défilants sur les carrousels d'images des 5 IRM, dans les cartes produits et les modales : Open, dynamique, interventionnel, en charge, IA, HyperClarity, etc.

- Ajout d'une lightbox vidéo : clic ou clavier sur une vidéo de fiche produit ouvre la vidéo en grand format, avec croix en haut à gauche, clic sur le fond ou touche Échap pour revenir à la fiche.

- Simplification de la section "Champ moyen en pratique" : suppression des images dans les 4 arguments cliniques, conservation des titres et synthèses, ajout d'un bouton de demande de présentation Teams.

- Précision du débit patient : 2 à 3 patients/heure en diagnostic, 3 à 5 patients/heure pour des contrôles post-opératoires ciblés.

- Formulaire contact enrichi avec fonction, numéro de téléphone et timing projet (3 mois, 6 mois, 12 mois, plus de 12 mois), inclus dans le mailto généré.

- Remplacement des mots-clés uniques par un bandeau d'arguments défilants de gauche à droite sur les carrousels des 5 IRM, avec environ 10 arguments par IRM.

- Enrichissement de l'onglet "Voir les références" : site installé ou référence publique, ville/pays, nom des médecins ou intervenants publiquement cités, et lien média/interview/vidéo quand disponible.

- Les badges UniHA O-scan et G-scan pointent désormais vers le marché UniHA Imagerie de coupe 2025, réf. M_2728 : O-scan lot 9 IRM bas champ dédié extrémités, G-scan lot 8 IRM bas champ ostéoarticulaire en charge.

- Ajout d'un onglet "Documents" dans la fiche O-scan avec les documents officiels fournis : brochure, DICOM Conformance Statement et IHE Integration Statement. La brochure est aussi utilisée comme source d'images d'examens supplémentaires.

- Ajout d'un lecteur `document.html` pour ouvrir les PDF dans une page du site avec une croix en haut à droite permettant de revenir à la page précédente.

- Ajout d'une section "Champ moyen en pratique" à partir des documents Esaote France fournis : susceptibilité/implants métalliques, True Motion, rachis en charge et interventionnel rachis lombaire. Le PDF du cours est ajouté aux documents du site. Les contenus HyperSpeed/HyperClarity marqués "CE mark pending / research only" sont conservés comme source interne mais non transformés en promesse commerciale publique.

### 2026-07-27

- Ajout de la mention et du logo UniHA sur les fiches O-scan et G-scan : appareils indiqués comme référencés UniHA pour les projets d'achat hospitalier. Logo récupéré depuis le site officiel uniha.org.

- Nettoyage des carrousels de présentation des 5 IRM : retrait des images d'examens et d'antennes, conservées uniquement dans les onglets dédiés.

- Amélioration du visualiseur d'images : navigation précédente/suivante dans la même galerie, flèches visibles, clavier gauche/droite et glissement horizontal pour parcourir les antennes agrandies.

- Remplacement/enrichissement des galeries d'antennes S-scan, G-scan et Magnifico avec des visuels individuels officiels Esaote mieux cadrés ; I-Genius conserve les visuels disponibles faute de galerie antennes officielle équivalente.

- Refonte du premier écran : le hero synthétise désormais les 5 IRM et propose des mini-fiches cliquables vers chaque modale produit.

- Ajout de deux photos O-scan issues de la brochure officielle Esaote : patient installé pour genou/jambe et patient positionné main/poignet.

- Ajout de l'ensemble des visuels significatifs de la brochure officielle O-scan dans le carrousel O-scan : photos produit, photos patient, exemples IRM et détails machine.

- Ajout de l'argument IRM dynamique : O-scan, S-scan, G-scan et Magnifico avec formulation adaptée ; I-Genius formulé en contrôles IRM per-opératoires répétés.

- Ajout de visuels issus des brochures officielles S-scan Open, G-scan Brio et Magnifico Open ; ajout de visuels publics officiels Esaote pour I-Genius faute de brochure PDF publique trouvée.

- Ajout de la vidéo officielle Vimeo Esaote "S-Scan Open: Open to the Future" dans la modale S-scan.

- Déplacement des vidéos sous le CTA des fiches produits, dans un bouton repliable "Voir les vidéos" pour les 5 IRM.

- Renforcement des autorisations plein écran sur toutes les vidéos intégrées : `fullscreen`, `allowfullscreen`, compatibilité WebKit/Mozilla.

- Enrichissement des carrousels produits : chaque IRM dispose désormais de 5 images issues des pages officielles Esaote ou de leurs visuels produits associés.

- Ajout d'un onglet "Voir les examens" sous les vidéos pour les 5 IRM ; O-scan, S-scan, G-scan et Magnifico utilisent des images cliniques officielles Esaote, tandis qu'I-Genius présente des visuels de workflow clinique faute de galerie publique d'images d'examens dédiée.

- Ajout d'un agrandissement au clic sur les images d'examens : visualiseur plein écran, fermeture par croix, clic sur le fond ou touche Échap.

- Ajout d'un onglet "Voir les antennes" sous les vidéos et les examens pour les 5 IRM, avec icône dédiée, visuels d'antennes disponibles et agrandissement au clic.

- Correction O-scan : ajout de l'antenne genou DPA manquante, conformément à la page officielle Esaote qui liste genou, main/poignet et cheville/pied.

- Pour S-scan, découpe de l'image "jeu d'antennes MSK" en vignettes individuelles : genou, main/poignet, cheville/pied, épaule, rachis cervical, rachis lombaire, tête, hanche flexible et ATM.

- Ajout de l'IRM intra-opératoire I-Genius comme 5e fiche produit, positionnée bloc opératoire neurochirurgie.

- Ajout de photos officielles Esaote supplémentaires pour les 4 IRM et mise en place d'un carrousel automatique toutes les 3 secondes sur les cartes produits et les modales.

- Reformulation de l'argument Magnifico : remplacement de « consommation dérisoire » par une mention explicite des coûts d'électricité et d'eau glacée très réduits.

- Ajout argument moyen champ + IA/prothèses : 1 bullet par fiche IRM et renforcement de la section Complémentarité, avec formulation prudente sur la réduction des artéfacts métalliques.

- Désignation demandée pour l'O-scan : IRM Open Fauteuil.

- Ajout demandé sur la fiche O-scan : formation du manipulateur en électroradiologie médicale (MERM) en 1 journée, ou 4 manipulateurs en électroradiologie médicale (MERM) formés en 2 jours.

### 2026-07-26

- Repo local identifié : `/Users/Cedric/Documents/site_Esaote`
- Structure inspectée : HTML / CSS / JS statique
- Création de ce fichier mémoire pour garder le contexte des échanges et décisions.

## Prochaines étapes possibles

- Remplacer ou affiner les textes commerciaux.
- Vérifier les coordonnées définitives.
- Corriger le README.
- Tester l'affichage local dans un navigateur.
- Committer et pousser les modifications sur GitHub.
- Vérifier la publication GitHub Pages si elle est activée.
