# Site vitrine IRM — Esaote Medical France

Support commercial (page vitrine statique) présentant la gamme d'IRM ouvertes Esaote,
pour **Cédric Goillot**, consultant Esaote Medical France.

Site **statique** (HTML / CSS / JS, aucun backend). Charte graphique reprise d'esaote.com.

## Contenu
- `index.html` — page principale : hero, gamme des 4 IRM (fenêtres détaillées), 3 piliers, rentabilité, RSE, cible, contact.
- `contact.html` — formulaire de contact (envoi via `mailto:`, upgradable en envoi automatique).
- `styles.css` — charte Esaote (rouge `#CD0000`, Montserrat).
- `script.js` — fenêtres produits (modales), menu mobile.
- `assets/` — logo + visuels officiels des IRM.

## Voir en local
Ouvrir `index.html` dans un navigateur (double-clic).

## Mise en ligne (GitHub Pages)
1. Pousser ce dépôt sur GitHub.
2. Repo → **Settings → Pages** → *Source : Deploy from a branch* → branche `main`, dossier `/ (root)`.
3. (Optionnel) **Custom domain** : saisir le domaine OVH, puis créer les enregistrements DNS chez OVH.
4. Cocher **Enforce HTTPS**.

Le fichier `.nojekyll` désactive le traitement Jekyll (site 100 % statique).

## À finaliser
- Optionnel : envoi automatique du formulaire via Formspree / Web3Forms.

---
Marque, logo et visuels © Esaote S.p.A. — utilisés dans le cadre de la présentation de la gamme par un consultant Esaote.
