---
name: project-design-fr
description: Architecture et contraintes de conception du projet
metadata:
  version: "1.0.0"
  lang: "fr"
---

# Codex Web — Conception

## Multilingue

[English](../DESIGN.md) | [简体中文](../zh-CN/DESIGN.md) | [繁體中文(台灣)](../zh-TW/DESIGN.md) | [繁體中文(香港)](../zh-HK/DESIGN.md) | [हिन्दी](../hi/DESIGN.md) | [Español](../es/DESIGN.md) | [العربية](../ar/DESIGN.md) | **Français**

## Documentation

- Présentation du projet : [README](README.md)

- Justification de la conception : [DESIGN](DESIGN.md)

- Historique des versions : [LOG](LOG.md)

- Avis relatifs aux tiers : [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Objectifs de conception

- Conservez le client de bureau dans le navigateur pendant que la CLI Codex et le système de fichiers restent sur l'hôte.
- Préservez les chemins d’accès npm, Nix, d’extraction et de correctifs en amont afin que les versions en amont puissent être intégrées.
- Remplacez les contrôles du bureau uniquement par des actions du navigateur ou un état explicite d'indisponibilité.
- Exiger une authentification pour l'accès HTTP et WebSocket, sauf si une adresse IP client a été explicitement approuvée.

## Architecture

`scripts/prepare`obtient un pack de bureau.`scripts/prepare_asar`l'extrait dans le ignoré`scratch/asar/`arborescence, embellit les cibles de correctifs, applique les correctifs ordonnés à partir de`patches/`et ajuste les ressources locales. Vite crée le code du navigateur ; Constructions TypeScript`src/server/`. `deploy/start.sh`sélectionne un runtime Node et Git avant de démarrer le serveur. Le serveur héberge l'interface utilisateur corrigée, les API authentifiées, les itinéraires de fichiers et un pont vers la CLI Codex locale. Une instance distincte du navigateur de fichiers peut servir des fichiers locaux sur son propre port et sa propre connexion.

L'application déployée est sous`~/Desktop/apps/codex-web`sur cet hôte. Le prieur`~/Desktop/app/codex-web`le déploiement reste disponible pour la restauration.`~/Desktop/apps/PORTS.md`enregistre les ports de service actuels.

L'hébergeur Web et le client extrait sont versionnés séparément.`scripts/prepare_asar`enregistre l'ordre des correctifs clients, tandis que`assets/`contient de petites pages propriétaires et des assistants de fenêtre. Le navigateur utilise des routes authentifiées de même origine pour les aperçus et les téléchargements de fichiers locaux. Les paramètres des informations d'identification et des adresses IP de confiance se trouvent en dehors de la caisse, de sorte que la reconstruction ne réinitialise pas l'accès.

Le menu d’aide transmet la langue effective de l’application à la page indépendante des modifications. Si cette page est ouverte directement sans langue transmise par l’application, elle utilise la langue du navigateur. Ses libellés figurent dans `lang/changelog/` et ses entrées proviennent du `doc/LOG.md` traduit correspondant.

## Contraintes de conception

- Conservez les entrées racine en amont répertoriées dans[LOG](LOG.md#preserved-upstream-root-entries). Les nouveaux fichiers propriétaires utilisent des répertoires de projet standard.
- Modifiez le code de bureau extrait via des correctifs reproductibles dans`patches/`et enregistrer sa commande dans`scripts/prepare_asar`. Ne vous engagez pas`scratch/asar/`.
- Les actions sur les fichiers du navigateur doivent passer par des routes de serveur authentifiées. Les aperçus de sites Web statiques n'exécutent pas le backend du projet cible.
- Un contrôle d'interface utilisateur qui supprime une pièce jointe non envoyée doit appeler le rappel de suppression existant du compositeur ; le contenu envoyé n’a aucune action de suppression.
- Un changement de serveur nécessite un redémarrage du service. Préparez-le et vérifiez-le d'abord, puis demandez une confirmation explicite car le redémarrage interrompt les conversations en direct. Le remplacement des actifs statiques peut être vérifié sans redémarrer le processus.
- Désactiver les accès hérités à la voix et à la dictée dans ce déploiement Web. Les réglages vocaux et la liste des conversations ChatGPT affichent leur indisponibilité; l’historique des conversations Codex reste accessible.

## Conception des données

Les hachages d'authentification et la liste d'adresses IP de confiance sont par défaut`~/.config/codex-web/`. Les sessions sont conservées par le serveur et expirent au bout de 12 heures. Les fichiers de projet restent dans leurs chemins d'accès d'origine ; le navigateur et l'aperçu statique ne les copient pas dans ce référentiel. La sortie de l’extraction de build est ignorée sous`scratch/asar/`, et la sortie distribuable appartient à`dist/`.

## Interfaces externes

Le serveur appelle Codex CLI et Git en tant que processus hôtes et expose les routes HTTP authentifiées et WebSocket de même origine au navigateur. Le navigateur de fichiers est un service distinct avec une authentification indépendante. La build télécharge un bundle de bureau versionné à partir de l'URL dans`scripts/prepare`.

## Extension

Le comportement du navigateur est étendu avec des correctifs ordonnés dans`patches/`ou des modules propriétaires sous`src/`. Bump et examinez la version de bureau extraite avant de rebaser un correctif, puis créez et vérifiez le JavaScript résultant. Conservez le texte visible dans le navigateur dans le système de localisation du client de bureau lors de l'adaptation de cette interface utilisateur.
