/* =========================================================
   Milu & Me · Lógica compartida
   Cuenta, favoritos, carrito y cookies se guardan en el navegador
   (localStorage). Es un prototipo: no hay servidor ni pagos reales.
   ========================================================= */

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const dinero = n => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
const getProducto = id => PRODUCTOS.find(p => p.id === id);
const getNivel = id => NIVELES.find(n => n.id === id);
const params = new URLSearchParams(location.search);

const store = {
  get(k, def) { try { const v = localStorage.getItem("milu_" + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem("milu_" + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem("milu_" + k); } catch {} }
};

/* ---------- Cuenta ---------- */
async function hash(txt) {
  if (window.crypto && crypto.subtle) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  }
  return btoa(txt);
}
const auth = {
  usuario() { const e = store.get("sesion", null); return e ? store.get("usuarios", {})[e] || null : null; },
  async registrar({ nombre, email, pass }) {
    const us = store.get("usuarios", {});
    email = email.trim().toLowerCase();
    if (us[email]) throw new Error("Ya existe una cuenta con ese correo.");
    us[email] = { nombre: nombre.trim(), email, pass: await hash(pass), favoritos: store.get("fav_invitado", []), pedidos: [] };
    store.set("usuarios", us); store.set("sesion", email); store.del("fav_invitado");
  },
  async entrar({ email, pass }) {
    const us = store.get("usuarios", {}); email = email.trim().toLowerCase();
    if (!us[email] || us[email].pass !== await hash(pass)) throw new Error("Correo o contraseña incorrectos.");
    store.set("sesion", email);
  },
  salir() { store.del("sesion"); },
  guardar(u) { const us = store.get("usuarios", {}); us[u.email] = u; store.set("usuarios", us); }
};

/* ---------- Favoritos ---------- */
const favs = {
  lista() { const u = auth.usuario(); return u ? u.favoritos : store.get("fav_invitado", []); },
  tiene(id) { return this.lista().includes(id); },
  toggle(id) {
    const u = auth.usuario();
    let l = this.lista();
    l = l.includes(id) ? l.filter(x => x !== id) : [...l, id];
    if (u) { u.favoritos = l; auth.guardar(u); } else store.set("fav_invitado", l);
    pintarContadores();
    return l.includes(id);
  }
};

/* ---------- Carrito ---------- */
const carrito = {
  items() { return store.get("carrito", []); },
  guardar(i) { store.set("carrito", i); pintarContadores(); },
  agregar(id, cant = 1) {
    const i = this.items(); const f = i.find(x => x.id === id);
    if (f) f.cant += cant; else i.push({ id, cant });
    this.guardar(i); toast(`Agregado al carrito: ${getProducto(id).titulo}`); sonido.efecto("brillo");
  },
  cambiar(id, cant) { this.guardar(this.items().map(x => x.id === id ? { ...x, cant } : x).filter(x => x.cant > 0)); },
  quitar(id) { this.guardar(this.items().filter(x => x.id !== id)); },
  vaciar() { this.guardar([]); },
  total() { return this.items().reduce((s, x) => s + getProducto(x.id).precio * x.cant, 0); },
  cuenta() { return this.items().reduce((s, x) => s + x.cant, 0); }
};

/* ---------- Ilustración de cajón / torre (CSS) ---------- */
function arteCajon(n, extra = "") {
  return `<div class="arte-cajon ${extra}" style="--c:${n.color};--t:${n.texto}" aria-hidden="true">
    <div class="ac-tapa"></div>
    <div class="ac-caja"><span class="ac-asa"></span><span class="ac-num">${n.nivel}</span></div>
    <div class="ac-tubo"></div>
    ${n.personaje ? `<img class="ac-personaje" src="${n.personaje}" alt="" loading="lazy">` : ""}
  </div>`;
}
function arteTorre(extra = "") {
  return `<div class="arte-torre ${extra}" aria-hidden="true">
    <div class="at-placa"></div>
    ${[...NIVELES].reverse().map(n => `<div class="at-cajon" style="--c:${n.color};--t:${n.texto}"><span class="ac-asa"></span><span class="ac-num">${n.nivel}</span></div>`).join("")}
    <div class="at-placa base"></div>
  </div>`;
}

/* ---------- Tarjeta de producto ---------- */
function tarjetaProducto(p) {
  const n = p.tipo === "cajon" ? getNivel(p.id) : null;
  const fav = favs.tiene(p.id);
  const arte = n ? arteCajon(n) : `<img src="img/producto/torre.jpg" alt="" loading="lazy">`;
  const etiqueta = n ? `<span class="chip-edad" style="--c:${n.color};--t:${n.texto}">${n.edad}+ años</span>`
                     : `<span class="chip-edad ahorro">Ahorra ${Math.round(DESCUENTO_TORRE * 100)}%</span>`;
  const sub = n ? `${TEMAS[n.tema].emoji} ${TEMAS[n.tema].nombre} · ${n.etapa} · ${n.actividades.length} actividades`
                : "Los 5 niveles · 2 a 6 años · 24 actividades";
  const precio = p.precioLista ? `<s>${dinero(p.precioLista)}</s> ${dinero(p.precio)}` : dinero(p.precio);
  return `<article class="card-prod">
    <button class="btn-fav ${fav ? "on" : ""}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${fav ? "Quitar de" : "Agregar a"} favoritos: ${p.titulo}">${iconos.corazon}</button>
    <a href="producto.html?id=${p.id}" class="cp-media ${n ? "" : "foto"}" style="${n ? `--bg:${n.color}22` : ""}">${arte}</a>
    <div class="cp-info">
      ${etiqueta}
      <h3><a href="producto.html?id=${p.id}">${p.titulo}</a></h3>
      <p class="cp-sub">${sub}</p>
      <p class="cp-precio">${precio}</p>
      <button class="btn btn-primario btn-bloque" data-add="${p.id}">Agregar al carrito</button>
    </div>
  </article>`;
}

/* Delegación global para ♥ y carrito */
document.addEventListener("click", e => {
  const f = e.target.closest("[data-fav]");
  if (f) {
    const on = favs.toggle(f.dataset.fav);
    f.classList.toggle("on", on); f.setAttribute("aria-pressed", on);
    toast(on ? "Guardado en favoritos ♥" : "Quitado de favoritos"); if (on) sonido.efecto("burbuja");
    document.dispatchEvent(new Event("favs-cambio"));
  }
  const a = e.target.closest("[data-add]");
  if (a) carrito.agregar(a.dataset.add);
});

/* ---------- Iconos (SVG propios) ---------- */
const iconos = {
  musica: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="17" cy="16" r="3" fill="currentColor"/></svg>`,
  corazon: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.1 0 3.4 1.2 4 2.2.6-1 1.9-2.2 4-2.2 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>`,
  usuario: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>`,
  bolsa: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
  buscar: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v6h4v-6H16l.5-4h-3V9c0-.6.4-1 1-1z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor"/><path d="M10 9v6l5-3z" fill="#4D5A71"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
  candado: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
  descarga: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>`
};

/* ---------- Sonido (muy suave) ----------
   Música apagada al entrar; se activa con el botón 🎵 del encabezado.
   Efectos cortos y bajitos al agregar al carrito o a favoritos. */
const sonido = {
  vol: { musica: 0.12, efecto: 0.18 },
  archivos: { brillo: "audio/brillo.mp3", burbuja: "audio/burbuja.mp3", aplausos: "audio/aplausos.mp3" },
  efectosOn() { return store.get("efectos", true); },
  efecto(nombre) {
    if (!this.efectosOn()) return;
    try { const a = new Audio(this.archivos[nombre]); a.volume = this.vol.efecto; a.play().catch(() => {}); } catch {}
  },
  musica: null,
  toggleMusica() {
    if (!this.musica) { this.musica = new Audio("audio/musica-fondo.mp3"); this.musica.loop = true; this.musica.volume = this.vol.musica; }
    if (this.musica.paused) { this.musica.play().catch(() => {}); return true; }
    this.musica.pause(); return false;
  }
};

/* ---------- Reproductor de video (modal) ---------- */
function verVideo(src, titulo) {
  let m = $("#modal-video");
  if (!m) {
    document.body.insertAdjacentHTML("beforeend", `<dialog class="modal modal-video" id="modal-video" aria-label="Video">
      <div class="mv-cab"><h2 id="mv-t"></h2><button class="mv-cerrar" aria-label="Cerrar video">✕</button></div>
      <video id="mv-v" controls playsinline preload="metadata"></video></dialog>`);
    m = $("#modal-video");
    $(".mv-cerrar", m).onclick = () => m.close();
    m.addEventListener("close", () => $("#mv-v").pause());
  }
  $("#mv-t").textContent = titulo; const v = $("#mv-v"); v.src = src; v.volume = .6;
  m.showModal(); v.play().catch(() => {});
}
document.addEventListener("click", e => { const b = e.target.closest("[data-video]"); if (b) verVideo(b.dataset.video, b.dataset.titulo || "Mira cómo se juega"); });

/* ---------- Header y footer ---------- */
const LOGO = `<a href="index.html" class="logo"><img src="img/marca/logo-milu.png" alt="Milu & Me, inicio" width="74" height="56"></a>`;

function header() {
  const edades = NIVELES.map(n => `<li><a href="tienda.html?edad=${n.edad}"><span class="punto" style="--c:${n.color}"></span>${n.edad} años · ${n.etapa}</a></li>`).join("");
  const temas = Object.entries(TEMAS).map(([k, t]) => `<li><a href="tienda.html?tema=${k}">${t.emoji} ${t.nombre}</a></li>`).join("");
  const niveles = NIVELES.map(n => `<li><a href="producto.html?id=${n.id}">Nivel ${n.nivel} · ${n.nombre}</a></li>`).join("");
  return `
  <a class="saltar" href="#contenido">Saltar al contenido</a>
  <div class="barra-aviso">Envíos a todo México · Al comprar tu cajón desbloqueas su nivel en la app</div>
  <header class="header">
    <div class="h-fila contenedor">
      <button class="h-menu" aria-label="Abrir menú" aria-expanded="false">${iconos.menu}</button>
      ${LOGO}
      <nav class="nav" aria-label="Principal">
        <ul class="nav-lista">
          <li class="nav-drop"><button class="nav-btn" aria-expanded="false">Comprar</button>
            <div class="mega">
              <div><h4>Por edad</h4><ul>${edades}</ul></div>
              <div><h4>Por tema</h4><ul>${temas}</ul></div>
              <div><h4>Por nivel</h4><ul>${niveles}</ul></div>
              <a class="mega-torre" href="producto.html?id=torre"><img src="img/producto/torre.jpg" alt=""><span><b>Torre completa</b>Los 5 cajones · ahorra ${Math.round(DESCUENTO_TORRE * 100)}%</span></a>
            </div>
          </li>
          <li><a class="nav-btn" href="actividades.html">Actividades y guías</a></li>
          <li><a class="nav-btn" href="seguridad.html">Seguridad digital</a></li>
          <li><a class="nav-btn" href="index.html#app">La app</a></li>
        </ul>
      </nav>
      <div class="h-iconos">
        <form class="buscador" action="tienda.html" role="search">
          <label for="q" class="sr">Buscar</label>
          <input id="q" name="q" type="search" placeholder="Buscar cajones, temas…">
          <button aria-label="Buscar">${iconos.buscar}</button>
        </form>
        <button class="h-ico h-musica" aria-pressed="false" aria-label="Música de fondo" title="Música suave">${iconos.musica}</button>
        <a href="cuenta.html" class="h-ico" aria-label="Mi cuenta">${iconos.usuario}<span class="h-nombre"></span></a>
        <a href="favoritos.html" class="h-ico" aria-label="Favoritos">${iconos.corazon}<span class="badge" data-cont="fav"></span></a>
        <a href="carrito.html" class="h-ico" aria-label="Carrito">${iconos.bolsa}<span class="badge" data-cont="cart"></span></a>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer class="footer">
    <div class="contenedor f-grid">
      <div class="f-marca">${LOGO}<p>Juego físico + app para iPad para niñas y niños de 2 a 6 años. Aprender jugando, juntos.</p></div>
      <div><h4>Comprar</h4><ul>
        <li><a href="tienda.html">Todos los cajones</a></li>
        <li><a href="tienda.html?tema=espacio">Espacio</a></li>
        <li><a href="tienda.html?tema=oceano">Océano</a></li>
        <li><a href="tienda.html?tema=bosque">Bosque</a></li>
        <li><a href="producto.html?id=torre">Torre completa</a></li></ul></div>
      <div><h4>Para familias</h4><ul>
        <li><a href="actividades.html">Actividades y guías</a></li>
        <li><a href="seguridad.html">Seguridad digital</a></li>
        <li><a href="cuenta.html">Mi cuenta</a></li>
        <li><a href="favoritos.html">Favoritos</a></li></ul></div>
      <div><h4>Síguenos</h4>
        <div class="redes">
          <a href="#" aria-label="Facebook de Milu & Me">${iconos.facebook}</a>
          <a href="#" aria-label="YouTube de Milu & Me">${iconos.youtube}</a>
          <a href="#" aria-label="Instagram de Milu & Me">${iconos.instagram}</a>
        </div></div>
    </div>
    <div class="f-legal">
      <div class="contenedor">
        <ul>
          <li><a href="privacidad.html">Política de privacidad</a></li>
          <li><a href="cookies.html">Política de cookies</a></li>
          <li><a href="aviso-legal.html">Aviso legal</a></li>
          <li><a href="terminos.html">Cláusulas de uso</a></li>
          <li><a href="accesibilidad.html">Accesibilidad</a></li>
          <li><button class="link" data-cookies-config>Configuración de cookies</button></li>
        </ul>
        <p>© ${new Date().getFullYear()} Milu & Me. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
  <div class="toast" role="status" aria-live="polite"></div>`;
}

/* ---------- Cookies ---------- */
function cookies() {
  const html = `
  <div class="cookie-banner" role="region" aria-label="Aviso de cookies" hidden>
    <p>Usamos cookies necesarias para que funcionen tu cuenta y tu carrito. Con tu permiso usamos otras para medir visitas y mejorar el sitio. <a href="cookies.html">Más información</a></p>
    <div class="cb-botones">
      <button class="btn btn-sec" data-ck="rechazar">Rechazar opcionales</button>
      <button class="btn btn-sec" data-cookies-config>Configurar</button>
      <button class="btn btn-primario" data-ck="aceptar">Aceptar todas</button>
    </div>
  </div>
  <dialog class="modal" id="modal-cookies" aria-labelledby="mc-t">
    <h2 id="mc-t">Configuración de cookies</h2>
    <label class="ck-op"><span><b>Necesarias</b><br>Sesión, carrito y preferencias. Siempre activas.</span><input type="checkbox" checked disabled></label>
    <label class="ck-op"><span><b>Analíticas</b><br>Nos ayudan a saber qué páginas se visitan.</span><input type="checkbox" id="ck-ana"></label>
    <label class="ck-op"><span><b>Marketing</b><br>Anuncios relevantes en otras plataformas.</span><input type="checkbox" id="ck-mkt"></label>
    <div class="cb-botones"><button class="btn btn-sec" data-ck="cerrar">Cancelar</button><button class="btn btn-primario" data-ck="guardar">Guardar preferencias</button></div>
  </dialog>`;
  document.body.insertAdjacentHTML("beforeend", html);
  const banner = $(".cookie-banner"), modal = $("#modal-cookies");
  if (!store.get("cookies", null)) banner.hidden = false;
  const guardar = (a, m) => { store.set("cookies", { analiticas: a, marketing: m, fecha: Date.now() }); banner.hidden = true; toast("Preferencias de cookies guardadas"); };
  document.addEventListener("click", e => {
    if (e.target.closest("[data-cookies-config]")) {
      const c = store.get("cookies", { analiticas: false, marketing: false });
      $("#ck-ana").checked = c.analiticas; $("#ck-mkt").checked = c.marketing;
      modal.showModal ? modal.showModal() : modal.setAttribute("open", "");
    }
    const b = e.target.closest("[data-ck]"); if (!b) return;
    const a = b.dataset.ck;
    if (a === "aceptar") guardar(true, true);
    if (a === "rechazar") guardar(false, false);
    if (a === "guardar") { guardar($("#ck-ana").checked, $("#ck-mkt").checked); modal.close(); }
    if (a === "cerrar") modal.close();
  });
}

/* ---------- Toast y contadores ---------- */
let tToast;
function toast(msg) {
  const t = $(".toast"); if (!t) return;
  t.textContent = msg; t.classList.add("ver");
  clearTimeout(tToast); tToast = setTimeout(() => t.classList.remove("ver"), 2400);
}
function pintarContadores() {
  const f = favs.lista().length, c = carrito.cuenta();
  $$("[data-cont=fav]").forEach(b => { b.textContent = f || ""; b.hidden = !f; });
  $$("[data-cont=cart]").forEach(b => { b.textContent = c || ""; b.hidden = !c; });
  const u = auth.usuario(); $$(".h-nombre").forEach(s => s.textContent = u ? u.nombre.split(" ")[0] : "");
}

/* ---------- Arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("afterbegin", header());
  document.body.insertAdjacentHTML("beforeend", footer());
  cookies(); pintarContadores();

  const mb = $(".h-musica");
  mb.addEventListener("click", () => { const on = sonido.toggleMusica(); mb.setAttribute("aria-pressed", on); mb.classList.toggle("on", on); toast(on ? "🎵 Música suave activada" : "Música apagada"); });

  const menuBtn = $(".h-menu"), nav = $(".nav");
  menuBtn.addEventListener("click", () => { const o = nav.classList.toggle("abierto"); menuBtn.setAttribute("aria-expanded", o); });
  $$(".nav-drop > .nav-btn").forEach(b => b.addEventListener("click", () => {
    const li = b.parentElement, o = li.classList.toggle("abierto"); b.setAttribute("aria-expanded", o);
  }));
  document.addEventListener("click", e => { if (!e.target.closest(".nav-drop")) $$(".nav-drop").forEach(li => { li.classList.remove("abierto"); $(".nav-btn", li).setAttribute("aria-expanded", false); }); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".nav-drop").forEach(li => li.classList.remove("abierto")); });

  const pagina = document.body.dataset.pagina;
  if (typeof paginas !== "undefined" && paginas[pagina]) paginas[pagina]();
});
