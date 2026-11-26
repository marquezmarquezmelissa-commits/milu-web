# Milu & Me · Sitio web (prototipo)

## Cómo abrirlo en Visual Studio Code
1. Descomprime la carpeta `milu-web`.
2. En VS Code: **Archivo → Abrir carpeta…** y elige `milu-web`.
3. Instala la extensión **Live Server**, da clic derecho en `index.html` → **Open with Live Server**.
   (También funciona con doble clic en `index.html`).

## Estructura
```
index.html          Inicio (bloques por edad, torre interactiva, temas, app)
tienda.html         Tienda con filtros por edad, tema y nivel
producto.html       Ficha de cada cajón y de la torre (?id=nivel-1 … nivel-5 / torre)
actividades.html    Actividades y guías: PDFs descargables con cuenta
seguridad.html      Seguridad digital
cuenta.html         Registro, inicio de sesión y pedidos
favoritos.html      Favoritos
carrito.html        Carrito y pedido (pago simulado)
privacidad.html · cookies.html · aviso-legal.html · terminos.html · accesibilidad.html
css/styles.css      Estilos (paleta del manual de marca)
js/data.js          ← AQUÍ editas precios, colores, textos y actividades
js/app.js           Header, footer, cuenta, carrito, favoritos y cookies
js/pages.js         Lógica de cada página
img/marca/          Logo, insignia, estrella y cohetes
img/personajes/     Milu y sus amigos (alien, peces, medusa, animales del bosque…)
img/fondos/         Fondos de Espacio, Océano y Bosque
img/espacio/        Planetas y lunas
img/producto/       Render de la torre
video/              Intro del logo y tutoriales por actividad (video/tutoriales/nivelX-actividadY.mp4)
audio/              Música de fondo (apagada al entrar) y efectos suaves
descargas/nivel-N/  Manuales (reales) y plantillas por actividad (de ejemplo)

Todo viene de milu-and-me/assets. Para agregar un tutorial nuevo, copia el video a
video/tutoriales/ y agrégalo en js/data.js, en "videos" del nivel (el número es la actividad - 1).
Volumen: en js/app.js, objeto "sonido" (música 0.12, efectos 0.18).
```

## Pendientes
- Reemplazar los PDF de ejemplo en `descargas/` por las plantillas finales, con el mismo nombre.
- Completar los datos marcados como **[COMPLETAR]** en las páginas legales.
- Poner los links reales de Facebook, YouTube e Instagram en `js/app.js` (busca `href="#"`).
- Agregar el logo e ilustraciones finales (el logo actual es texto).

## Nota
Es un prototipo: cuentas, favoritos, carrito y pedidos se guardan en el navegador
(localStorage). No hay servidor ni cobros reales.
