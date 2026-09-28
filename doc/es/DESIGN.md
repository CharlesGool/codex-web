---
name: project-design-es
description: Arquitectura y restricciones de diseño del proyecto
metadata:
  version: "1.0.0"
  lang: "es"
---

# Códice Web — Diseño

## Multilingüe

[English](../DESIGN.md) | [简体中文](../zh-CN/DESIGN.md) | [繁體中文(台灣)](../zh-TW/DESIGN.md) | [繁體中文(香港)](../zh-HK/DESIGN.md) | [हिन्दी](../hi/DESIGN.md) | **Español** | [العربية](../ar/DESIGN.md) | [Français](../fr/DESIGN.md)

## Documentación

- Descripción general del proyecto: [README](README.md)

- Justificación del diseño: [DESIGN](DESIGN.md)

- Historial de versiones: [LOG](LOG.md)

- Avisos de terceros: [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Objetivos de diseño

- Mantenga el cliente de escritorio en el navegador mientras la CLI y el sistema de archivos del Codex permanecen en el host.
- Conserve las rutas ascendentes de npm, Nix, extracción y parches para que se puedan integrar las versiones ascendentes.
- Reemplace los controles exclusivos del escritorio con acciones del navegador o un estado explícito de no disponible.
- Requerir autenticación para el acceso HTTP y WebSocket a menos que se haya confiado explícitamente en la IP de un cliente.

## Arquitectura

`scripts/prepare`obtiene un paquete de escritorio.`scripts/prepare_asar`lo extrae en el ignorado`scratch/asar/`árbol, embellece los objetivos de los parches, aplica parches ordenados desde`patches/`y ajusta los activos locales. Vite crea código de navegador; Compilaciones de TypeScript`src/server/`. `deploy/start.sh`selecciona un tiempo de ejecución de nodo y Git antes de iniciar el servidor. El servidor aloja la interfaz de usuario parcheada, las API autenticadas, las rutas de archivos y un puente hacia la CLI del Codex local. Una instancia separada del Explorador de archivos puede servir archivos locales en su propio puerto e iniciar sesión.

La aplicación implementada está bajo`~/Desktop/apps/codex-web`en este anfitrión. el anterior`~/Desktop/app/codex-web`la implementación permanece disponible para revertirse.`~/Desktop/apps/PORTS.md`registra los puertos de servicio actuales.

El servidor web y el cliente extraído tienen versiones por separado.`scripts/prepare_asar`registra el orden de los parches del cliente, mientras`assets/`Contiene pequeñas páginas propias y ayudantes de ventana gráfica. El navegador utiliza rutas autenticadas del mismo origen para vistas previas y descargas de archivos locales. La configuración de credenciales e IP confiables se encuentra fuera del proceso de pago, por lo que la reconstrucción no restablece el acceso.

El menú de ayuda pasa el idioma efectivo de la aplicación a la página independiente de cambios. Si se visita directamente sin recibir el idioma de la aplicación, usa el idioma del navegador. Las etiquetas están en `lang/changelog/` y las entradas proceden del `doc/LOG.md` traducido correspondiente.

## Restricciones de diseño

- Mantenga las entradas raíz ascendentes enumeradas en[LOG](LOG.md#preserved-upstream-root-entries). Los nuevos archivos propios utilizan directorios de proyectos estándar.
- Cambie el código de escritorio extraído mediante parches reproducibles en`patches/`y registrar su pedido en`scripts/prepare_asar`. no te comprometas`scratch/asar/`.
- Las acciones de archivos del navegador deben pasar a través de rutas de servidor autenticadas. Las vistas previas de sitios web estáticos no ejecutan el backend del proyecto de destino.
- Un control de UI que elimina un archivo adjunto no enviado debe llamar a la devolución de llamada de eliminación existente del compositor; El contenido enviado no tiene acción de eliminación.
- Un cambio de servidor necesita reiniciar el servicio. Prepárelo y verifíquelo primero, luego solicite una confirmación explícita porque el reinicio interrumpe las conversaciones en vivo. La sustitución de activos estáticos se puede comprobar sin reiniciar el proceso.
- Desactive las entradas heredadas de voz y dictado en este despliegue web. La página de ajustes de Voz y la lista del historial de ChatGPT muestran que no están disponibles; los chats de Codex siguen accesibles.

## Diseño de datos

Los hashes de autenticación y la lista de IP confiables son predeterminados`~/.config/codex-web/`. El servidor mantiene las sesiones y caducan después de 12 horas. Los archivos del proyecto permanecen en sus rutas de host originales; el navegador y la vista previa estática no los copian en este repositorio. La salida de extracción de compilación se ignora en`scratch/asar/`, y la producción distribuible pertenece a`dist/`.

## Interfaces externas

El servidor invoca Codex CLI y Git como procesos de host y expone HTTP autenticado y rutas WebSocket del mismo origen al navegador. File Browser es un servicio independiente con autenticación independiente. La compilación descarga un paquete de escritorio versionado desde la URL en`scripts/prepare`.

## Extensión

El comportamiento del navegador se amplía con parches ordenados en`patches/`o módulos propios bajo`src/`. Actualice y revise la versión de escritorio extraída antes de cambiar la base de un parche, luego cree y verifique el JavaScript resultante. Mantenga el texto visible en el navegador en el sistema de localización del cliente de escritorio al adaptar esa interfaz de usuario.
