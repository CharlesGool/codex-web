---
name: project-log-es
description: Decisiones, limitaciones, errores y cambios del proyecto
metadata:
  version: "1.0.0"
  lang: "es"
---

# Registro

## Multilingüe

[English](../LOG.md) | [简体中文](../zh-CN/LOG.md) | [繁體中文(台灣)](../zh-TW/LOG.md) | [繁體中文(香港)](../zh-HK/LOG.md) | [हिन्दी](../hi/LOG.md) | **Español** | [العربية](../ar/LOG.md) | [Français](../fr/LOG.md)

## Documentación

- Descripción general del proyecto: [README](README.md)

- Justificación del diseño: [DESIGN](DESIGN.md)

- Historial de versiones: [LOG](LOG.md)

- Avisos de terceros: [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)

## Errores

Este registro funciona en el servidor web. No reemplaza el historial de lanzamientos del proyecto ascendente.

Reiniciando`codex-web.service`interrumpe los WebSockets del navegador activo y el proceso secundario del servidor de aplicaciones Codex. Se consideró un mecanismo de actualización continua, pero no se implementó. En su lugar, el usuario eligió una puerta de confirmación explícita para cada reinicio.

## Limitaciones

Línea de base aguas arriba:`0dfdc10`

Motivo: la bifurcación mantiene las raíces de los paquetes npm y Nix y su flujo de trabajo de extracción y parche. Mover estas entradas heredadas cambiaría las rutas de los paquetes y complicaría las actualizaciones ascendentes. Generado`scratch/`Git ignora el resultado de la extracción y solo lo utiliza el flujo de trabajo de compilación heredado.

Límite de actualización: aquí solo se conservan las entradas raíz presentes en la línea base registrada. Los nuevos archivos propios utilizan los directorios de proyectos estándar; cualquier entrada ascendente recién heredada requiere revisión y una actualización exacta del inventario.

Revisión de documentación y licencias: el proceso de pago ascendente declara MIT en`package.json`pero no contiene ningún texto de licencia completo. El paquete de escritorio extraído y los avisos de dependencia de npm no se han auditado por completo. Ver[Third-party notices](THIRD_PARTY_NOTICES.md). Esto limita las reclamaciones sobre la redistribución de artefactos extraídos o agrupados.

### Entradas raíz ascendentes conservadas

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

## Decisiones

|Decisión|Razón|
| --- | --- |
|Abra los recursos del sitio web local como vistas previas estáticas del navegador, prefiriendo un hermano`dist/index.html`. |El usuario solicitó una vista previa de solo visualización. La vista previa no inicia el backend de un proyecto.|
|Muestra un mensaje de no disponible en la página de configuración de Mascotas.|La función no se puede utilizar en este servidor web.|
|Muestre el mismo estado de no disponible en la configuración de Uso de la computadora y elimine su acceso directo de configuración de Chrome de la Ayuda.|La integración de escritorio heredada no se puede configurar a través de este host de navegador, por lo que la página de control existente proporciona una ruta de instalación engañosa.|
|Muestra un estado no disponible en la ruta de tareas programadas en esta implementación web.|La programación local está limitada al cliente Electron en el registro de capacidades heredadas y la lista de nubes disponibles actualmente falla; de lo contrario, la página anuncia la creación de tareas a través de un flujo fallido. Esto no significa que la programación alojada en el navegador sea imposible en principio.|
|Oculte el menú de la aplicación de escritorio en la interfaz de usuario web.|Sus comandos exclusivos de Electron no tienen ninguna acción de navegador utilizable.|
|Coloque el enlace Acerca del proyecto en el menú del signo de interrogación de la barra lateral.|El menú de la aplicación de escritorio no está montado en el navegador, por lo que la entrada Acerca de en la parte superior izquierda era invisible. El menú de ayuda visible puede abrir esta bifurcación sin restaurar Archivo, Editar, Ver y Ayuda.|
|Reemplace los destinos de la aplicación del menú contextual de archivos locales con el Explorador de archivos y las acciones de descarga.|Los destinos de las aplicaciones de escritorio y el cuadro de diálogo nativo para guardar no funcionan en el navegador. Las acciones del host remoto conservan su comportamiento original.|
|Oculte la configuración de destino de apertura de archivos predeterminada en la interfaz de usuario web.|Sus opciones de aplicación de escritorio, Administrador de archivos y Terminal no controlan las acciones de archivos del navegador.|
|Descargue enlaces de archivos locales en mensajes de conversación cuando se haga clic en ellos.|La acción de apertura de archivos en el escritorio no tiene un destino de navegador utilizable para estos archivos.|
|Conserve el diseño heredado de npm, Nix y parche en la raíz del repositorio.|Esto mantiene compatibles las actualizaciones ascendentes y la compilación de extracción y parcheo; Las entradas de referencia exactas se enumeran arriba.|
|Mover la implementación a`~/Desktop/apps/codex-web`, con Node dentro de ese directorio.|Luego, el iniciador utiliza una ruta de implementación autónoma; la implementación anterior permanece para revertirse.|
|Elimine una imagen no enviada de su vista previa en pantalla completa mediante la devolución de llamada de eliminación existente del archivo adjunto.|La acción de vista previa debe coincidir con la miniatura X y no debe aparecer en imágenes ya enviadas.|
|Utilice una etiqueta de texto para eliminarla en la barra de herramientas de vista previa de pantalla completa.|Una segunda X al lado de Close era visualmente confusa; el botón de texto mantiene el estilo de la barra de herramientas y distingue las acciones.|
|Proporcione a la página de inicio de sesión una tarjeta centrada con campos de cuenta y contraseña y una verificación real de IP confiable.|El diseño de referencia mejora la jerarquía; la acción secundaria verifica la lista de servidores permitidos existentes y explica la denegación.|
|Mantenga la página de inicio de sesión como punto de entrada después del cierre de sesión, incluso para IP confiables.|El acceso a IP confiable se selecciona explícitamente en la página de inicio de sesión; una IP por sí sola no crea una sesión.|
|Requerir la confirmación explícita del usuario antes de cada reinicio o reemplazo del proceso en ejecución del Codex Web iniciado por el operador.|Un reinicio interrumpe las conversaciones y tareas activas. Primero complete la preparación reversible y las verificaciones, describa el servicio específico y la interrupción esperada, luego espere la respuesta afirmativa del usuario. Un período de inactividad o una aprobación anterior no autoriza un reinicio posterior. El sistema existente`Restart=always`la recuperación después de una falla del proceso es independiente de un reinicio iniciado por el operador.|
|Mantenga la propuesta de actualización continua como diseño histórico únicamente.|El usuario prefirió una puerta de confirmación explícita a agregar proxy y superponer la complejidad del backend. No se implementó ninguna migración de proxy o tarea.|
|Abra un chat local en una pestaña del navegador tanto desde el menú del encabezado como desde el menú de la fila de la barra lateral.|La acción IPC de nueva ventana del escritorio no abre una ventana utilizable del navegador. Ambos menús ahora usan el navegador`/thread/<id>`ruta, y la fila de la barra lateral expone su botón de menú en modo Codex. Los chats de host remoto se excluyen porque la ruta del navegador no restaura su contexto de host.|
|Obtenga una vista previa de los archivos locales vinculados desde una conversación en una pestaña del navegador autenticada.|Es posible que la pestaña del editor de archivos de escritorio no se muestre en el servidor web. La vista previa lee el punto final de descarga autenticado existente, muestra texto, imágenes o archivos PDF y ofrece la descarga. Los enlaces de host remoto mantienen su acción original.|
|Agregue un botón de búsqueda al encabezado de la conversación usando el comando existente de buscar en el chat.|El cliente ya tiene una barra de búsqueda con recuentos de coincidencias y navegación anterior/siguiente; el encabezado carecía de un punto de entrada visible.|
|Ajuste el tamaño de la aplicación web a la ventana visual del navegador en dispositivos móviles y tabletas.|lo heredado`100vh`Las alturas de la raíz y el shell pueden exceder el área dejada por las barras dinámicas del navegador o el teclado en pantalla. La ventana gráfica también informa su desplazamiento superior, que puede cambiar mientras el teclado está visible.|
|Mostrar la voz y el historial normal de ChatGPT como no disponibles en este sitio.|La página HTTP actual no puede acceder al micrófono, la voz del escritorio no se traslada automáticamente y el servidor local Codex app-server no enumera los chats normales de la cuenta de ChatGPT. Se ocultan las acciones de voz y se conservan los chats de Codex.|
|Abrir una página local de cambios desde el menú del signo de interrogación.|El usuario pidió un historial visible de este proyecto; la página lee el registro localizado incluido en los archivos estáticos.|

## Traspaso

- Rama: `main`, actualizada por avance rápido desde `feat/standardize-layout`. Los cambios del navegador y la documentación están publicados en la rama predeterminada.
- Completado: Se conservó la estructura de extracción y parches del proyecto original, se añadieron los directorios estándar y `deploy/start.sh`, y se documentaron los límites del despliegue. Los cambios web abarcan el inicio de sesión y las IP de confianza, archivos y vistas previas, vista estática de sitios, eliminación de imágenes no enviadas, búsqueda en chats, apertura en otra pestaña, tamaños móviles y estados no disponibles para funciones de escritorio. El menú de ayuda enlaza este proyecto. En este trabajo se ocultan las acciones de voz, se indica que los ajustes de Voz y el historial normal de ChatGPT no están disponibles y se añade una página local de cambios. Los archivos estáticos se instalaron en el sitio activo sin reiniciar.
- Comprobaciones: Las verificaciones anteriores de aplicación de parches, sintaxis JavaScript, autenticación y tamaños de navegador pasaron. Esta vez se aplicó el parche nuevo, se comprobó la sintaxis de los dos archivos JavaScript modificados y de la página de cambios, se verificó mediante un simulador el contenido en los ocho idiomas y pasaron las comprobaciones de formato, traducción y estructura de 32 documentos con 0 errores. Playwright no pudo ejecutarse porque Chrome no está instalado. La reconstrucción completa del cliente extraído desde el paquete de escritorio, incluida la compresión de recursos, pasó. Faltan pruebas en un navegador autenticado.
- Despliegue: `codex-web.service` sigue activo en su dirección LAN registrada con el mismo proceso iniciado el 2026-09-27. Los archivos estáticos se actualizaron en `~/Desktop/apps/codex-web`; el despliegue anterior en `~/Desktop/app/codex-web` y una copia de los archivos reemplazados permiten volver atrás. La ruta del historial de cambios respondió HTTP 401 sin sesión, como se esperaba. Cualquier reinicio manual futuro requiere una nueva confirmación expresa después de explicar su efecto.
- GitHub: El repositorio público `CharlesGool/codex-web` usa `main`; la publicación de este cambio espera la revisión final y el envío.
- Pendiente: Revisar la naturalidad de todas las traducciones y los textos de licencia de terceros. Tras recargar en un navegador autenticado, probar los controles de voz, el aviso del historial de ChatGPT, el menú y la página de cambios, y iPhone, Android y tabletas reales en vertical y horizontal. No se prevé una actualización gradual. No se encontró ningún archivo de reglas temporales del proyecto.
- Siguiente paso: Revisar los archivos modificados y enviar `main` a GitHub; completar la prueba en un navegador autenticado cuando Chrome esté disponible.

## Historial de cambios

### 0.0.1 (inédito; trabajo actualizado el 28 de septiembre de 2026)

#### Cambió

- Los menús contextuales de archivos locales ahora ofrecen acciones de archivos compatibles con el navegador.
- El menú de signos de interrogación de la barra lateral ahora enlaza con esta bifurcación en GitHub; los menús de aplicaciones de escritorio permanecen ocultos. El campo de búsqueda de conversaciones ahora coincide con la superficie blanca y la sombra sutil de los menús existentes.
- Las mascotas, los atajos de teclado y la configuración de Uso de la computadora muestran un estado no disponible; El menú Ayuda de la barra lateral ya no ofrece la configuración de la extensión de Chrome. Las tareas programadas ahora muestran un estado no disponible específico de la implementación en lugar de una lista de nubes rotas y sugerencias de tareas. La acción del perfil de mascota, el comando de barra diagonal de mascota, la entrada de ayuda de acceso directo, los enlaces de acceso directo a aplicaciones, el menú de aplicaciones de escritorio y la configuración de destino de apertura de archivos predeterminada obsoleta están ocultas o deshabilitadas en la interfaz de usuario web.
- El proyecto mantiene el diseño de compilación ascendente heredado mientras mueve la nueva estructura propia y el iniciador de servicios a directorios estándar.

- Los controles de voz del navegador se ocultan o se muestran como no disponibles; el área de historial de ChatGPT explica que los chats normales de la web y del móvil no pueden sincronizarse aquí. El menú de ayuda lateral abre ahora una página local de cambios.
#### Fijado

- Las tarjetas de recursos del sitio web local abren una vista previa estática del navegador en lugar de invocar el navegador de la aplicación que no está disponible.
- Los enlaces de archivos locales en los mensajes de conversación descargan el archivo al que se hace referencia en lugar de invocar una aplicación de escritorio no disponible.
- La vista previa en pantalla completa de una imagen no enviada ahora incluye una acción que la elimina del borrador.
- La acción de eliminación de vista previa ahora muestra texto en lugar de una X, y la página de inicio de sesión utiliza el formulario de cuenta/contraseña rediseñado con una verificación de IP confiable que funciona.
- La acción de nueva ventana del menú de chat abre una pestaña del navegador y las filas de chat de la barra lateral del Codex exponen el mismo menú.
- Los enlaces de archivos de conversación abren una vista previa del navegador con un botón de descarga en lugar de una pestaña que no se muestra.
- El encabezado de la conversación ahora ofrece un botón de búsqueda que abre la barra de búsqueda existente.
- Los diseños de dispositivos móviles y tabletas ahora siguen la ventana visible cuando las barras del navegador, la rotación o el teclado cambian la altura disponible.

## Historial de commits

| Commit | Resumen |
| --- | --- |
| `b27d4e4` |Reemplace las acciones de escritorio no compatibles en la interfaz de usuario del navegador.|
| `33d3851` |Descargue archivos locales vinculados al hacer clic.|
| `1f98f69` |Registrar la auditoría de estandarización.|
| `35394f5` |Elimina las imágenes no enviadas de la vista previa.|
| `b10b9e5` |Alinee la acción de vista previa y rediseñe el inicio de sesión.|
| `b11f385` | Completar las correcciones del navegador y la documentación del proyecto. |
| `7347aa6` | Registrar el traspaso verificado en GitHub. |
| `47b2ab3` | Registrar la actualización de la rama predeterminada. |
| Commit actual | Indicar las funciones del navegador no disponibles y añadir la página de cambios. |

El historial de Git sigue siendo la fuente definitiva.
