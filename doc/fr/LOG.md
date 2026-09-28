---
name: project-log-fr
description: Décisions, limites, bogues et modifications du projet
metadata:
  version: "1.0.0"
  lang: "fr"
---

# Enregistrer

## Multilingue

[English](../LOG.md) | [简体中文](../zh-CN/LOG.md) | [繁體中文(台灣)](../zh-TW/LOG.md) | [繁體中文(香港)](../zh-HK/LOG.md) | [हिन्दी](../hi/LOG.md) | [Español](../es/LOG.md) | [العربية](../ar/LOG.md) | **Français**

## Documentation

- Présentation du projet : [README](README.md)

- Justification de la conception : [DESIGN](DESIGN.md)

- Historique des versions : [LOG](LOG.md)

- Avis relatifs aux tiers : [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Bogues

Ce journal enregistre le travail sur l'hébergeur Web. Il ne remplace pas l'historique des versions du projet en amont.

Redémarrage`codex-web.service`interrompt les WebSockets du navigateur actif et le processus enfant du serveur d'applications Codex. Un mécanisme de mise à jour continue a été envisagé mais n'a pas été mis en œuvre. L'utilisateur a plutôt choisi une porte de confirmation explicite pour chaque redémarrage.

## Limitations

Référence en amont :`0dfdc10`

Raison : Le fork conserve les racines des packages npm et Nix en amont et son workflow d'extraction puis de correctif. Le déplacement de ces entrées héritées modifierait les chemins des packages et compliquerait les mises à jour en amont. Généré`scratch/`la sortie de l'extraction reste ignorée par Git et n'est utilisée que par le workflow de build hérité.

Limite de mise à jour : seules les entrées racine présentes dans la ligne de base enregistrée sont conservées ici. Les nouveaux fichiers propriétaires utilisent les répertoires de projet standard ; toute entrée en amont nouvellement héritée nécessite un examen et une mise à jour exacte de l'inventaire.

Examen de la documentation et des licences : la caisse en amont déclare MIT dans`package.json`mais ne contient pas de texte de licence complet. Le bundle de bureau extrait et les avis de dépendance npm n'ont pas été entièrement audités. Voir[Third-party notices](THIRD_PARTY_NOTICES.md). Cela limite les réclamations concernant la redistribution des artefacts extraits ou regroupés.

### Entrées racine en amont préservées

- `ARCHITECTURE.md`
- `UPGRADING.md`
- `default.nix`
- `flake.lock`
- `flake.nix`
- `nix`
- `package-lock.json`
- `package.json`
- `patches`
- `vite.browser.config.ts`

## Décisions

|Décision|Raison|
| --- | --- |
|Ouvrez les ressources du site Web local sous forme d'aperçus statiques du navigateur, en préférant un frère ou une sœur.`dist/index.html`. |L'utilisateur a demandé un aperçu en lecture seule. L'aperçu ne démarre pas le backend d'un projet.|
|Afficher un message d'indisponibilité sur la page des paramètres des animaux de compagnie.|La fonctionnalité n'est pas utilisable sur cet hébergeur.|
|Affichez le même état d'indisponibilité dans les paramètres d'utilisation de l'ordinateur et supprimez son raccourci de configuration Chrome de l'aide.|L'intégration de bureau héritée ne peut pas être configurée via cet hôte de navigateur, donc la page de contrôle existante donne un chemin d'installation trompeur.|
|Afficher un état indisponible sur la route des tâches planifiées dans ce déploiement Web.|La planification locale est limitée au client Electron dans le registre des capacités héritées, et la liste des cloud disponibles échoue actuellement ; la page annonce autrement la création de tâches via un flux défaillant. Cela ne prétend pas que la planification hébergée par un navigateur soit en principe impossible.|
|Masquez le menu de l’application de bureau dans l’interface utilisateur Web.|Ses commandes Electron uniquement n’ont aucune action de navigateur utilisable.|
|Placez le lien À propos du projet dans le menu en forme de point d'interrogation de la barre latérale.|Le menu de l’application de bureau n’est pas monté dans le navigateur, donc son entrée À propos en haut à gauche était invisible. Le menu d'aide visible peut ouvrir ce fork sans restaurer Fichier, Édition, Affichage et Aide.|
|Remplacez les cibles de l'application du menu contextuel du fichier local par le navigateur de fichiers et les actions de téléchargement.|Les cibles des applications de bureau et la boîte de dialogue d'enregistrement native ne fonctionnent pas dans le navigateur. Les actions de l'hôte distant conservent leur comportement d'origine.|
|Masquez le paramètre de destination d’ouverture de fichier par défaut dans l’interface utilisateur Web.|Ses choix d'application de bureau, de gestionnaire de fichiers et de terminal ne contrôlent pas les actions sur les fichiers du navigateur.|
|Téléchargez les liens d'archives locales dans les messages de conversation lorsque vous cliquez dessus.|L’action d’ouverture de fichier sur le bureau n’a aucune cible de navigateur utilisable pour ces fichiers.|
|Conservez la disposition héritée de NPM, Nix et des correctifs à la racine du référentiel.|Cela maintient les mises à jour en amont et la version d'extraction puis de correctif compatibles ; les entrées de référence exactes sont répertoriées ci-dessus.|
|Déplacer le déploiement vers`~/Desktop/apps/codex-web`, avec Node dans ce répertoire.|Le lanceur utilise ensuite un chemin de déploiement autonome ; le déploiement précédent reste pour la restauration.|
|Supprimez une image non envoyée de son aperçu plein écran via le rappel de suppression existant de la pièce jointe.|L'action d'aperçu doit correspondre à la vignette X et ne doit pas apparaître sur les images déjà envoyées.|
|Utilisez une étiquette de texte à supprimer dans la barre d’outils d’aperçu plein écran.|Un deuxième X à côté de Close était visuellement déroutant ; le bouton texte conserve le style de la barre d'outils et rend les actions distinctes.|
|Donnez à la page de connexion une carte centrée avec des champs de compte et de mot de passe et une véritable vérification IP de confiance.|La disposition de référence améliore la hiérarchie ; l'action secondaire vérifie la liste blanche du serveur existant et explique le refus.|
|Conservez la page de connexion comme point d'entrée après la déconnexion, y compris pour les adresses IP de confiance.|L'accès IP de confiance est sélectionné explicitement sur la page de connexion ; une adresse IP seule ne crée pas de session.|
|Exiger une confirmation explicite de l'utilisateur avant chaque redémarrage du Codex Web initié par l'opérateur ou le remplacement de son processus en cours d'exécution.|Un redémarrage interrompt les conversations et les tâches actives. Effectuez d'abord la préparation et les vérifications réversibles, décrivez le service spécifique et l'interruption attendue, puis attendez la réponse affirmative de l'utilisateur. Une période d'inactivité ou une approbation antérieure n'autorise pas un redémarrage ultérieur. Le système existant`Restart=always`la récupération après une défaillance de processus est distincte d'un redémarrage initié par l'opérateur.|
|Conservez la proposition de mise à jour continue en tant que conception historique uniquement.|L'utilisateur a préféré une porte de confirmation explicite à l'ajout d'un proxy et à la complexité du backend qui se chevauche. Aucune migration de proxy ou de tâche n’a été mise en œuvre.|
|Ouvrez une discussion locale dans un onglet du navigateur à partir du menu d'en-tête et du menu de la barre latérale.|L’action IPC de nouvelle fenêtre du bureau n’ouvre pas de fenêtre de navigateur utilisable. Les deux menus utilisent désormais le navigateur`/thread/<id>`itinéraire, et la ligne de la barre latérale expose son bouton de menu en mode Codex. Les discussions sur hôte distant sont exclues car la route du navigateur ne restaure pas leur contexte d'hôte.|
|Prévisualisez les fichiers locaux liés à une conversation dans un onglet de navigateur authentifié.|L'onglet de l'éditeur de fichiers de bureau peut ne pas parvenir à s'afficher sur l'hébergeur Web. L'aperçu lit le point de terminaison de téléchargement authentifié existant, affiche le texte, les images ou les PDF et propose le téléchargement. Les liens d'hôte distant conservent leur action d'origine.|
|Ajoutez un bouton de recherche à l'en-tête de la conversation à l'aide de la commande findin-chat existante.|Le client dispose déjà d'une barre de recherche avec le nombre de correspondances et la navigation précédente/suivante ; l'en-tête n'avait pas de point d'entrée visible.|
|Dimensionnez l'application Web en fonction de la fenêtre d'affichage visuelle du navigateur sur mobile et tablette.|L'hérédité`100vh`la hauteur des racines et des coques peut dépasser la zone laissée par les barres dynamiques du navigateur ou le clavier à l'écran. La fenêtre visuelle indique également son décalage supérieur, qui peut changer lorsque le clavier est visible.|
|Signaler la voix et l’historique des conversations ChatGPT ordinaires comme indisponibles dans ce navigateur.|La page HTTP actuelle ne peut pas accéder au microphone, les fonctions vocales du bureau ne sont pas transférées automatiquement et le serveur Codex app-server local ne répertorie pas les conversations ordinaires du compte ChatGPT. Les actions vocales sont masquées, les conversations Codex conservées.|
|Ouvrir une page locale des modifications depuis le menu au point d’interrogation.|L’utilisateur a demandé un historique visible des mises à jour de ce projet; la page lit le journal localisé fourni avec les ressources statiques.|
|Utiliser la langue choisie dans l’application pour la page des modifications.|La langue effective de l’application reflète déjà son réglage; la transmettre à la page indépendante garde le menu et la page cohérents. Les accès directs utilisent la langue du navigateur.|
## Passation

- Branche: `main`, avancée sans fusion depuis `feat/standardize-layout`. Les changements du navigateur et de la documentation sont publiés sur la branche par défaut.
- Terminé: La structure amont avec extraction puis correctifs, les répertoires standard et `deploy/start.sh` ont été conservés ou ajoutés, et les limites du déploiement documentées. Les corrections Web couvrent la connexion et les IP de confiance, les actions sur les fichiers et leurs aperçus, les aperçus statiques de sites, la suppression d’images non envoyées, la recherche dans les conversations, l’ouverture dans un nouvel onglet, l’adaptation mobile et l’indication des fonctions propres au bureau indisponibles. Le menu d’aide renvoie à ce projet. Ce travail masque les actions vocales, signale les réglages vocaux et l’historique ChatGPT ordinaire comme indisponibles et ajoute une page locale des modifications. Ces ressources statiques ont été installées sur le site actif sans redémarrage. La page des modifications suit maintenant la langue choisie dans l’application.
- Vérifications: Les contrôles précédents sur les correctifs, la syntaxe JavaScript, l’authentification et les tailles de navigateur ont réussi. Cette fois, le nouveau correctif a été appliqué, la syntaxe des deux fichiers JavaScript modifiés et du script de la page des modifications a été vérifiée, le rendu des huit langues documentaires a été simulé et les contrôles de format, de traduction et de structure des 32 documents ont réussi avec 0 erreur. Playwright n’a pas pu être exécuté car Chrome n’est pas installé. La reconstruction complète du client extrait du paquet de bureau, jusqu’à la compression des ressources, a réussi. Les contrôles dans un navigateur connecté restent à faire. La priorité de la langue de l’application sur celle du navigateur et la reconstruction complète avec correctifs ont également été vérifiées.
- Déploiement: `codex-web.service` reste actif sur son adresse LAN enregistrée avec le même processus démarré le 2026-09-27. Les ressources statiques ont été mises à jour dans `~/Desktop/apps/codex-web`; l’ancien déploiement dans `~/Desktop/app/codex-web` et une copie des fichiers remplacés restent disponibles pour revenir en arrière. Sans session, la page des modifications a répondu HTTP 401 comme prévu. Tout redémarrage manuel ultérieur exige une nouvelle confirmation explicite après explication de son effet.
- GitHub: Le dépôt public `CharlesGool/codex-web` utilise `main`; le commit `74acac2` a été envoyé et la branche distante vérifiée.
- À faire: Relire la qualité de toutes les traductions et les textes des licences tierces. Après actualisation forcée dans un navigateur connecté, tester les commandes vocales, l’avis sur l’historique ChatGPT, le menu et la page des modifications, ainsi que de vrais iPhone, appareils Android et tablettes en portrait et paysage. Aucune mise à jour progressive n’est prévue. Aucun fichier de règles temporaires du projet n’a été trouvé.
- Prochaine étape: Terminer le contrôle dans un navigateur connecté lorsque Chrome sera disponible.

## Historique des modifications

### 0.0.1 (inédit ; travail mis à jour le 2026-09-28)

#### Modifié

- Les menus contextuels des fichiers locaux proposent désormais des actions sur les fichiers compatibles avec le navigateur.
- Le menu en forme de point d'interrogation de la barre latérale renvoie désormais à ce fork sur GitHub ; les menus des applications de bureau uniquement restent masqués. Le champ de recherche de conversation correspond désormais à la surface blanche et à l'ombre subtile des menus existants.
- Les paramètres d'animaux de compagnie, de raccourcis clavier et d'utilisation de l'ordinateur affichent un état indisponible ; le menu Aide de la barre latérale ne propose plus la configuration de l'extension Chrome. Les tâches planifiées affichent désormais un état indisponible spécifique au déploiement au lieu d'une liste de cloud interrompue et de suggestions de tâches. L'action du profil d'animal de compagnie, la commande barre oblique d'animal de compagnie, l'entrée d'aide de raccourci, les liaisons de raccourci d'application, le menu d'application de bureau et le paramètre de destination d'ouverture de fichier par défaut obsolète sont masqués ou désactivés dans l'interface utilisateur Web.
- Le projet conserve la disposition de construction héritée en amont tout en déplaçant la nouvelle structure propriétaire et le lanceur de services vers des répertoires standard.

- Les commandes vocales du navigateur sont masquées ou signalées comme indisponibles; la zone d’historique ChatGPT explique que les conversations ordinaires du Web et du mobile ne peuvent pas être synchronisées ici. Le menu d’aide latéral ouvre désormais une page locale des modifications. La page des modifications suit maintenant la langue choisie dans l’application.

#### Fixé

- Les cartes de ressources de sites Web locaux ouvrent un aperçu statique du navigateur au lieu d'appeler le navigateur intégré à l'application, indisponible.
- Les liens d'archive locale dans les messages de conversation téléchargent le fichier référencé au lieu d'appeler une application de bureau indisponible.
- L'aperçu plein écran d'une image non envoyée inclut désormais une action qui la supprime du brouillon.
- L'action de suppression de l'aperçu affiche désormais du texte au lieu d'un X, et la page de connexion utilise le formulaire de compte/mot de passe repensé avec une vérification IP de confiance fonctionnelle.
- L'action d'ouverture de nouvelle fenêtre du menu de discussion ouvre un onglet de navigateur et les lignes de discussion de la barre latérale du Codex exposent le même menu.
- Les liens vers les fichiers de conversation ouvrent un aperçu du navigateur avec un bouton de téléchargement au lieu d'un onglet dont le rendu échoue.
- L'en-tête de conversation propose désormais un bouton de recherche qui ouvre la barre de recherche existante.
- Les mises en page pour mobiles et tablettes suivent désormais la fenêtre d'affichage visible lorsque les barres du navigateur, la rotation ou le clavier modifient la hauteur disponible.

## Historique des commits

| Commit | Résumé |
| --- | --- |
| `b27d4e4` |Remplacez les actions de bureau non prises en charge dans l'interface utilisateur du navigateur.|
| `33d3851` |Téléchargez les archives locales liées en un clic.|
| `1f98f69` |Enregistrez l’audit de normalisation.|
| `35394f5` |Supprimez les images non envoyées de l'aperçu.|
| `b10b9e5` |Alignez l'action d'aperçu et repensez la connexion.|
| `b11f385` | Terminer les correctifs du navigateur et la documentation du projet. |
| `7347aa6` | Consigner la passation vérifiée sur GitHub. |
| `47b2ab3` | Consigner la mise à jour de la branche par défaut. |
| `6f83e02` | Signaler les fonctions du navigateur indisponibles et ajouter la page des modifications. |
| `9a2d0a9` | Consigner la passation vérifiée sur GitHub. |
| `74acac2` | Faire suivre à la page des modifications la langue choisie dans l’application. |
| Commit actuel | Consigner la passation vérifiée de la correction de langue. |

Le journal Git reste la référence complète de l’historique.
