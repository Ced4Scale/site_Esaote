# Sécurité du site ced4scale.fr

> Document vivant — à relire et compléter à chaque revue de sécurité. Ne pas dupliquer
> son contenu ailleurs : ce fichier est le propriétaire unique de l'état de sécurité du
> site. Dernière revue : **10/08/2026** (2 passes le même jour — la seconde va plus loin
> qu'une simple revue du site : jsPDF/CDN et sécurité e-mail du domaine).

## Contexte technique du site

- Site statique hébergé sur **GitHub Pages** (dépôt `Ced4Scale/site_Esaote`), domaine
  personnalisé `ced4scale.fr`.
- Le dépôt GitHub est **public** — tout son contenu (code, historique des commits) est
  lisible par n'importe qui, y compris quelqu'un qui ne visite jamais le site lui-même.
- Aucun serveur applicatif : tout le code qui s'exécute (formulaires, simulateurs,
  export PDF) tourne **dans le navigateur du visiteur**. Les seules briques serveur sont
  des déclencheurs **Power Automate** (automatisations Microsoft), appelés directement
  depuis le navigateur via une URL signée.

Cette architecture a une conséquence structurelle importante : **tout ce qui est écrit
dans le code du site (fichiers `.html`, `.js`) est visible par tout le monde**, qu'il
s'agisse du code affiché à l'écran ou d'un identifiant qu'on croit "caché" dans un
fichier. Il ne faut donc jamais y mettre un secret qui donnerait, s'il était trouvé, un
accès plus large que ce que le site est censé permettre.

## État au 10/08/2026

### 🔴 Trouvé : un jeton d'accès complet exposé publiquement

**Fichier concerné** : `assets/stats-access.js`, ligne 8 (`apiToken`).

**Ce que c'est** : un jeton d'authentification vers l'API du service de statistiques de
fréquentation **GoatCounter** (compte `ced4scale.goatcounter.com`), utilisé pour
afficher le tableau de bord de fréquentation accessible en cliquant sur le logo
Ced4Scale.

**Pourquoi c'est un problème** : ce jeton est écrit **en clair** dans un fichier du
dépôt public. N'importe qui peut le lire — pas seulement un visiteur du site, mais
quiconque consulte le code source sur GitHub.

**Gravité réelle vérifiée le 10/08/2026** : le jeton s'appelle
`ced4scale-site-lecture` (nom qui suggère "lecture seule"), mais la vérification
directe auprès de l'API GoatCounter (`GET /api/v0/me`) montre que le compte associé a en
réalité un accès **`"access": {"all": "a"}`** — le niveau le plus large (assimilable à
un accès administrateur), pas une lecture restreinte. **Le nom du jeton est trompeur :
ce n'est pas un accès en lecture seule.**

**Ce que quelqu'un qui trouverait ce jeton pourrait faire, dans le pire des cas** :
consulter l'intégralité des statistiques de fréquentation, mais potentiellement aussi
modifier les réglages du compte GoatCounter, exporter des données, voire créer/supprimer
d'autres jetons — l'étendue exacte dépend de ce que couvre ce niveau d'accès côté
GoatCounter, non documenté publiquement en détail.

**Historique** : vérifié le 10/08/2026 — ce jeton n'a jamais été changé depuis son
premier ajout au dépôt ; c'est le seul secret jamais trouvé dans l'historique complet
des commits (`git log --all`) sur l'ensemble du dépôt.

**⚠️ Action requise, qui NE PEUT PAS être faite sans Cédric** : GoatCounter ne propose
aucune API pour créer ou révoquer un jeton — cette opération n'existe que dans
l'interface web du compte (menu utilisateur → API). Il faut que Cédric :
1. Se connecte sur `ced4scale.goatcounter.com`.
2. Aille dans le menu utilisateur → **API**.
3. **Révoque/supprime** le jeton actuel (`ced4scale-site-lecture`).
4. Crée un **nouveau jeton avec les droits les plus restreints possibles** (lecture
   seule des statistiques uniquement, si l'interface le permet de choisir).
5. Donne la nouvelle valeur à Claude Code pour l'appliquer côté site — **de préférence
   pas en la recopiant en clair dans le code comme avant** (voir recommandation
   ci-dessous).

### 🟡 Recommandation : ne plus jamais exposer un jeton en clair dans ce dépôt

Le site dispose déjà, pour d'autres besoins (envoi de documents, envoi des simulations
par e-mail), d'un mécanisme équivalent : une **automatisation Power Automate** appelée
depuis le navigateur, qui garde le secret sensible **côté serveur** (dans la définition
de l'automatisation, jamais visible du visiteur) plutôt que dans le code public.

**Proposition** (pas encore faite, à valider avec Cédric) : construire une automatisation
similaire qui reçoit la demande du tableau de bord de statistiques, appelle l'API
GoatCounter avec le nouveau jeton (stocké uniquement dans l'automatisation), et renvoie
le résultat au site. Le nouveau jeton GoatCounter ne serait alors **jamais** visible dans
le code public — seule une URL d'automatisation signée le serait, comme c'est déjà le
cas pour les autres formulaires du site (voir note ci-dessous sur ce type d'URL).

### 🟢 Vérifié : pas d'autre secret dans le dépôt

Recherche faite sur l'ensemble des fichiers actuels et de **tout l'historique des
commits** (`git log --all -p`, motifs : `apiToken`, `client_secret`, `private_key`,
`-----BEGIN`, `password`, `token`, `bearer`, `secret`, `api key`) : **aucun autre secret
trouvé**, ni dans le code actuel ni dans un ancien commit encore techniquement
consultable.

### 🟢 Vérifié : connexion chiffrée correctement configurée

- HTTPS forcé sur `ced4scale.fr` (redirection automatique depuis le HTTP).
- En-tête `Strict-Transport-Security` présent (`max-age=31556952`, ~1 an) — un navigateur
  qui a déjà visité le site refusera toute tentative de connexion non chiffrée par la
  suite, même sur un réseau piégé (ex. Wi-Fi public malveillant).

### 🟡 Point normal, pas une faille : les URLs Power Automate signées dans le code

Les formulaires du site (demande de documents, envoi de simulations par e-mail) appellent
des URLs Power Automate qui contiennent une longue signature (`sig=...`). Ces URLs sont
visibles dans le code source, **par construction** — c'est ainsi que fonctionne un
déclencheur HTTP Power Automate appelé depuis un navigateur, il n'y a pas d'alternative
plus simple sans faire tourner un vrai serveur.

**Ce que ça permettrait à quelqu'un qui les trouverait** : déclencher ces automatisations
directement (sans passer par le site), avec des données de son choix. Les conséquences
concrètes sont limitées par ce que fait chaque automatisation :
- Le flux d'envoi de documents *restreints* (guides d'implantation) exige déjà une
  validation manuelle de Cédric avant tout envoi réel — un abus ne peut pas faire fuiter
  un document sans qu'il approuve.
- Le flux d'envoi de simulation par e-mail (recettes/énergie) part directement, sans
  validation — un abus pourrait donc spammer une adresse e-mail de son choix avec un PDF
  arbitraire (Cédric reçoit toujours une copie en CC, donc il verrait l'abus). Risque
  jugé faible (pas de donnée confidentielle exposée, pas de coût direct — Power Automate
  Premium est un forfait, pas facturé à l'exécution) mais **pas nul**.

**Pas d'action requise dans l'immédiat** — à surveiller si un jour ces flux devaient
traiter des données plus sensibles.

### 🟡 Limite structurelle de GitHub Pages : pas d'en-têtes de sécurité personnalisés

Impossible d'ajouter des en-têtes comme `Content-Security-Policy` ou `X-Frame-Options`
sur un site hébergé directement par GitHub Pages (pas de configuration serveur
possible). Ce n'est pas une erreur de configuration — c'est une limite du service
d'hébergement gratuit. Une solution existerait (passer par un proxy comme Cloudflare
devant le site, gratuit dans sa version de base) mais représente un changement
d'infrastructure, pas une simple correction — à envisager seulement si un besoin précis
se présente.

### 🟢 Corrigé le 10/08/2026 : intégrité des scripts chargés depuis un CDN externe (SRI)

**Ce qui a été trouvé** : le site charge jsPDF (génération des PDF envoyés par e-mail)
depuis `cdnjs.cloudflare.com`, sans aucune vérification d'intégrité. Si ce CDN était un
jour compromis (ou le fichier remplacé), un navigateur aurait exécuté silencieusement un
script malveillant à la place — potentiellement capable de lire les formulaires
(nom, e-mail) avant leur envoi.

**Corrigé** : ajout de l'attribut `integrity` (hash SHA-512) et `crossorigin="anonymous"`
sur la balise `<script>` de jsPDF, sur les 4 pages qui le chargent
(`simulateur-recettes.html`, `simulateur-energie.html`, `forfait-technique.html`,
`simulateur-point-mort.html`). Le hash a été **recalculé indépendamment** en
téléchargeant le fichier réellement servi et en comparant son empreinte SHA-512 à celle
publiée par cdnjs, avant application — pas une simple copie aveugle. Avec cet attribut,
le navigateur du visiteur **refuse de charger le script** si son contenu ne correspond
plus exactement à ce hash, quelle qu'en soit la raison.

**Reste à surveiller** : si la version de jsPDF change un jour (actuellement 2.5.1), le
hash `integrity` devra être mis à jour en même temps — sinon le script sera bloqué et les
simulateurs cesseront de fonctionner. Toujours vérifier `https://api.cdnjs.com/libraries/jspdf/<version>`
pour le nouveau hash officiel avant de changer la version.

Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com`) et les lecteurs vidéo intégrés
(Vimeo, YouTube) ne sont **pas concernés** par ce type de protection : ce sont des
services dynamiques (Google Fonts) ou des `<iframe>` isolées par le navigateur (vidéos),
pour lesquels SRI ne s'applique pas de la même façon — risque jugé faible dans les deux
cas (fournisseurs majeurs, contenu non exécuté dans le contexte du site).

### 🟡 Trouvé le 10/08/2026 : protection anti-usurpation d'e-mail incomplète sur `ced4scale.fr`

Vérification de la configuration DNS du domaine (pas seulement le site web — la
sécurité du domaine dans son ensemble, pertinente pour un consultant qui échange par
e-mail avec des hôpitaux et cliniques) :

| Protection | État | Ce que ça veut dire |
|---|---|---|
| **SPF** | ✅ Configuré (`v=spf1 include:spf.protection.outlook.com -all`) | Seuls les serveurs Microsoft 365 sont autorisés à envoyer un e-mail "de la part de" `ced4scale.fr` — correctement restrictif (`-all` = rejet strict de tout le reste). |
| **DKIM** | ❌ Absent (aucun enregistrement `selector1._domainkey`/`selector2._domainkey`) | La signature cryptographique qui prouve qu'un e-mail n'a pas été modifié en chemin n'est pas activée. |
| **DMARC** | ❌ Absent (`_dmarc.ced4scale.fr` n'existe pas) | Aucune règle ne dit aux serveurs de messagerie qui reçoivent un e-mail "de `ced4scale.fr`" quoi faire s'il échoue les vérifications SPF/DKIM (le rejeter, le mettre en spam, ou l'accepter quand même) — et aucun rapport n'est envoyé à Cédric en cas de tentative d'usurpation.

**Pourquoi c'est pertinent** : un domaine sans DKIM/DMARC reste plus facilement
imitable par un e-mail de phishing (ex. quelqu'un qui écrit à un hôpital en se faisant
passer pour `cedric.goillot@ced4scale.fr` avec un domaine visuellement proche). Le SPF
seul aide déjà beaucoup, mais DMARC est ce qui permet d'être alerté si ça arrive.

**Pourquoi ce n'a pas pu être corrigé directement** : ces deux protections se
configurent en ajoutant des enregistrements DNS chez l'hébergeur du nom de domaine
(probablement **OVH**, d'après les serveurs DNS observés) — accès auquel Claude Code n'a
pas été donné dans cette session, contrairement au tenant Microsoft 365.

**Action pour Cédric** :
1. Dans **Microsoft 365 admin center** → Paramètres → Domaines → `ced4scale.fr` →
   activer DKIM. Microsoft 365 génère alors 2 enregistrements CNAME à créer chez
   l'hébergeur DNS.
2. Chez l'hébergeur DNS (OVH probablement) : ajouter les 2 CNAME DKIM fournis par
   Microsoft, plus un enregistrement TXT `_dmarc.ced4scale.fr` du type
   `v=DMARC1; p=quarantine; rua=mailto:cedric.goillot@ced4scale.fr` (commencer par
   `p=quarantine`, pas `p=reject`, pour ne pas risquer de bloquer ses propres e-mails
   par erreur au début — durcir vers `p=reject` après quelques semaines sans problème).

**Si Cédric donne l'accès DNS (ou les identifiants OVH) à une future session**, cette
partie peut être terminée sans lui — à proposer la prochaine fois que ce sujet revient.

### 🟢 Vérifié le 10/08/2026 : pas de risque de prise de contrôle de sous-domaine

Le domaine `ced4scale.fr` pointe (enregistrements A) directement vers les adresses IP
officielles de GitHub Pages (`185.199.108-111.153`) — configuration correcte, sans le
risque classique de "subdomain takeover" (qui touche plutôt un enregistrement CNAME
pointant vers un compte GitHub Pages qui n'existe plus).

## Check-list pour une revue de sécurité future

À refaire à intervalle régulier (ex. une fois par trimestre, ou après tout ajout de
formulaire/nouvelle intégration externe) :

- [ ] Chercher un secret en clair dans le code actuel :
  `grep -rniE "api[_-]?key|secret|password|token|client[_-]?secret|bearer" --include="*.html" --include="*.js" .`
  et relire chaque résultat (certains sont des faux positifs légitimes, comme le mot
  "password" dans un champ de formulaire de code d'accès).
- [ ] Vérifier qu'aucun nouveau secret n'a été ajouté depuis la dernière revue :
  `git log --all -p <depuis-le-dernier-commit-vérifié> | grep -niE "token|secret|password|BEGIN"`.
- [ ] Vérifier que le certificat HTTPS et l'en-tête HSTS sont toujours présents :
  `curl -sI https://ced4scale.fr | grep -i strict-transport`.
- [ ] Vérifier la visibilité du dépôt GitHub (doit rester cohérente avec le choix acté —
  voir décision ci-dessous) : `curl -s https://api.github.com/repos/Ced4Scale/site_Esaote | grep visibility`.
- [ ] Pour tout nouveau jeton/secret tiers ajouté au site : ne jamais le mettre en clair
  dans le code — passer par une automatisation Power Automate qui le garde côté serveur
  (même principe que les formulaires existants).
- [ ] Vérifier qu'aucune donnée client/patient (nom d'établissement, prix, nom de
  praticien) ne s'est glissée dans un exemple, un commentaire ou un message de commit.

## Décisions actées

- **10/08/2026** — Le dépôt reste public (hébergement GitHub Pages gratuit sur dépôt
  public ; un dépôt privé nécessiterait un abonnement GitHub payant pour garder Pages
  actif). Conséquence acceptée : ne **jamais** y mettre le moindre secret en clair,
  système décrit dans ce document à appliquer strictement.
- **10/08/2026** — Documentation de sécurité centralisée dans ce dossier
  (`securite/SECURITE.md`), à tenir à jour à chaque revue plutôt que de laisser
  l'information se disperser dans l'historique des commits ou la mémoire de session.

## En attente de Cédric

- **Révoquer et régénérer le jeton GoatCounter** (`assets/stats-access.js`) — voir
  section détaillée plus haut. Tant que ce n'est pas fait, considérer que n'importe qui
  ayant consulté le dépôt public a potentiellement un accès large à ce compte
  GoatCounter.
- Décider si la proposition de relais Power Automate pour les statistiques (plutôt que
  d'exposer directement un nouveau jeton) doit être construite.
- **Activer DKIM** (Microsoft 365 admin center → Domaines → `ced4scale.fr`) et **ajouter
  un enregistrement DMARC** chez l'hébergeur DNS (OVH probablement) — voir section
  détaillée plus haut. Rappel demandé explicitement par Cédric le 10/08/2026 pour le
  point GoatCounter ci-dessus ; ce point DKIM/DMARC découvert dans la foulée mérite le
  même rappel.
