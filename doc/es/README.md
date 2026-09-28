---
name: project-readme-es
description: Descripción general y uso del proyecto
metadata:
  version: "1.0.0"
  lang: "es"
---

# Codex Web

## Multilingüe

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文(台灣)](../zh-TW/README.md) | [繁體中文(香港)](../zh-HK/README.md) | [हिन्दी](../hi/README.md) | **Español** | [العربية](../ar/README.md) | [Français](../fr/README.md)

## Documentación

- Descripción general del proyecto: [README](README.md)

- Justificación del diseño: [DESIGN](DESIGN.md)

- Historial de versiones: [LOG](LOG.md)

- Avisos de terceros: [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Introducción

Esta bifurcación ejecuta la interfaz de escritorio del Codex en un navegador mientras mantiene la CLI del Codex y el acceso a los archivos en una máquina que usted controla. Agrega autenticación del navegador, acciones de archivos locales, una vista previa del sitio web estático y correcciones para controles solo de escritorio. La aplicación de escritorio se extrae y modifica con parches versionados durante la compilación.

## Requisitos

- Mínimo: Node.js y npm compatibles con`package.json`, Git, una CLI de Codex con sesión iniciada y un paquete de escritorio Codex compatible para la extracción. La compilación necesita acceso a la red para recuperar ese paquete. Un navegador debe poder llegar al host y al puerto elegidos.
- Recomendado: ejecutar detrás de HTTPS o un túnel cifrado. Utilice una cuenta de host dedicada y mantenga el servicio en una red confiable. La interfaz de usuario incluida y la API autenticada pueden funcionar con los permisos de archivos y comandos de esa cuenta.

## Instalación

### Instalación rápida

Desde una caja con un paquete de escritorio preparado y dependencias instaladas, ejecute`npm run prepare && ./deploy/start.sh`. El servidor escucha`127.0.0.1:8214`por defecto.

### Instalación normal

1. Instale Node.js, npm, Git y Codex CLI; iniciar sesión con`codex login --device-auth`.
2. Correr`npm ci`, entonces`npm run prepare`. La compilación extrae el paquete de escritorio y se aplica.`patches/*.patch`, construye el navegador y el servidor, y crea recursos web comprimidos.
3. Para una implementación de red, cree credenciales con`node scripts/set-auth-password.mjs USERNAME`; registre la contraseña generada de forma segura.
4. Correr`./deploy/start.sh --host HOST --port PORT`y luego abra la URL correspondiente. Ver[Design](doc/DESIGN.md)para el diseño y los límites del despliegue.

## Orientaciones

- La interfaz de usuario del navegador utiliza la CLI del Codex registrada en el host. Los archivos locales se pueden descargar o abrir en un servicio de Explorador de archivos independiente si hay uno configurado.
- Un recurso de sitio web abre una vista previa estática de solo visualización. No inicia el backend de ese sitio web.
- Una imagen en espera de envío se puede eliminar de su miniatura o de la vista previa en pantalla completa. Eliminarlo impide que se incluya en el borrador.
- Este sitio no sincroniza los chats normales de ChatGPT de la web o del móvil. Los controles de voz no están disponibles aquí y la página de ajustes de Voz lo indica. El menú del signo de interrogación abre el historial de cambios de este proyecto. La página de cambios usa el idioma elegido en Codex Web.
- `CODEX_CLI_PATH`selecciona la CLI.`CODEX_WEB_NODE_BIN_DIR`y`CODEX_WEB_GIT_BIN_DIR`seleccionar directorios de herramientas de tiempo de ejecución cuando estén fuera`PATH`. `CODEX_WEB_AUTH_FILE`y`CODEX_WEB_TRUSTED_IPS_FILE`seleccione archivos de autenticación. Ver el[previous upstream-oriented README](third_party/codex-web/README.previous.md)para rotación de credenciales y comandos de IP confiables.
- Es posible que sea necesaria una actualización completa después de reemplazar un recurso web sin cambiar su nombre de archivo porque los activos versionados se pueden almacenar en caché brevemente.

## Actualización

1. Respaldo`~/.config/codex-web/auth.json`y`~/.config/codex-web/trusted-ips.json`y registre la versión en ejecución y la ruta de implementación.
2. Extraiga la revisión deseada en un pago por separado y ejecútela`npm ci && npm run prepare`. Revise cualquier parche fallido con la versión del paquete de escritorio antes de implementarlo.
3. Copie los archivos preparados en el directorio de implementación. Reemplazar activos estáticos por sí solo no requiere reiniciar el servidor; los cambios de servidor sí lo hacen. Un reinicio iniciado por el operador interrumpe las conversaciones y tareas activas, así que obtenga la confirmación explícita del usuario para ese reinicio específico después de la preparación y las comprobaciones.
4. Abra la página de inicio de sesión y verifique el inicio de sesión, la interfaz de usuario del navegador y la función modificada. Conserve la implementación anterior hasta que pasen estas comprobaciones. Ver[Upgrading](UPGRADING.md)para el flujo de trabajo de actualización heredado.

## Desinstalación

- Rápido: detenga el servicio y elimine el directorio de implementación o desprotección de la aplicación. Conserve los archivos de configuración si espera realizar la reinstalación.
- Completo: elimine también el servicio de usuario systemd,`~/.config/codex-web/auth.json`, `~/.config/codex-web/trusted-ips.json`y cualquier dato del explorador de archivos o tiempo de ejecución almacenado por separado que posea. Revise esas rutas antes de eliminarlas si las comparte otra implementación.

## Agradecimientos

Este es un tenedor de[0xcaff/codex-web](https://github.com/0xcaff/codex-web)y adapta el cliente de escritorio Codex. El estado de atribución del paquete de escritorio y dependencia se registra en[Third-party notices](doc/THIRD_PARTY_NOTICES.md).

## Licencia

`package.json`declara`MIT`(SPDX). Esta compra no contiene un texto completo de licencia ascendente; Los derechos de redistribución de la aplicación de escritorio extraída deben revisarse por separado. Ver[Third-party notices](doc/THIRD_PARTY_NOTICES.md).
