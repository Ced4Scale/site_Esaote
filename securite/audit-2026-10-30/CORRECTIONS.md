# Failles de sécurité et corrections — audit du 2026-10-30

> **Pour qui ?** Ce fichier est écrit pour **Claude Code** (l'assistant qui gère le site sur
> le Mac de Cédric). Il décrit chaque faille trouvée, pourquoi elle est exploitable, et la
> correction précise à appliquer. Une explication **non technique** (pour Cédric) existe en
> PDF à part, hors du dépôt.
>
> Le journal de sécurité « propriétaire » reste [`../SECURITE.md`](../SECURITE.md). Ce
> fichier-ci est un plan d'action daté ; reporte dans `SECURITE.md` ce qui est corrigé.

## Contexte à garder en tête

- Le dépôt `Ced4Scale/site_Esaote` est **public** : tout ce qui est commité (code **et**
  historique) est lisible par n'importe qui, immédiatement.
- Le site est **statique** sur **GitHub Pages**, déployé **automatiquement** à chaque push
  sur `main` (aucune étape manuelle). Donc **commiter = mettre en ligne**.
- Conséquence structurelle : **aucun vrai secret ne peut être protégé par du code côté
  navigateur.** Tout ce que le navigateur sait faire, le visiteur peut le refaire à la main.

## ⚠️ Ordre des opérations (important)

1. **D'ABORD** : révoquer + régénérer le jeton GoatCounter (faille nº 1). C'est le **seul
   vrai secret** du dépôt, et il est toujours en ligne. À faire avant tout le reste.
2. **ENSUITE** : ce fichier sera public dès le push. Il ne contient volontairement **pas**
   de mode d'emploi d'attaque (ça, c'est dans le PDF gardé hors dépôt), mais il pointe les
   fichiers sensibles. Ne le pushe qu'une fois le jeton régénéré.
3. Le reste (gates, DMARC, protections GitHub…) peut suivre tranquillement.

---

## 🔴 1. Jeton GoatCounter exposé en clair (CRITIQUE)

- **Fichier :** `assets/stats-access.js`, champ `apiToken` (~ligne 8).
- **Ce qui ne va pas :** un jeton d'API GoatCounter est écrit en clair dans un fichier public,
  et **envoyé depuis le navigateur** de chaque visiteur (il est donc visible à la fois sur
  GitHub **et** dans les outils développeur de n'importe quel visiteur). Déjà signalé le
  10/08/2026 dans `SECURITE.md` ; **toujours présent et servi en ligne** au 2026-10-30
  (`https://ced4scale.fr/assets/stats-access.js` → 200).
- **Pourquoi c'est exploitable :** quiconque a vu le dépôt ou le site depuis juillet possède
  ce jeton. Le modèle de permissions GoatCounter (code source `api_token.go`) a 6 droits :
  `count` (écrire de fausses visites), `stats` (lire), `export` (exporter **tout** le journal
  de hits), `site_read`, `site_create`, `site_update` (créer/modifier/supprimer des sites).
  Le `/api/v0/me` lancé le 10/08 avait conclu à un accès **large (type admin)**, pas en
  lecture seule. ⇒ Tant que ce jeton vit, considérer le compte GoatCounter comme compromis :
  un tiers peut polluer les stats, exporter l'historique de navigation (pages + horodatage +
  référent + navigateur + pays), voire supprimer/recréer des sites.
- **Correction :**
  1. Cédric se connecte sur `ced4scale.goatcounter.com` → menu utilisateur → **API** →
     **supprime** le jeton actuel et en **crée un nouveau**.
  2. Sur le nouveau jeton, ne cocher **que** `stats` (lecture des statistiques). Décocher
     `count`, `export`, `site_create`, `site_update`. (Même s'il est en lecture seule, un
     jeton public laisse **lire toutes les stats** du site — voir point suivant.)
  3. **Ne plus jamais le remettre en clair dans le code.** Le mettre côté serveur dans un
     **flux Power Automate** (exactement comme `Site_Envoi_Documents_V3` / le flux
     simulateur) : le navigateur appelle le flux, le flux (qui garde le jeton) appelle
     GoatCounter et renvoie le résultat. Le jeton ne sort alors jamais dans le code public.
  4. Retirer `apiToken` de `assets/stats-access.js` et faire passer les appels
     (`apiGet(...)`) par l'URL du flux.
- **Vérifier :** `curl -s https://ced4scale.fr/assets/stats-access.js | grep -c apiToken`
  doit renvoyer `0`.

> **Note « lecture seule, est-ce OK ? »** Un jeton en lecture seule **ne peut pas écrire**
> (pas de `count`/`site_update`). Mais exposé publiquement, il laisse **lire l'intégralité
> des statistiques** : quelles pages/événements, à quelle heure, depuis quel pays — y compris
> les événements métier (`contact-formulaire-envoye`, `examens-deverrouilles-*`,
> `qcm-resultat-*`, clics produits) et la timeline horaire. GoatCounter ne stocke **ni IP ni
> nom** par défaut, donc pas de donnée nominative, mais c'est quand même de la donnée
> **comportementale/commerciale** (quel hôpital a regardé quoi et quand). ⇒ Même en lecture
> seule, passer par le relais Power Automate reste la bonne cible.

---

## 🟠 2. Les « codes d'accès » ne protègent que l'affichage, pas les fichiers

- **Fichiers :** `assets/site-gate.js`, le panneau de `assets/stats-access.js`, les pages
  `examens-*.html`, le pré-chargement de `document.html`.
- **Ce qui ne va pas :** ces « portes » vérifient un code **dans le navigateur** (un simple
  SHA-256 non salé). Or GitHub Pages **sert tous les fichiers sous-jacents** (PDF, images,
  code des pages) directement par URL, sans vérification. La porte ne cache que l'interface,
  pas les octets.
- **Pourquoi c'est exploitable :** il suffit d'ouvrir le code source, ou d'appeler l'URL
  d'un asset directement, pour récupérer un contenu « protégé » sans jamais saisir de code.
  (Bon point actuel : les deux PDF `*-site-planning-guide-non-public.pdf` sont **référencés
  mais pas commités** → `404`. Ne jamais les committer dans ce dépôt public.)
- **Correction :** décider, par contenu, ce qui est *vraiment* confidentiel.
  - Contenu réellement sensible ⇒ **ne pas le mettre dans un site statique public**. Le
    servir via un flux Power Automate (comme l'envoi de documents, avec validation de Cédric).
  - Contenu « juste pas encore prêt » ⇒ la porte actuelle suffit comme gêne cosmétique, mais
    **ne jamais commiter dans ce dépôt** un fichier qu'on ne veut pas voir public.
  - Ne pas confondre « caché de l'interface » et « protégé ».

---

## 🟠 3. Le code d'accès est devinable (numéro publié + hachage faible)

- **Fichiers :** hash dans `assets/site-gate.js` (`ACCESS_HASH`) et pages examens ; le code
  en clair apparaît dans `MEMOIRE.md` et d'autres fichiers **du même dépôt public**.
- **Ce qui ne va pas :** le code est un **numéro de téléphone**, et ce numéro est écrit en
  clair ailleurs dans le dépôt public ; son SHA-256 correspond au hash de la porte. De plus,
  un SHA-256 **non salé** d'un numéro à ~10 chiffres se retrouve par force brute **hors
  ligne** en quelques secondes.
- **Pourquoi c'est exploitable :** le « secret » est publié à côté de la serrure. N'importe
  qui lisant le dépôt obtient le code sans effort.
- **Correction :** si une porte doit exister, (a) ne jamais réutiliser une valeur déjà
  publiée (numéro, e-mail…) ; (b) ne jamais commiter le code en clair dans le dépôt ; (c)
  idéalement, pour du vrai contrôle d'accès, utiliser un backend (le relais Power Automate),
  pas un hash côté navigateur. Voir aussi faille nº 7 (sortir `MEMOIRE.md` du dépôt public).

---

## 🟠 4. DMARC en `p=none` (surveillance seulement)

- **Où :** DNS du domaine `ced4scale.fr` (zone OVH), enregistrement `_dmarc.ced4scale.fr`.
- **État au 2026-10-30 :** DKIM **présent** (les 2 sélecteurs `selector1/2._domainkey`
  résolvent ✅ — progrès depuis le 10/08), SPF strict (`-all`) ✅, DMARC **présent mais en
  `p=none`**.
- **Ce qui ne va pas :** `p=none` ne fait que *surveiller*. Il ne demande pas aux serveurs
  de messagerie de bloquer un e-mail qui usurpe `@ced4scale.fr`.
- **Pourquoi c'est exploitable :** un phishing se faisant passer pour `cedric.goillot@…` vers
  un hôpital passe plus facilement (SPF/DKIM aident, mais sans `p=quarantine/reject` rien
  n'est mis en quarantaine automatiquement).
- **Correction (zone DNS OVH) :** passer `_dmarc.ced4scale.fr` à
  `v=DMARC1; p=quarantine; rua=mailto:cedric.goillot@ced4scale.fr`, puis après quelques
  semaines sans souci, durcir en `p=reject`. (Nécessite l'accès DNS OVH, pas GitHub.)

---

## 🟡 5. Aucune protection de branche / scan de secrets désactivé

- **Où :** réglages GitHub du dépôt `Ced4Scale/site_Esaote`.
- **État :** `main` non protégée, aucun ruleset, **secret scanning** et **push protection**
  **désactivés**. 2 collaborateurs (`maxndre` write, `Ced4Scale` admin). Pages déploie auto
  depuis `main` ⇒ **un push = une mise en prod**, sans filet.
- **Pourquoi ça compte :** la **push protection** aurait **bloqué** le jeton de la faille nº 1
  au moment du commit. Sans protection de branche, une erreur ou un compte compromis publie
  directement.
- **Correction :** dans Settings → Code security : activer **Secret scanning** + **Push
  protection** (gratuit sur dépôt public). Ajouter un ruleset minimal sur `main` (au moins
  interdire force-push / suppression).

---

## 🟡 6. URLs Power Automate dans le code + anciens flux dans l'historique

- **Fichiers :** `document.html`, `simulateur-recettes.html`, et autres simulateurs
  (variable `*_REQUEST_URL`).
- **Constat :** les URLs de déclenchement (avec signature `sig=`) sont dans le code source
  **par construction** (flux HTTP appelé depuis le navigateur) — attendu. Mais :
  - l'**historique git** contient **4 anciens flux** (V1/V2 document, anciens simulateurs) ;
    leurs signatures restent valides tant que ces flux ne sont pas supprimés/régénérés.
  - le **flux d'envoi de simulation par e-mail part sans validation** → un rejeu permet
    d'envoyer un PDF arbitraire à une adresse arbitraire (Cédric en copie, donc visible).
- **Correction :** dans Power Automate, **supprimer** (ou régénérer l'URL de) les anciens flux
  non utilisés ; pour le flux d'e-mail simulateur, ajouter une limite (ex. captcha léger,
  quota, ou validation) si l'abus devient un sujet. Impact actuel jugé faible.

---

## 🟡 7. Données personnelles sur un dépôt public (RGPD / vie privée)

- **Constat :** le dépôt public contient (a) des **images IRM de patients** (anonymisées : 
  vérifié par sondage, **pas** de nom/date de naissance incrustés, **pas** d'EXIF — conforme
  à ce que dit `MEMOIRE.md`), et (b) `MEMOIRE.md` qui affiche l'**e-mail direct et le mobile**
  de Cédric en clair (ce mobile étant justement le code d'accès des portes — cf. nº 3).
- **Pourquoi ça compte :** publier de l'imagerie patient sur un site **public** demande une
  **base légale / un consentement documenté**, même anonymisée. Et `MEMOIRE.md` /
  `securite/` n'ont pas à être publics.
- **Correction :**
  - Faire valider la base légale des images patients (consentement / anonymisation
    documentée) — point juridique, à soulever avec Cédric.
  - Sortir `MEMOIRE.md` (et éventuellement `securite/`) du dépôt public : soit les déplacer
    dans un dépôt privé, soit les retirer du suivi git (et **purger l'historique** si besoin,
    car ils restent lisibles dans les anciens commits).

---

## 🟡 8. Pages privées chiffrées — solides, une réserve

- **Fichiers :** `accueil-prive.html`, `voyage*.html`, `restaurant*.html`,
  `avantage-chef*.html` (bloc `crypto.subtle.decrypt`).
- **Constat :** vrai chiffrement côté navigateur — **AES-GCM** + **PBKDF2-SHA256 à 600 000
  itérations**. Le contenu **n'est pas récupérable** depuis le dépôt sans le mot de passe
  (contrairement aux portes SHA-256 ci-dessus). C'est bien.
- **Réserve :** les 32 pages partagent **le même sel** (`SEL="/mmhT5Yz…"`), et tout repose sur
  le mot de passe. (L'audit **n'a pas** tenté de le retrouver.)
- **Correction (hygiène) :** utiliser un mot de passe **long et aléatoire**, et surtout
  **différent** du code public des portes (nº 3). Idéalement, un sel distinct par page lors
  d'un prochain regénération. Pas d'urgence.

---

## Récapitulatif des priorités

| # | Gravité | Faille | Action clé | Qui / où |
|---|---------|--------|-----------|----------|
| 1 | 🔴 | Jeton GoatCounter public | Révoquer + relais Power Automate | Cédric (UI) + code |
| 2 | 🟠 | Portes cosmétiques | Ne pas confondre caché/protégé | Décision par contenu |
| 3 | 🟠 | Code = numéro publié | Ne pas réutiliser / ne pas commiter | Code + nº 7 |
| 4 | 🟠 | DMARC `p=none` | Passer `p=quarantine` puis `reject` | DNS OVH |
| 5 | 🟡 | Pas de protection GitHub | Activer push protection + ruleset | Réglages GitHub |
| 6 | 🟡 | Anciens flux / e-mail sans validation | Nettoyer flux Power Automate | Power Automate |
| 7 | 🟡 | Données perso sur dépôt public | Sortir `MEMOIRE.md`, valider images | Dépôt + juridique |
| 8 | 🟡 | Pages chiffrées | Mot de passe long ≠ code public | Hygiène |

*Audit réalisé le 2026-10-30. Détail « attaque » non technique : voir le PDF remis à Cédric
(hors dépôt).*
