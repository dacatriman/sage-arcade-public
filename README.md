# Sage Arcade 2026 · página pública

Esta carpeta contiene una versión estática del marcador para GitHub Pages. Muestra porcentajes acumulados por equipo y producto, más la última etapa cerrada. No contiene nombres individuales, objetivos SQO ni el libro Excel.

## Archivos que hay que subir

Sube **el contenido de esta carpeta**, conservando esta estructura en la raíz del repositorio:

```text
index.html
README.md
assets/
  app.js
  data.js
  style.css
```

No subas la carpeta completa `ARCADE GAME`, los libros Excel ni el Site privado. `index.html` debe quedar en la raíz, no dentro de `sage-arcade-github`.

## Primera publicación en GitHub

1. Entra en [GitHub](https://github.com/) con la cuenta `dacatriman`.
2. Pulsa el botón **+** de la esquina superior derecha y elige **New repository**.
3. Nombre: `sage-arcade-public`. Selecciona **Public**. Deja desmarcada la opción de añadir un README, porque ya hay uno preparado aquí. Crea el repositorio.
4. En la página del repositorio, elige **Add file → Upload files**. Arrastra `index.html`, `README.md` y la carpeta `assets` desde esta carpeta. Comprueba que GitHub muestra `assets/data.js`, `assets/app.js` y `assets/style.css` dentro de `assets`.
5. Escribe un mensaje como `Add Sage Arcade public scoreboard` y confirma con **Commit changes** en la rama `main`.
6. Abre **Settings → Pages**. En **Build and deployment**, elige **Deploy from a branch**. Selecciona `main` y `/(root)`, y pulsa **Save**.
7. Cuando GitHub termine la publicación, abre `https://dacatriman.github.io/sage-arcade-public/`. También puedes usar **Settings → Pages → Visit site**. La primera publicación y los cambios posteriores pueden tardar varios minutos.

## Actualizar los resultados manualmente

1. Después de validar el cierre, abre `assets/data.js` en el repositorio de GitHub y pulsa el icono del lápiz (**Edit this file**).
2. Cambia `closedStage` al número de la última etapa cerrada: `0` antes del primer cierre y `1` a `8` después.
3. Cambia `overall` y los tres valores de `products` para cada equipo. Son **porcentajes acumulados**; escribe `82.5` para 82,5 %. Se permiten cifras superiores a 100. Los códigos son `A` = Pixel Outlaws, `B` = The Final Credits y `C` = Glitch Raiders.
4. Cambia `updatedAt` por la fecha y hora del cambio, en formato ISO, por ejemplo `"2026-11-13T17:00:00+01:00"`.
5. Pulsa **Commit changes**. GitHub Pages publicará el nuevo marcador desde ese commit. Recarga la página pública cuando termine el despliegue.

Edita solo los números y `updatedAt` en `assets/data.js`; conserva las llaves, comas y nombres de producto. Los tres equipos empiezan en cero porque todavía no se ha publicado un cierre validado.

## Si la página no se ve bien

- Si ves un 404, comprueba en **Settings → Pages** que la fuente sea `main` y `/(root)`, y que `index.html` esté en la raíz.
- Si aparece la página pero faltan estilos o cifras, comprueba que la carpeta `assets` y sus tres archivos se hayan subido con esos nombres exactos.
- Si acabas de hacer un commit, revisa la pestaña **Actions** del repositorio para ver si la publicación terminó.

La configuración de GitHub Pages sigue la [documentación oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Los pasos para subir archivos están en la [guía de GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
