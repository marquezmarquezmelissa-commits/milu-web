/* =========================================================
   Milu & Me · Datos del catálogo
   Edita aquí precios, colores, textos y actividades.
   ========================================================= */

/* Precios de venta (MXN) · de "Costos_por_cajon_Milu.pdf" (versión verificada, nov 2026) */
const PRECIOS = { 1: 1250, 2: 1250, 3: 1250, 4: 1250, 5: 1250 };
const PRECIO_TORRE = 4700;
const PRECIO_RECARGA_BASE = 199;          // Torre completa (5 cajones) · precio verificado

const TEMAS = {
  espacio: { nombre: "Espacio", emoji: "🚀", fondo: "img/fondos/espacio.jpg", amigos: ["img/personajes/alien.png", "img/espacio/planeta.png"], desc: "Milu despega, explora planetas y prepara su regreso a casa." },
  oceano:  { nombre: "Océano",  emoji: "🐙", fondo: "img/fondos/oceano.jpg", amigos: ["img/personajes/pez-rosa.png", "img/personajes/medusa.png"], desc: "Una pieza de la nave cae al mar y los amigos marinos ayudan a recuperarla." },
  bosque:  { nombre: "Bosque",  emoji: "🌳", fondo: "img/fondos/bosque.jpg", amigos: ["img/personajes/bosque-conejo.png", "img/personajes/bosque-abeja.png"], desc: "Los animalitos del bosque guardan secretos para seguir el viaje." }
};

/* color = color del cajón (solo paleta del manual de marca).
   CONFIRMAR colores de N1, N4 y N5. */
const NIVELES = [
  {
    id: "nivel-1", fotos: [["img/producto/n1-material.jpg", "Material real del Nivel 1: tablero con estrellas y cajita de figuras"]], personaje: "img/espacio/planeta.png", videos: { 0: "video/tutoriales/nivel1-actividad1.mp4" }, nivel: 1, edad: 2, etapa: "Maternal", tema: "espacio",
    nombre: "Primer contacto", color: "#F9DB54", texto: "#4D5A71",
    resumen: "Las primeras formas, texturas y colores del universo de Milu.",
    habilidades: ["Motricidad fina", "Formas y colores", "Coordinación ojo-mano"],
    incluye: ["Plastilina de 3 colores con cajita", "4 esferas moradas", "Tablero y 4 figuras de estrella",
              "4 tarjetas visuales laminadas", "1 hoja de trabajo y 2 plantillas", "Papel de colores", "Stickers", "Manual de instrucciones"],
    actividades: [
      { t: "Un universo de formas", d: "Crea tus propios planetas con plastilina." },
      { t: "Atrapa las estrellas", d: "Coloca cada estrella en su lugar del tablero." },
      { t: "Despega, tripulante", d: "Decora tu cohete con papelitos y tu foto." },
      { t: "Rasga el camino hacia el planeta", d: "Rasga la línea punteada hasta llegar al planeta." }
    ]
  },
  {
    id: "nivel-2", personaje: "img/personajes/alien.png", videos: {}, nivel: 2, edad: 3, etapa: "PK3", tema: "espacio",
    nombre: "Preparando el viaje", color: "#EC76AD", texto: "#FFF8E8",
    resumen: "Relaciona, alimenta y completa el universo antes de despegar.",
    habilidades: ["Pinza fina", "Relación de siluetas", "Lenguaje y conversación"],
    incluye: ["Pompones de varios tamaños", "Estambre", "3 hojas de trabajo", "3 tarjetas visuales laminadas",
              "Plantilla de stickers", "Manual de instrucciones"],
    actividades: [
      { t: "Une los elementos espaciales", d: "Une cada elemento con su silueta usando estambre." },
      { t: "Alimenta a tu amigo", d: "Mete los pompones en la boca del amigo marciano." },
      { t: "Completa el universo de Milu", d: "Completa la escena con stickers." },
      { t: "Observa y rellena", d: "Rellena la luna, el planeta y la estrella con pompones." }
    ]
  },
  {
    id: "nivel-3", personaje: "img/personajes/medusa.png", videos: { 0: "video/tutoriales/nivel3-actividad1.mp4", 1: "video/tutoriales/nivel3-actividad2.mp4", 2: "video/tutoriales/nivel3-actividad3.mp4", 3: "video/tutoriales/nivel3-actividad4.mp4", 4: "video/tutoriales/nivel3-actividad5.mp4", 5: "video/tutoriales/nivel3-actividad6.mp4", 6: "video/tutoriales/nivel3-actividad7.mp4", 7: "video/tutoriales/nivel3-actividad8.mp4" }, nivel: 3, edad: 4, etapa: "PK4", tema: "oceano",
    nombre: "Explorando las profundidades", color: "#A4CFDD", texto: "#4D5A71",
    resumen: "Rescata criaturas, ensarta perlas y recupera la pieza de la nave.",
    habilidades: ["Uso de pinzas", "Patrones y secuencias", "Trazos curvos"],
    incluye: ["Pinza y 4 criaturas marinas", "Cuentas grandes y chicas con cordón", "Limpiapipas",
              "Plastilina de 3 colores con cajita", "3 hojas de trabajo y plantilla de medusa",
              "6 tarjetas visuales laminadas", "Papel de colores", "Stickers", "Manual de instrucciones"],
    actividades: [
      { t: "Rescata las figuras marinas", d: "Lleva las criaturas al agua con la pinza." },
      { t: "Mi mundo acuático", d: "Crea tu propia pecera con papel rasgado." },
      { t: "Perlas de colores", d: "Ensarta cuentas siguiendo un patrón." },
      { t: "Ayúdale al pulpo", d: "Devuélvele al pulpo sus objetos con stickers." },
      { t: "Olas y caminos", d: "Sigue las corrientes marinas con tu dedo." },
      { t: "Estrellitas en acción", d: "Rellena la estrella de mar con plastilina." },
      { t: "Un arrecife de colores", d: "Construye tu coral con plastilina." },
      { t: "Medusa de colores", d: "Decora tu medusa con limpiapipas y cuentas." }
    ]
  },
  {
    id: "nivel-4", personaje: "img/personajes/bosque-conejo.png", videos: { 0: "video/tutoriales/nivel4-actividad1.mp4", 1: "video/tutoriales/nivel4-actividad2.mp4" }, nivel: 4, edad: 5, etapa: "K5", tema: "bosque",
    nombre: "Los secretos del bosque", color: "#4D5A71", texto: "#FFF8E8",
    resumen: "Prepárate, guía a los animalitos y arma tu propio bosque en 3D.",
    habilidades: ["Recortar y doblar", "Construcción en 3D", "Planeación de rutas"],
    incluye: ["4 botones grandes", "Estambre", "2 hojas de trabajo", "2 plantillas armables",
              "Papel de colores", "Plantilla de stickers", "Manual de instrucciones"],
    actividades: [
      { t: "Listo para explorar", d: "Viste al guardián del bosque con botones y stickers." },
      { t: "Guía a los animalitos del bosque", d: "Sigue cada camino hasta el otro lado." },
      { t: "Árbol de colores", d: "Colorea y arma un árbol que se sostiene en 3D." },
      { t: "Arma tu abejita", d: "Recorta, dobla y arma tu abeja." }
    ]
  },
  {
    id: "nivel-5", personaje: "img/personajes/milu-astronauta.png", videos: {}, nivel: 5, edad: 6, etapa: "Preprimaria", tema: "espacio",
    nombre: "El regreso a casa", color: "#FFF8E8", texto: "#4D5A71",
    resumen: "Letras, palabras y un planeta propio para que Milu vuelva a casa.",
    habilidades: ["Lectoescritura", "Abecedario", "Creatividad libre"],
    incluye: ["27 cuentas del abecedario", "4 esferas moradas", "Plastilina de 3 colores con cajita",
              "3 hojas de trabajo", "4 tarjetas visuales laminadas", "Papel de colores", "Stickers", "Manual de instrucciones"],
    actividades: [
      { t: "Une las piezas", d: "Une las letras en orden y descubre el cohete." },
      { t: "Un mensaje espacial", d: "Escríbele una carta a Milu." },
      { t: "Construcción de palabras", d: "Forma palabras con las cuentas del abecedario." },
      { t: "Mi propio planeta", d: "Crea tu planeta con plastilina y esferas." }
    ]
  }
];

/* Fotos del empaque (se muestran en la galería de cada cajón) */
const FOTOS_EMPAQUE = [["img/producto/empaque-frente.jpg", "Empaque, vista de frente"], ["img/producto/empaque-reverso.jpg", "Empaque, vista de atrás"]];

/* Todo cajón incluye estas piezas */
const INCLUYE_SIEMPRE = [
  "Cajón con tapa, esquineros y seguro propio",
  "Pieza del cohete (tubito modular)",
  "Tarjetas con QR para ver cada actividad en la app",
  "4 llaveritos de colección",
  "Acceso a su nivel en la app para iPad"
];

/* Productos de la tienda: 5 cajones + la torre */
const PRODUCTOS = [
  ...NIVELES.map(n => ({
    id: n.id, tipo: "cajon", nivel: n.nivel, edad: n.edad, tema: n.tema,
    titulo: `Cajón Nivel ${n.nivel} · ${n.nombre}`, precio: PRECIOS[n.nivel], color: n.color, texto: n.texto
  })),
  {
    id: "torre", tipo: "torre", nivel: null, edad: null, tema: "todos",
    titulo: "Torre completa · 5 cajones",
    get precio() { const t = temporadaActiva(); return t ? t.precioTorre : PRECIO_TORRE; },
    get precioLista() { return temporadaActiva() ? PRECIO_TORRE : undefined; }
  },
  ...NIVELES.map(n => ({
    id: `recarga-${n.nivel}`, tipo: "recarga", nivel: n.nivel, edad: n.edad, tema: n.tema,
    titulo: `Kit de recarga · Nivel ${n.nivel}`, precio: PRECIO_RECARGA_BASE, color: n.color, texto: n.texto
  }))
];

/* ---------- Kits de recarga (material que se gasta) ---------- */
const RECARGA_INCLUYE = {
  1: ["Plastilina de 3 colores", "Hoja de trabajo y 2 plantillas", "Papel de colores", "Hoja de stickers"],
  2: ["Pompones de varios tamaños", "Estambre", "3 hojas de trabajo", "Hoja de stickers"],
  3: ["Plastilina de 3 colores", "Cuentas grandes y chicas", "Cordón y limpiapipas", "3 hojas de trabajo y plantilla de medusa", "Papel de colores", "Hoja de stickers"],
  4: ["Estambre", "2 hojas de trabajo", "2 plantillas armables", "Papel de colores", "Hoja de stickers"],
  5: ["Plastilina de 3 colores", "3 hojas de trabajo", "Papel de colores", "Hoja de stickers"]
};

/* ---------- Promociones (edita aquí) ---------- */
const PROMOS = {
  cupon: { codigo: "BIENVENIDA10", pct: 0.10 },          // 1ª compra al dejar tu correo · 1 sola vez
  escalera: { 2: 0.05, 3: 0.08, 4: 0.10 },               // % según cajones en el carrito (4 o más = 10 %)
  envioGratisDesde: 2500, costoEnvio: 180,
  segundaTorrePct: 0.10,                                 // 2ª torre (o más) 10 % menos
  temporadas: [                                          // Torre a $3,999 solo estos días (mes-día)
    { id: "dia-del-nino", nombre: "Día del Niño", desde: "04-23", hasta: "04-30", precioTorre: 3999 },
    { id: "buen-fin", nombre: "Buen Fin", desde: "11-13", hasta: "11-17", precioTorre: 3999 },
    { id: "navidad", nombre: "Navidad y Reyes", desde: "12-15", hasta: "01-06", precioTorre: 3999 }
  ]
};
function temporadaActiva() {
  let demo = null;
  try { demo = new URLSearchParams(location.search).get("temporada") || sessionStorage.getItem("milu_temporada"); if (demo) sessionStorage.setItem("milu_temporada", demo); if (demo === "off") { sessionStorage.removeItem("milu_temporada"); demo = null; } } catch {}
  if (demo) return PROMOS.temporadas.find(t => t.id === demo) || PROMOS.temporadas[0];
  const d = new Date(), md = String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  return PROMOS.temporadas.find(t => t.desde <= t.hasta ? (md >= t.desde && md <= t.hasta) : (md >= t.desde || md <= t.hasta)) || null;
}
const nivelDe = p => p && p.nivel ? NIVELES[p.nivel - 1] : null;

/* PDFs descargables (en /descargas). Reemplaza los archivos con los finales, mismo nombre. */
const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
/* Actividades que tienen plantilla imprimible (índice = actividad - 1). Las demás se juegan con el material del cajón. */
const PLANTILLAS = { 1: [0, 2, 3], 2: [0, 1, 2, 3], 3: [1, 2, 3, 4, 5], 4: [0, 1], 5: [0, 1, 2, 3] };
function pdfActividad(nivel, i, titulo) { return PLANTILLAS[nivel].includes(i) ? `descargas/nivel-${nivel}/${i + 1}-${slug(titulo)}.pdf` : null; }
const PDF_STICKERS_MILU = "descargas/stickers-milu.pdf";
const VIDEO_APP = "video/app-milu.mp4";
function pdfManual(nivel) { return `descargas/nivel-${nivel}/manual-nivel-${nivel}.pdf`; }

