---
name: project-readme-fr
description: Présentation et utilisation du projet
metadata:
  version: "1.0.0"
  lang: "fr"
---

# Codex Web

## Multilingue

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文(台灣)](../zh-TW/README.md) | [繁體中文(香港)](../zh-HK/README.md) | [हिन्दी](../hi/README.md) | [Español](../es/README.md) | [العربية](../ar/README.md) | **Français**

## Documentation

- Présentation du projet : [README](README.md)

- Justification de la conception : [DESIGN](DESIGN.md)

- Historique des versions : [LOG](LOG.md)

- Avis relatifs aux tiers : [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Introduction

Ce fork exécute l'interface de bureau du Codex dans un navigateur tout en conservant la CLI du Codex et l'accès aux fichiers sur une machine que vous contrôlez. Il ajoute l'authentification du navigateur, les actions sur les fichiers locaux, un aperçu de site Web statique et des correctifs pour les contrôles réservés au bureau. L'application de bureau est extraite et modifiée avec des correctifs versionnés pendant la construction.

## Prérequis

- Minimum : Node.js et npm compatibles avec`package.json`, Git, une CLI Codex connectée et un ensemble de bureau Codex pris en charge pour l'extraction. La version a besoin d'un accès au réseau pour récupérer ce bundle. Un navigateur doit pouvoir atteindre l'hôte et le port choisis.
- Recommandé : Exécutez-le derrière HTTPS ou un tunnel chiffré. Utilisez un compte hôte dédié et conservez le service sur un réseau de confiance. L'interface utilisateur fournie et l'API authentifiée peuvent fonctionner avec les autorisations de fichier et de commande de ce compte.

## Installation

### Installation rapide

À partir d'une extraction avec un bundle de bureau préparé et des dépendances installées, exécutez`npm run prepare && ./deploy/start.sh`. Le serveur écoute`127.0.0.1:8214`par défaut.

### Installation normale

1. Installez Node.js, npm, Git et Codex CLI ; connectez-vous avec`codex login --device-auth`.
2. Courir`npm ci`, alors`npm run prepare`. La build extrait le bundle de bureau, s'applique`patches/*.patch`, construit le navigateur et le serveur, et crée des ressources Web compressées.
3. Pour un déploiement réseau, créez des informations d'identification avec`node scripts/set-auth-password.mjs USERNAME`; enregistrez le mot de passe généré en toute sécurité.
4. Courir`./deploy/start.sh --host HOST --port PORT`, puis ouvrez l'URL correspondante. Voir[Design](doc/DESIGN.md)pour la disposition et les limites du déploiement.

## Conseils

- L’interface utilisateur du navigateur utilise la CLI Codex connectée sur l’hôte. Les fichiers locaux peuvent être téléchargés ou ouverts dans un service de navigateur de fichiers distinct s'il est configuré.
- Une ressource de site Web ouvre un aperçu statique en lecture seule. Il ne démarre pas le backend de ce site Web.
- Une image en attente d'envoi peut être supprimée de sa vignette ou de l'aperçu plein écran. Le supprimer l’empêche d’être inclus dans le brouillon.
- `CODEX_CLI_PATH`sélectionne la CLI.`CODEX_WEB_NODE_BIN_DIR`et`CODEX_WEB_GIT_BIN_DIR`sélectionner les répertoires des outils d'exécution lorsqu'ils se trouvent à l'extérieur`PATH`. `CODEX_WEB_AUTH_FILE`et`CODEX_WEB_TRUSTED_IPS_FILE`sélectionnez les fichiers d'authentification. Voir le[previous upstream-oriented README](third_party/codex-web/README.previous.md)pour la rotation des informations d’identification et les commandes IP de confiance.
- Une actualisation matérielle peut être nécessaire après le remplacement d'un actif Web sans modifier son nom de fichier, car les actifs versionnés peuvent être brièvement mis en cache.

## Mise à niveau

1. Sauvegarde`~/.config/codex-web/auth.json`et`~/.config/codex-web/trusted-ips.json`, puis enregistrez la version en cours d'exécution et le chemin de déploiement.
2. Extrayez la révision souhaitée dans une caisse séparée et exécutez`npm ci && npm run prepare`. Examinez tout correctif ayant échoué par rapport à la version du bundle de bureau avant le déploiement.
3. Copiez les fichiers préparés dans le répertoire de déploiement. Le remplacement des actifs statiques à lui seul ne nécessite pas de redémarrage du serveur ; les changements de serveur le font. Un redémarrage initié par l'opérateur interrompt les conversations et les tâches actives. Obtenez donc une confirmation explicite de l'utilisateur pour ce redémarrage spécifique après préparation et vérifications.
4. Ouvrez la page de connexion et vérifiez la connexion, l'interface utilisateur du navigateur et la fonctionnalité modifiée. Conservez le déploiement précédent jusqu’à ce que ces vérifications réussissent. Voir[Upgrading](UPGRADING.md)pour le workflow de mise à jour hérité.

## Désinstallation

- Rapide : arrêtez le service et supprimez le répertoire d'extraction ou de déploiement de l'application. Conservez les fichiers de configuration si vous prévoyez de réinstaller.
- Terminé : supprimez également le service utilisateur systemd,`~/.config/codex-web/auth.json`, `~/.config/codex-web/trusted-ips.json`, ainsi que toutes les données d'exécution ou de navigateur de fichiers stockées séparément que vous possédez. Vérifiez ces chemins avant de les supprimer s’ils sont partagés par un autre déploiement.

## Remerciements

C'est une fourchette de[0xcaff/codex-web](https://github.com/0xcaff/codex-web)et adapte le client de bureau Codex. L’état d’attribution des dépendances et des offres groupées de bureau est enregistré dans[Third-party notices](doc/THIRD_PARTY_NOTICES.md).

## Licence

`package.json`déclare`MIT`(SPDX). Cette extraction ne contient pas de texte complet de licence en amont ; les droits de redistribution pour l’application de bureau extraite doivent être examinés séparément. Voir[Third-party notices](doc/THIRD_PARTY_NOTICES.md).
