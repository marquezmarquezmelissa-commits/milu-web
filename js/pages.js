/* =========================================================
   Milu & Me · Lógica de cada página (según <body data-pagina>)
   ========================================================= */
/* Estrella del logo de Milu (puntas redondeadas) */
const ESTRELLA_SVG = `<svg viewBox="0 0 500 479" aria-hidden="true"><path stroke-linejoin="round" d="M250 18 L328 158 L484 186 L374 300 L396 458 L250 390 L104 458 L126 300 L16 186 L172 158 Z"/></svg>`;

const paginas = {

  /* ---------- INICIO ---------- */
  inicio() {
    // Selector tipo torre
    const torre = $("#torre-selector"), panel = $("#torre-panel");
    torre.innerHTML = `<div class="ts-placa"></div>` +
      [...NIVELES].reverse().map(n => `
      <button class="ts-cajon" data-nivel="${n.id}" style="--c:${n.color};--t:${n.texto}" aria-pressed="false">
        <span class="ac-asa"></span>
        <span class="ts-txt"><b>${n.edad} años</b> Nivel ${n.nivel} · ${TEMAS[n.tema].nombre}</span>
      </button>`).join("") + `<div class="ts-placa base"></div>`;

    const verNivel = id => {
      const n = getNivel(id);
      $$(".ts-cajon", torre).forEach(b => { const on = b.dataset.nivel === id; b.classList.toggle("activo", on); b.setAttribute("aria-pressed", on); });
      torre.classList.remove("todos");
      panel.style.setProperty("--c", n.color); panel.style.setProperty("--t", n.texto);
      panel.innerHTML = `
        <img class="tp-personaje" src="${n.personaje}" alt="">
        <span class="chip-edad" style="--c:${n.color};--t:${n.texto}">${n.edad}+ años · ${n.etapa}</span>
        <h3>Nivel ${n.nivel}: ${n.nombre}</h3>
        <p class="tp-tema">${TEMAS[n.tema].emoji} Mundo ${TEMAS[n.tema].nombre}</p>
        <p>${n.resumen}</p>
        <ul class="tp-acts">${n.actividades.map(a => `<li>${a.t}</li>`).join("")}</ul>
        <p class="tp-precio">${dinero(getProducto(n.id).precio)}</p>
        <div class="tp-botones">
          <button class="btn btn-primario" data-add="${n.id}">Agregar al carrito</button>
          <a class="btn btn-sec" href="producto.html?id=${n.id}">Ver cajón</a>
        </div>`;
    };
    const verTorre = () => {
      const t = getProducto("torre");
      $$(".ts-cajon", torre).forEach(b => { b.classList.remove("activo"); b.setAttribute("aria-pressed", false); });
      torre.classList.add("todos");
      panel.style.setProperty("--c", "#4D5A71"); panel.style.setProperty("--t", "#FFF8E8");
      panel.innerHTML = `
        <img class="tp-personaje" src="img/marca/cohete-armable.png" alt="">
        <span class="chip-edad ahorro">5 cajones</span>
        <h3>La torre completa</h3>
        <p class="tp-tema">Los 5 cajones · de 2 a 6 años</p>
        <p>Cada cajón es un set con su propio nivel. Juntos forman una torre modular que crece con tu peque, y sus tubitos arman el cohete de Milu.</p>
        <ul class="tp-acts">${NIVELES.map(n => `<li><span class="punto" style="--c:${n.color}"></span>Nivel ${n.nivel} · ${n.edad} años</li>`).join("")}</ul>
        <p class="tp-precio">${dinero(t.precio)}</p>
        <div class="tp-botones">
          <button class="btn btn-primario" data-add="torre">Agregar la torre</button>
          <a class="btn btn-sec" href="producto.html?id=torre">Ver torre</a>
        </div>`;
    };
    torre.addEventListener("click", e => { const b = e.target.closest(".ts-cajon"); if (b) verNivel(b.dataset.nivel); });
    $("#btn-torre").addEventListener("click", verTorre);
    verNivel("nivel-1");

    // Bloques de edad
    $("#bloques-edad").innerHTML = NIVELES.map(n => `
      <a class="bloque" href="tienda.html?edad=${n.edad}" style="--c:${n.color};--t:${n.texto}" aria-label="${n.edad} años, ${n.etapa}">
        ${ESTRELLA_SVG}
        <span class="b-txt"><b>${n.edad}+</b><span>años</span><small>${n.etapa}</small></span>
      </a>`).join("");

    // Temas
    $("#temas").innerHTML = Object.entries(TEMAS).map(([k, t]) => {
      const ns = NIVELES.filter(n => n.tema === k);
      return `<a class="tema tema-${k}" href="tienda.html?tema=${k}">
        <div class="tema-img" style="background-image:url('${t.fondo}')">${t.amigos.map((a, i) => `<img class="amigo a${i}" src="${a}" alt="">`).join("")}</div>
        <div class="tema-txt"><h3>${t.nombre}</h3><p>${t.desc}</p>
        <span class="tema-niveles">${ns.map(n => `Nivel ${n.nivel}`).join(" · ")}</span></div>
      </a>`;
    }).join("");

    // Destacados
    $("#destacados").innerHTML = PRODUCTOS.map(tarjetaProducto).join("");
  },

  /* ---------- TIENDA ---------- */
  tienda() {
    const f = { tipo: params.get("tipo"), edad: params.get("edad"), tema: params.get("tema"), nivel: params.get("nivel"), q: params.get("q") || "" };
    const grupo = (id, items, key) => {
      $(id).innerHTML = items.map(([v, l]) => `<button class="filtro ${f[key] == v ? "on" : ""}" data-k="${key}" data-v="${v}" aria-pressed="${f[key] == v}">${l}</button>`).join("");
    };
    const pintarFiltros = () => {
      grupo("#f-tipo", [["cajon", "Cajones"], ["torre", "Torre"], ["recarga", "Kits de recarga"]], "tipo");
      grupo("#f-edad", NIVELES.map(n => [n.edad, `${n.edad} años`]), "edad");
      grupo("#f-tema", Object.entries(TEMAS).map(([k, t]) => [k, `${t.emoji} ${t.nombre}`]), "tema");
      grupo("#f-nivel", NIVELES.map(n => [n.nivel, `Nivel ${n.nivel}`]), "nivel");
    };
    const pintar = () => {
      const q = f.q.toLowerCase();
      let l = PRODUCTOS.filter(p => {
        if (f.tipo && p.tipo !== f.tipo) return false;
        if (p.tipo === "torre") return !f.edad && !f.tema && !f.nivel;
        const n = nivelDe(p);
        if (f.edad && n.edad != f.edad) return false;
        if (f.tema && n.tema !== f.tema) return false;
        if (f.nivel && n.nivel != f.nivel) return false;
        if (q && !(p.titulo + " " + TEMAS[n.tema].nombre + " " + n.actividades.map(a => a.t).join(" ")).toLowerCase().includes(q)) return false;
        return true;
      });
      if (q) l = l.filter(p => p.tipo !== "torre" || "torre completa".includes(q));
      $("#resultados").innerHTML = l.length ? l.map(tarjetaProducto).join("") : `<p class="vacio">No hay productos con esos filtros. <button class="link" id="limpiar2">Quitar filtros</button></p>`;
      $("#conteo").textContent = `${l.length} ${l.length === 1 ? "producto" : "productos"}`;
      $("#q-tienda").value = f.q;
      const lim = $("#limpiar2"); if (lim) lim.onclick = limpiar;
    };
    const limpiar = () => { f.tipo = f.edad = f.tema = f.nivel = null; f.q = ""; history.replaceState(null, "", "tienda.html"); pintarFiltros(); pintar(); };
    document.addEventListener("click", e => {
      const b = e.target.closest(".filtro"); if (!b) return;
      f[b.dataset.k] = f[b.dataset.k] == b.dataset.v ? null : b.dataset.v;
      const u = new URLSearchParams(); Object.entries(f).forEach(([k, v]) => v && u.set(k, v));
      history.replaceState(null, "", "tienda.html" + (u.toString() ? "?" + u : ""));
      pintarFiltros(); pintar();
    });
    $("#limpiar").addEventListener("click", limpiar);
    $("#q-tienda").addEventListener("input", e => { f.q = e.target.value; pintar(); });
    pintarFiltros(); pintar();
  },

  /* ---------- PRODUCTO ---------- */
  producto() {
    const p = getProducto(params.get("id")) || PRODUCTOS[0];
    if (p.tipo === "recarga") return paginas.productoRecarga(p);
    const n = p.tipo === "cajon" ? getNivel(p.id) : null;
    const temp = p.tipo === "torre" ? temporadaActiva() : null;
    document.title = `${p.titulo} | Milu & Me`;
    const promoBox = n
      ? `<div class="promo-box"><b>Entre más cajones, más ahorras</b><span>2 cajones −5 % · 3 cajones −8 % · 4 cajones −10 %</span><a href="promociones.html">Ver promociones</a></div>`
      : `<div class="promo-box"><b>${temp ? `🎉 Precio de ${temp.nombre}` : "¿Son hermanos?"}</b><span>${temp ? "Solo por unos días." : `La 2ª torre tiene 10 % menos (2 torres: ${dinero(t2Torres())}).`}</span><a href="promociones.html#familias">Ver promociones</a></div>`;
    const fav = favs.tiene(p.id);
    const fotos = n ? [...(n.fotos || []), ...FOTOS_EMPAQUE] : [];
    const media = n
      ? `<div class="pd-galeria"><div class="pd-media" id="pd-media" style="--bg:${n.color}33">${arteCajon(n, "grande")}</div>
          <div class="pd-miniaturas" role="group" aria-label="Fotos del producto">
            <button type="button" aria-pressed="true" data-foto="" aria-label="Ilustración del cajón"><span class="mini-arte" style="color:${n.color}">▣</span></button>
            ${fotos.map(([src, alt]) => `<button type="button" aria-pressed="false" data-foto="${src}" data-alt="${alt}" aria-label="${alt}"><img src="${src}" alt=""></button>`).join("")}
          </div></div>`
      : `<div class="pd-media foto"><img src="img/producto/torre-completa.jpg" alt="Torre Milu & Me: cinco cajones apilados y el cohete de cinco piezas armado a un lado"></div>`;
    const incluye = n ? [...n.incluye, ...INCLUYE_SIEMPRE] : ["Los 5 cajones completos (niveles 1 al 5)", "Base con peso, tapa (placa superior) y tubo central", "Las 5 piezas del cohete de Milu", "Acceso a los 5 niveles en la app para iPad"];
    $("#producto").innerHTML = `
      <nav class="migas" aria-label="Ruta"><a href="index.html">Inicio</a> › <a href="tienda.html">Tienda</a> › <span>${p.titulo}</span></nav>
      <div class="pd-grid">
        ${media}
        <div class="pd-info">
          ${n ? `<span class="chip-edad" style="--c:${n.color};--t:${n.texto}">${n.edad}+ años · ${n.etapa}</span>` : `<span class="chip-edad ahorro">${temp ? "🎉 " + temp.nombre : "5 cajones"}</span>`}
          <h1>${p.titulo}</h1>
          <p class="pd-tema">${n ? `${TEMAS[n.tema].emoji} Mundo ${TEMAS[n.tema].nombre} · ${n.actividades.length} actividades` : "2 a 6 años · 24 actividades"}</p>
          <p class="pd-precio">${p.precioLista ? `<s>${dinero(p.precioLista)}</s> ` : ""}${dinero(p.precio)}</p>
          <p>${n ? n.resumen : "Los 5 sets juntos en una torre modular. La dificultad sube con la edad y cada cajón desbloquea un nivel nuevo de la app."}</p>
          <div class="pd-comprar">
            <div class="cantidad"><button aria-label="Menos" data-c="-1">−</button><input id="cant" type="number" min="1" value="1" aria-label="Cantidad"><button aria-label="Más" data-c="1">+</button></div>
            <button class="btn btn-primario" id="pd-add">Agregar al carrito</button>
            <button class="btn-fav grande ${fav ? "on" : ""}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favoritos">${iconos.corazon}</button>
          </div>
          ${promoBox}
          <ul class="pd-ventajas"><li>🚚 Envío gratis desde ${dinero(PROMOS.envioGratisDesde)}</li><li>📱 Desbloquea ${n ? "su nivel" : "los 5 niveles"} en la app</li><li>🖨️ Plantillas imprimibles con tu cuenta</li></ul>
          ${n ? `<p class="aviso-seguridad">⚠️ Juega siempre con un adulto. Contiene piezas pequeñas.</p>` : ""}
        </div>
      </div>
      <div class="pd-detalle">
        <section><h2>Qué incluye</h2><ul class="lista-check">${incluye.map(i => `<li>${i}</li>`).join("")}</ul></section>
        ${n ? `<section><h2>Actividades</h2><ol class="lista-acts">${n.actividades.map(a => `<li><b>${a.t}</b><span>${a.d}</span></li>`).join("")}</ol></section>
        ${Object.keys(n.videos).length ? `<section><h2>Mira cómo se juega</h2><div class="pd-videos">${Object.entries(n.videos).map(([i, v]) => `<button class="pd-video" data-video="${v}" data-titulo="${n.actividades[i].t}"><span class="pv-play">▶</span><b>${n.actividades[i].t}</b></button>`).join("")}</div></section>` : ""}
        <section><h2>Habilidades que desarrolla</h2><div class="chips">${n.habilidades.map(h => `<span class="chip">${h}</span>`).join("")}</div></section>`
        : `<section><h2>Niveles incluidos</h2><div class="mini-niveles">${NIVELES.map(x => `<a href="producto.html?id=${x.id}" class="mini-nivel" style="--c:${x.color};--t:${x.texto}"><b>Nivel ${x.nivel}</b>${x.edad} años · ${TEMAS[x.tema].nombre}</a>`).join("")}</div></section>`}
      </div>`;
    $$(".cantidad button").forEach(b => b.onclick = () => { const i = $("#cant"); i.value = Math.max(1, (+i.value || 1) + +b.dataset.c); });
    $("#pd-add").onclick = () => carrito.agregar(p.id, Math.max(1, +$("#cant").value || 1));
    const mins = $(".pd-miniaturas");
    if (mins) mins.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", mins).forEach(x => x.setAttribute("aria-pressed", x === b));
      $("#pd-media").innerHTML = b.dataset.foto ? `<img class="foto-real" src="${b.dataset.foto}" alt="${b.dataset.alt}">` : arteCajon(n, "grande");
    });
    $("#relacionados").innerHTML = PRODUCTOS.filter(x => x.id !== p.id).slice(0, 4).map(tarjetaProducto).join("");
  },

  /* ---------- PRODUCTO: KIT DE RECARGA ---------- */
  productoRecarga(p) {
    const n = nivelDe(p), fav = favs.tiene(p.id);
    document.title = `${p.titulo} | Milu & Me`;
    $("#producto").innerHTML = `
      <nav class="migas" aria-label="Ruta"><a href="index.html">Inicio</a> › <a href="tienda.html?tipo=recarga">Kits de recarga</a> › <span>${p.titulo}</span></nav>
      <div class="pd-grid">
        <div class="pd-media" style="--bg:${n.color}33">${arteCajon(n, "grande recarga")}</div>
        <div class="pd-info">
          <span class="chip-edad chip-recarga">Recarga · Nivel ${n.nivel}</span>
          <h1>${p.titulo}</h1>
          <p class="pd-tema">Para el cajón «${n.nombre}» · ${n.edad} años</p>
          <p class="pd-precio">${dinero(p.precio)}</p>
          <p>¿Se acabó la plastilina o las hojas? Con este kit tu peque vuelve a jugar su nivel completo. Ideal si juegan dos hermanos.</p>
          <div class="pd-comprar">
            <div class="cantidad"><button aria-label="Menos" data-c="-1">−</button><input id="cant" type="number" min="1" value="1" aria-label="Cantidad"><button aria-label="Más" data-c="1">+</button></div>
            <button class="btn btn-primario" id="pd-add">Agregar al carrito</button>
            <button class="btn-fav grande ${fav ? "on" : ""}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favoritos">${iconos.corazon}</button>
          </div>
          <p class="ayuda">No incluye el cajón. Las plantillas también las puedes imprimir gratis desde <a href="actividades.html?nivel=${n.nivel}">Actividades y guías</a>.</p>
        </div>
      </div>
      <div class="pd-detalle"><section><h2>Qué incluye</h2><ul class="lista-check">${RECARGA_INCLUYE[n.nivel].map(i => `<li>${i}</li>`).join("")}</ul></section></div>`;
    $$(".cantidad button").forEach(b => b.onclick = () => { const i = $("#cant"); i.value = Math.max(1, (+i.value || 1) + +b.dataset.c); });
    $("#pd-add").onclick = () => carrito.agregar(p.id, Math.max(1, +$("#cant").value || 1));
    $("#relacionados").innerHTML = [getProducto(n.id), ...PRODUCTOS.filter(x => x.tipo === "recarga" && x.id !== p.id).slice(0, 3)].map(tarjetaProducto).join("");
  },

  /* ---------- PROMOCIONES ---------- */
  promociones() {
    const t = getProducto("torre"), c = PRECIOS[1];
    $("#club-promo").innerHTML = formClub("grande");
    $("#tabla-escalera").innerHTML = [1, 2, 3, 4].map(q => { const pct = q >= 4 ? PROMOS.escalera[4] : (PROMOS.escalera[q] || 0), tot = Math.round(c * q * (1 - pct));
      return `<tr><td>${q} ${q === 1 ? "cajón" : "cajones"}</td><td>${pct ? `−${Math.round(pct * 100)} %` : "—"}</td><td>${dinero(tot)}</td><td>${dinero(Math.round(tot / q))}</td></tr>`; }).join("") +
      `<tr class="destacada"><td>⭐ Torre (5 cajones + base y estructura)</td><td>Mejor precio</td><td>${dinero(PRECIO_TORRE)}</td><td>${dinero(PRECIO_TORRE / 5)}</td></tr>`;
    $("#temporadas").innerHTML = PROMOS.temporadas.map(x => { const [m1, d1] = x.desde.split("-"), [m2, d2] = x.hasta.split("-"), mes = m => ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][+m - 1];
      return `<li><b>${x.nombre}</b><span>${+d1} ${mes(m1)} – ${+d2} ${mes(m2)}</span><span class="tp-mini">Torre a ${dinero(x.precioTorre)}</span></li>`; }).join("");
    $("#dos-torres").textContent = dinero(t2Torres());
    $("#dos-cajones").textContent = dinero(Math.round(c * 2 * (1 - PROMOS.escalera[2])));
  },

  /* ---------- ACTIVIDADES Y GUÍAS ---------- */
  actividades() {
    const u = auth.usuario();
    $("#estado-cuenta").innerHTML = u
      ? `<p>👋 Hola, <b>${u.nombre}</b>. Descarga e imprime las plantillas cuantas veces quieras.</p>`
      : `<p>${iconos.candado} <b>Inicia sesión o crea tu cuenta</b> para descargar los PDF.</p><a class="btn btn-primario" href="cuenta.html?volver=actividades.html">Entrar a mi cuenta</a>`;
    const tabs = $("#tabs-niveles"), cont = $("#lista-actividades");
    tabs.innerHTML = NIVELES.map((n, i) => `<button role="tab" class="tab" id="tab-${n.nivel}" aria-selected="${i === 0}" data-n="${n.nivel}" style="--c:${n.color};--t:${n.texto}">Nivel ${n.nivel}<small>${n.edad} años</small></button>`).join("");
    const pintar = nv => {
      const n = NIVELES[nv - 1];
      $$(".tab", tabs).forEach(t => t.setAttribute("aria-selected", t.dataset.n == nv));
      const btn = (href, txt) => u ? `<a class="btn btn-sec btn-chico" href="${href}" download>${iconos.descarga} ${txt}</a>`
                                   : `<a class="btn btn-sec btn-chico bloqueado" href="cuenta.html?volver=actividades.html">${iconos.candado} ${txt}</a>`;
      cont.setAttribute("aria-labelledby", `tab-${nv}`);
      cont.innerHTML = `
        <div class="act-cabecera" style="--c:${n.color};--t:${n.texto}">
          <div><h2>Nivel ${n.nivel} · ${n.nombre}</h2><p>${TEMAS[n.tema].emoji} ${TEMAS[n.tema].nombre} · ${n.edad} años · ${n.etapa}</p></div>
          <div class="act-botones">${btn(pdfManual(n.nivel), "Manual (PDF)")} ${btn(PDF_STICKERS_MILU, "Stickers Milu (PDF)")}</div>
        </div>
        <div class="act-grid">${n.actividades.map((a, i) => `
          <article class="act-card">
            <span class="act-num" style="--c:${n.color};--t:${n.texto}">${i + 1}</span>
            <h3>${a.t}</h3><p>${a.d}</p>
            <div class="act-botones">${n.videos[i] ? `<button class="btn btn-rosa btn-chico" data-video="${n.videos[i]}" data-titulo="${a.t}">▶ Ver video</button>` : ""}
            ${pdfActividad(n.nivel, i, a.t) ? btn(pdfActividad(n.nivel, i, a.t), "Plantillas PDF") : `<span class="sin-plantilla">Se juega con el material del cajón</span>`}</div>
          </article>`).join("")}</div>`;
    };
    tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) pintar(+t.dataset.n); });
    pintar(+(params.get("nivel") || 1));
  },

  /* ---------- CUENTA ---------- */
  cuenta() {
    const volver = params.get("volver");
    const pintar = () => {
      const u = auth.usuario();
      if (u) {
        $("#cuenta").innerHTML = `
          <h1>Hola, ${u.nombre} 👋</h1>
          <div class="cuenta-grid">
            <a class="cuenta-op" href="actividades.html"><b>🖨️ Mis descargas</b><span>Plantillas y manuales en PDF</span></a>
            <a class="cuenta-op" href="favoritos.html"><b>♥ Mis favoritos</b><span>${u.favoritos.length} guardados</span></a>
            <a class="cuenta-op" href="carrito.html"><b>🛍️ Mi carrito</b><span>${carrito.cuenta()} productos</span></a>
          </div>
          <h2>Mis pedidos</h2>
          ${u.pedidos.length ? `<ul class="pedidos">${u.pedidos.map(p => `<li><b>Pedido ${p.folio}</b> · ${new Date(p.fecha).toLocaleDateString("es-MX")} · ${dinero(p.total)}<br><small>${p.items.map(i => `${i.cant} × ${getProducto(i.id).titulo}`).join(", ")}</small></li>`).join("")}</ul>` : `<p>Aún no tienes pedidos.</p>`}
          <button class="btn btn-sec" id="salir">Cerrar sesión</button>`;
        $("#salir").onclick = () => { auth.salir(); pintarContadores(); pintar(); };
        return;
      }
      $("#cuenta").innerHTML = `
        <div class="auth-grid">
          <form id="f-entrar" class="form-card">
            <h2>Iniciar sesión</h2>
            <label>Correo electrónico<input type="email" name="email" required autocomplete="email"></label>
            <label>Contraseña<input type="password" name="pass" required autocomplete="current-password"></label>
            <p class="error" aria-live="polite"></p>
            <button class="btn btn-primario btn-bloque">Entrar</button>
          </form>
          <form id="f-registro" class="form-card">
            <h2>Crear cuenta</h2>
            <p class="ayuda">La cuenta es del papá, la mamá o el tutor. Con ella guardas favoritos, compras y descargas las plantillas.</p>
            <label>Nombre del adulto<input name="nombre" required autocomplete="name"></label>
            <label>Correo electrónico<input type="email" name="email" required autocomplete="email"></label>
            <label>Contraseña (mínimo 8 caracteres)<input type="password" name="pass" minlength="8" required autocomplete="new-password"></label>
            <label class="check"><input type="checkbox" required> Soy mayor de edad y acepto las <a href="terminos.html">cláusulas de uso</a> y la <a href="privacidad.html">política de privacidad</a>.</label>
            <p class="error" aria-live="polite"></p>
            <button class="btn btn-primario btn-bloque">Crear cuenta</button>
          </form>
        </div>
        <p class="nota-proto">Prototipo: la cuenta se guarda solo en este navegador.</p>`;
      const enviar = (id, fn) => $(id).addEventListener("submit", async e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target));
        try { await fn(d); pintarContadores(); toast("¡Bienvenida, bienvenido!"); if (volver) location.href = volver; else pintar(); }
        catch (err) { $(".error", e.target).textContent = err.message; }
      });
      enviar("#f-entrar", d => auth.entrar(d));
      enviar("#f-registro", d => auth.registrar(d));
    };
    pintar();
  },

  /* ---------- FAVORITOS ---------- */
  favoritos() {
    const pintar = () => {
      const l = favs.lista().map(getProducto).filter(Boolean);
      $("#favs").innerHTML = l.length ? l.map(tarjetaProducto).join("")
        : `<div class="vacio"><p>Aún no tienes favoritos. Toca el ♥ en cualquier cajón para guardarlo aquí.</p><a class="btn btn-primario" href="tienda.html">Ir a la tienda</a></div>`;
      $("#aviso-fav").hidden = !!auth.usuario();
    };
    document.addEventListener("favs-cambio", pintar);
    pintar();
  },

  /* ---------- CARRITO ---------- */
  carrito() {
    let cupon = sessionStorage.getItem("milu_cupon") || "";
    const pintar = () => {
      const it = carrito.items();
      if (!it.length) {
        $("#carrito").innerHTML = `<div class="vacio"><p>Tu carrito está vacío.</p><a class="btn btn-primario" href="tienda.html">Encuentra tu cajón</a></div>`;
        return;
      }
      const q = cotizar(it, cupon), t = getProducto("torre");
      const avisos = [];
      if (q.regalo) avisos.push(`🎁 <b>¡Completas tu torre!</b> Con esta compra tienes los 5 niveles: la base, la estructura y la tapa de la torre van de regalo.`);
      if (q.cajonesQty === 4 && !q.torres) avisos.push(`🚀 <b>¡Por solo ${dinero(t.precio - (q.lista - q.desc - (q.lista - cajonesLista(it))))} más llévate la torre completa con base y estructura!</b> <button class="btn btn-rosa btn-chico" data-a-torre>Cambiar a la torre</button>`);
      else if (q.cajonesQty >= 5 && !q.torres) avisos.push(`🚀 Con 5 cajones te conviene la <b>torre completa</b>: ${dinero(t.precio)} con base y estructura. <button class="btn btn-rosa btn-chico" data-a-torre>Cambiar a la torre</button>`);
      else if (q.cajonesQty >= 1 && q.cajonesQty <= 3) { const sig = q.cajonesQty + 1, pct = sig >= 4 ? PROMOS.escalera[4] : PROMOS.escalera[sig]; avisos.push(`💡 Agrega 1 cajón más y ahorra <b>${Math.round(pct * 100)} %</b> en tus cajones. <a href="tienda.html?tipo=cajon">Ver cajones</a>`); }
      const envioTxt = q.envio ? dinero(q.envio) : "Gratis";
      const barra = q.faltaEnvio > 0 ? `<div class="envio-barra"><span>Te faltan <b>${dinero(q.faltaEnvio)}</b> para el envío gratis</span><i style="width:${Math.min(100, 100 - q.faltaEnvio / PROMOS.envioGratisDesde * 100)}%"></i></div>`
                                     : `<div class="envio-barra ok"><span>🚚 ¡Tienes envío gratis!</span><i style="width:100%"></i></div>`;
      $("#carrito").innerHTML = `
        ${avisos.map(a => `<div class="sugerencia">${a}</div>`).join("")}
        <div class="cart-grid">
          <ul class="cart-lista">${it.map(x => {
            const p = getProducto(x.id), n = nivelDe(p);
            return `<li class="cart-item">
              <div class="ci-media">${n ? arteCajon(n, "mini") : `<img src="img/producto/torre-completa.jpg" alt="">`}</div>
              <div class="ci-info"><a href="producto.html?id=${p.id}"><b>${p.titulo}</b></a><span>${dinero(p.precio)}</span>
                <button class="link" data-quitar="${p.id}">Quitar</button></div>
              <div class="cantidad"><button data-menos="${p.id}" aria-label="Menos">−</button><input value="${x.cant}" readonly aria-label="Cantidad"><button data-mas="${p.id}" aria-label="Más">+</button></div>
              <b class="ci-total">${dinero(p.precio * x.cant)}</b>
            </li>`; }).join("")}
            ${q.regalo ? `<li class="cart-item regalo"><div class="ci-media"><img src="img/marca/cohete-armable.png" alt=""></div><div class="ci-info"><b>Base, estructura y tapa de la torre</b><span>Regalo por completar los 5 niveles</span></div><div></div><b class="ci-total">Gratis</b></li>` : ""}</ul>
          <aside class="resumen">
            <h2>Resumen</h2>
            ${barra}
            <p><span>Subtotal</span><b>${dinero(q.lista)}</b></p>
            ${q.promos.map(d => `<p class="r-desc"><span>${d.txt}</span><b>−${dinero(d.monto)}</b></p>`).join("")}
            <p><span>Envío</span><b>${envioTxt}</b></p>
            <p class="r-total"><span>Total</span><b>${dinero(q.total)}</b></p>
            <small>Precios con IVA incluido.</small>
            <form id="f-cupon" class="f-cupon">
              <label for="cupon">¿Tienes un código?</label>
              <div class="dos-col"><input id="cupon" name="cupon" value="${cupon}" placeholder="BIENVENIDA10" autocomplete="off"><button class="btn btn-sec btn-chico">Aplicar</button></div>
              ${q.cuponNota ? `<p class="${q.usaCupon ? "ok" : "error"}">${q.cuponNota}</p>` : club.suscrito() ? "" : `<p class="ayuda">¿Aún no tienes uno? <a href="promociones.html#club">Únete al Club Milu</a> y recibe 10 % en tu primera compra.</p>`}
            </form>
            <form id="f-pago" class="form-pago">
              <h3>Datos de envío</h3>
              <label>Nombre completo<input name="nombre" required autocomplete="name"></label>
              <label>Dirección<input name="dir" required autocomplete="street-address"></label>
              <div class="dos"><label>C.P.<input name="cp" required inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code"></label>
              <label>Teléfono<input name="tel" required inputmode="tel" autocomplete="tel"></label></div>
              <p class="nota-proto">Pago simulado: en la versión final aquí se conecta la pasarela de pago (tarjeta, OXXO o transferencia).</p>
              <button class="btn btn-primario btn-bloque">Confirmar pedido · ${dinero(q.total)}</button>
            </form>
          </aside>
        </div>`;
    };
    $("#carrito").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-a-torre")) {
        carrito.guardar(carrito.items().filter(x => getProducto(x.id).tipo !== "cajon"));
        carrito.agregar("torre"); pintar(); return;
      }
      const cant = id => carrito.items().find(x => x.id === id).cant;
      if (b.dataset.quitar) carrito.quitar(b.dataset.quitar);
      if (b.dataset.mas) carrito.cambiar(b.dataset.mas, cant(b.dataset.mas) + 1);
      if (b.dataset.menos) carrito.cambiar(b.dataset.menos, cant(b.dataset.menos) - 1);
      if (b.dataset.quitar || b.dataset.mas || b.dataset.menos) pintar();
    });
    $("#carrito").addEventListener("submit", e => {
      e.preventDefault();
      if (e.target.id === "f-cupon") { cupon = $("#cupon").value.trim().toUpperCase(); try { sessionStorage.setItem("milu_cupon", cupon); } catch {} pintar(); return; }
      const q = cotizar(carrito.items(), cupon);
      const folio = "MM-" + Date.now().toString().slice(-6);
      const u = auth.usuario();
      if (q.usaCupon) { club.marcarUsado(); try { sessionStorage.removeItem("milu_cupon"); } catch {} }
      if (u) { u.pedidos.unshift({ folio, fecha: Date.now(), total: q.total, items: carrito.items(), regalo: q.regalo }); auth.guardar(u); }
      carrito.vaciar(); sonido.efecto("aplausos");
      $("#carrito").innerHTML = `<div class="vacio exito"><h2>¡Gracias por tu compra! 🚀</h2><p>Tu pedido <b>${folio}</b> por <b>${dinero(q.total)}</b> quedó registrado.${q.regalo ? " 🎁 Incluye la base, estructura y tapa de tu torre de regalo." : ""} ${u ? "Lo puedes ver en tu cuenta." : "Crea una cuenta para descargar las plantillas de tus cajones."}</p><a class="btn btn-primario" href="actividades.html">Ver actividades y guías</a></div>`;
    });
    pintar();
  }
};

function cajonesLista(items) { return items.reduce((a, x) => { const p = getProducto(x.id); return a + (p && p.tipo === "cajon" ? p.precio * x.cant : 0); }, 0); }
function t2Torres() { const t = getProducto("torre"); return t.precio + Math.round(t.precio * (1 - PROMOS.segundaTorrePct)); }
