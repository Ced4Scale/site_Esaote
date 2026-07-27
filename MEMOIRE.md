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
- Le formulaire de contact fonctionne avec `mailto:`. Pour un vrai envoi automatique, prévoir Formspree, Web3Forms ou autre service équivalent.

## Journal

### 2026-07-27

- Refonte du premier écran : le hero synthétise désormais les 5 IRM et propose des mini-fiches cliquables vers chaque modale produit.

- Ajout de deux photos O-scan issues de la brochure officielle Esaote : patient installé pour genou/jambe et patient positionné main/poignet.

- Ajout de l'ensemble des visuels significatifs de la brochure officielle O-scan dans le carrousel O-scan : photos produit, photos patient, exemples IRM et détails machine.

- Ajout de l'argument IRM dynamique : O-scan, S-scan, G-scan et Magnifico avec formulation adaptée ; I-Genius formulé en contrôles IRM per-opératoires répétés.

- Ajout de visuels issus des brochures officielles S-scan Open, G-scan Brio et Magnifico Open ; ajout de visuels publics officiels Esaote pour I-Genius faute de brochure PDF publique trouvée.

- Ajout de la vidéo officielle Vimeo Esaote "S-Scan Open: Open to the Future" dans la modale S-scan.

- Déplacement des vidéos sous le CTA des fiches produits, dans un bouton repliable "Voir les vidéos" pour les 5 IRM.

- Enrichissement des carrousels produits : chaque IRM dispose désormais de 5 images issues des pages officielles Esaote ou de leurs visuels produits associés.

- Ajout de l'IRM intra-opératoire I-Genius comme 5e fiche produit, positionnée bloc opératoire neurochirurgie.

- Ajout de photos officielles Esaote supplémentaires pour les 4 IRM et mise en place d'un carrousel automatique toutes les 3 secondes sur les cartes produits et les modales.

- Reformulation de l'argument Magnifico : remplacement de « consommation dérisoire » par une mention explicite des coûts d'électricité et d'eau glacée très réduits.

- Ajout argument moyen champ + IA/prothèses : 1 bullet par fiche IRM et renforcement de la section Complémentarité, avec formulation prudente sur la réduction des artéfacts métalliques.

- Désignation demandée pour l'O-scan : IRM ouverte Fauteuil.

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
