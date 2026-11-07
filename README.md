# Sage Arcade 2026 · página pública

Esta carpeta contiene el diseño de Mission Control adaptado a GitHub Pages. Muestra SQO acumulados, objetivos totales y porcentajes de avance por equipo y producto frente a las ocho etapas completas. No contiene nombres individuales ni el libro Excel.

## Archivos que hay que subir

Sube **el contenido de esta carpeta**, conservando esta estructura en la raíz del repositorio:

```text
index.html
README.md
assets/
  data.js
  mission-control.js
  styles.css
  layout.css
  logos/
    pixel-outlaws.png
    the-final-credits.png
    glitch-raiders.png
tools/
  Sync-ExcelScores.ps1
```

No subas la carpeta completa `ARCADE GAME`, los libros Excel ni el Site privado. `index.html` debe quedar en la raíz, no dentro de `sage-arcade-github`.

## Primera publicación en GitHub

1. Entra en [GitHub](https://github.com/) con la cuenta `dacatriman`.
2. Pulsa el botón **+** de la esquina superior derecha y elige **New repository**.
3. Nombre: `sage-arcade-public`. Selecciona **Public**. Deja desmarcada la opción de añadir un README, porque ya hay uno preparado aquí. Crea el repositorio.
4. En la página del repositorio, elige **Add file → Upload files**. Arrastra `index.html`, `README.md` y la carpeta `assets` desde esta carpeta. Comprueba que GitHub muestra `assets/data.js`, `assets/mission-control.js`, `assets/styles.css`, `assets/layout.css` y los tres PNG dentro de `assets/logos`.
5. Escribe un mensaje como `Add Sage Arcade public scoreboard` y confirma con **Commit changes** en la rama `main`.
6. Abre **Settings → Pages**. En **Build and deployment**, elige **Deploy from a branch**. Selecciona `main` y `/(root)`, y pulsa **Save**.
7. Cuando GitHub termine la publicación, abre `https://dacatriman.github.io/sage-arcade-public/`. También puedes usar **Settings → Pages → Visit site**. La primera publicación y los cambios posteriores pueden tardar varios minutos.

## Actualizar los resultados manualmente

1. Después de validar el cierre, abre `assets/data.js` en el repositorio de GitHub y pulsa el icono del lápiz (**Edit this file**).
2. Cambia `closedStage` al número de la última etapa cerrada: `0` antes del primer cierre y `1` a `8` después.
3. En cada producto, cambia `actual` por los SQO acumulados y `target` por el objetivo total de noviembre y diciembre. La página calcula los porcentajes y el total del equipo. Los códigos son `A` = Pixel Outlaws, `B` = The Final Credits y `C` = Glitch Raiders.
4. Cambia `updatedAt` por la fecha y hora del cambio, en formato ISO, por ejemplo `"2026-11-13T17:00:00+01:00"`.
5. Pulsa **Commit changes**. GitHub Pages publicará el nuevo marcador desde ese commit. Recarga la página pública cuando termine el despliegue.

Si editas el archivo a mano, conserva las llaves, comas y nombres de producto. Usa `testData: true` para cifras ficticias y `testData: false` para resultados validados.

## Actualizar desde el Excel maestro

El script `tools/Sync-ExcelScores.ps1` lee `Calendar & Rules!B5` y los SQO de `SQO Tracker` hasta esa etapa, suma por equipo y producto, y copia el objetivo total de noviembre y diciembre. La página calcula `SQO acumulados ÷ objetivo total` en cada actualización. Solo escribe agregados en `assets/data.js`; no publica nombres ni objetivos individuales. Requiere que `B5` sea una semana cerrada entre 1 y 8.

Desde la raíz del repositorio, con PowerShell 7:

```powershell
pwsh -NoProfile -File tools/Sync-ExcelScores.ps1 -WorkbookPath 'C:\ruta\Sage_Arcade_2026_Master.xlsx' -OutputPath 'assets/data.js'
```

Para una prueba con cifras ficticias, añade `-TestData`. La página mostrará **TEST DATA**. El script actualiza `assets/data.js` y la versión de ese archivo en `index.html` para evitar datos antiguos en la caché del navegador. Después de revisar ambos archivos, haz commit y push a `main`; GitHub Pages publicará el cambio. El Excel permanece local, por lo que GitHub Pages no puede leer sus cambios directamente.

## Si la página no se ve bien

- Si ves un 404, comprueba en **Settings → Pages** que la fuente sea `main` y `/(root)`, y que `index.html` esté en la raíz.
- Si aparece la página pero faltan estilos, cifras o emblemas, comprueba que la carpeta `assets` y sus archivos se hayan subido con los nombres y rutas exactos.
- Si acabas de hacer un commit, revisa la pestaña **Actions** del repositorio para ver si la publicación terminó.

La configuración de GitHub Pages sigue la [documentación oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Los pasos para subir archivos están en la [guía de GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## Añadir los emblemas a un repositorio ya publicado

Sube los tres PNG de `assets/logos/` a esa misma ruta del repositorio. La versión Mission Control usa `assets/mission-control.js`, `assets/styles.css` y `assets/layout.css`. Conserva los nombres exactos. Los archivos antiguos `assets/app.js` y `assets/style.css` ya no se utilizan.
