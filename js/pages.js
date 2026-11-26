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
    const f = { edad: params.get("edad"), tema: params.get("tema"), nivel: params.get("nivel"), q: params.get("q") || "" };
    const grupo = (id, items, key) => {
      $(id).innerHTML = items.map(([v, l]) => `<button class="filtro ${f[key] == v ? "on" : ""}" data-k="${key}" data-v="${v}" aria-pressed="${f[key] == v}">${l}</button>`).join("");
    };
    const pintarFiltros = () => {
      grupo("#f-edad", NIVELES.map(n => [n.edad, `${n.edad} años`]), "edad");
      grupo("#f-tema", Object.entries(TEMAS).map(([k, t]) => [k, `${t.emoji} ${t.nombre}`]), "tema");
      grupo("#f-nivel", NIVELES.map(n => [n.nivel, `Nivel ${n.nivel}`]), "nivel");
    };
    const pintar = () => {
      const q = f.q.toLowerCase();
      let l = PRODUCTOS.filter(p => {
        if (p.tipo === "torre") return !f.edad && !f.tema && !f.nivel;
        const n = getNivel(p.id);
        if (f.edad && n.edad != f.edad) return false;
        if (f.tema && n.tema !== f.tema) return false;
        if (f.nivel && n.nivel != f.nivel) return false;
        if (q && !(p.titulo + " " + TEMAS[n.tema].nombre + " " + n.actividades.map(a => a.t).join(" ")).toLowerCase().includes(q)) return false;
        return true;
      });
      if (q) l = l.filter(p => p.tipo !== "torre" || "torre completa".includes(q));
      $("#resultados").innerHTML = l.length ? l.map(tarjetaProducto).join("") : `<p class="vacio">No hay cajones con esos filtros. <button class="link" id="limpiar2">Quitar filtros</button></p>`;
      $("#conteo").textContent = `${l.length} ${l.length === 1 ? "producto" : "productos"}`;
      $("#q-tienda").value = f.q;
      const lim = $("#limpiar2"); if (lim) lim.onclick = limpiar;
    };
    const limpiar = () => { f.edad = f.tema = f.nivel = null; f.q = ""; history.replaceState(null, "", "tienda.html"); pintarFiltros(); pintar(); };
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
    const n = p.tipo === "cajon" ? getNivel(p.id) : null;
    document.title = `${p.titulo} | Milu & Me`;
    const fav = favs.tiene(p.id);
    const media = n
      ? `<div class="pd-media" style="--bg:${n.color}33">${arteCajon(n, "grande")}</div>`
      : `<div class="pd-media foto"><img src="img/producto/torre.jpg" alt="Torre Milu & Me con los 5 cajones apilados en rosa, amarillo, azul, crema y azul pizarra"></div>`;
    const incluye = n ? [...n.incluye, ...INCLUYE_SIEMPRE] : ["Los 5 cajones completos (niveles 1 al 5)", "Base con peso, placa superior y tubo central", "Las 5 piezas del cohete de Milu", "Acceso a los 5 niveles en la app para iPad"];
    $("#producto").innerHTML = `
      <nav class="migas" aria-label="Ruta"><a href="index.html">Inicio</a> › <a href="tienda.html">Tienda</a> › <span>${p.titulo}</span></nav>
      <div class="pd-grid">
        ${media}
        <div class="pd-info">
          ${n ? `<span class="chip-edad" style="--c:${n.color};--t:${n.texto}">${n.edad}+ años · ${n.etapa}</span>` : `<span class="chip-edad ahorro">5 cajones</span>`}
          <h1>${p.titulo}</h1>
          <p class="pd-tema">${n ? `${TEMAS[n.tema].emoji} Mundo ${TEMAS[n.tema].nombre} · ${n.actividades.length} actividades` : "2 a 6 años · 24 actividades"}</p>
          <p class="pd-precio">${p.precioLista ? `<s>${dinero(p.precioLista)}</s> ` : ""}${dinero(p.precio)}</p>
          <p>${n ? n.resumen : "Los 5 sets juntos en una torre modular. La dificultad sube con la edad y cada cajón desbloquea un nivel nuevo de la app."}</p>
          <div class="pd-comprar">
            <div class="cantidad"><button aria-label="Menos" data-c="-1">−</button><input id="cant" type="number" min="1" value="1" aria-label="Cantidad"><button aria-label="Más" data-c="1">+</button></div>
            <button class="btn btn-primario" id="pd-add">Agregar al carrito</button>
            <button class="btn-fav grande ${fav ? "on" : ""}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favoritos">${iconos.corazon}</button>
          </div>
          <ul class="pd-ventajas"><li>🚚 Envío a todo México</li><li>📱 Desbloquea ${n ? "su nivel" : "los 5 niveles"} en la app</li><li>🖨️ Plantillas imprimibles con tu cuenta</li></ul>
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
    $("#relacionados").innerHTML = PRODUCTOS.filter(x => x.id !== p.id).slice(0, 4).map(tarjetaProducto).join("");
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
          ${btn(pdfManual(n.nivel), "Manual completo (PDF)")}
        </div>
        <div class="act-grid">${n.actividades.map((a, i) => `
          <article class="act-card">
            <span class="act-num" style="--c:${n.color};--t:${n.texto}">${i + 1}</span>
            <h3>${a.t}</h3><p>${a.d}</p>
            <div class="act-botones">${n.videos[i] ? `<button class="btn btn-rosa btn-chico" data-video="${n.videos[i]}" data-titulo="${a.t}">▶ Ver video</button>` : ""}
            ${btn(pdfActividad(n.nivel, i, a.t), "Plantillas PDF")}</div>
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
    const pintar = () => {
      const it = carrito.items();
      if (!it.length) {
        $("#carrito").innerHTML = `<div class="vacio"><p>Tu carrito está vacío.</p><a class="btn btn-primario" href="tienda.html">Encuentra tu cajón</a></div>`;
        return;
      }
      // Sugerencia: si tiene los 5 cajones sueltos, conviene la torre
      const sueltos = NIVELES.filter(n => it.some(x => x.id === n.id)).length;
      const t = getProducto("torre");
      const sugerencia = sueltos >= 3 && !it.some(x => x.id === "torre")
        ? `<div class="sugerencia">💡 Llevas ${sueltos} cajones. Con la <b>torre completa</b> tienes los 5 niveles en una torre modular por ${dinero(t.precio)}. <a href="producto.html?id=torre">Ver torre</a></div>` : "";
      $("#carrito").innerHTML = `
        ${sugerencia}
        <div class="cart-grid">
          <ul class="cart-lista">${it.map(x => {
            const p = getProducto(x.id), n = getNivel(x.id);
            return `<li class="cart-item">
              <div class="ci-media">${n ? arteCajon(n, "mini") : `<img src="img/producto/torre.jpg" alt="">`}</div>
              <div class="ci-info"><a href="producto.html?id=${p.id}"><b>${p.titulo}</b></a><span>${dinero(p.precio)}</span>
                <button class="link" data-quitar="${p.id}">Quitar</button></div>
              <div class="cantidad"><button data-menos="${p.id}" aria-label="Menos">−</button><input value="${x.cant}" readonly aria-label="Cantidad"><button data-mas="${p.id}" aria-label="Más">+</button></div>
              <b class="ci-total">${dinero(p.precio * x.cant)}</b>
            </li>`; }).join("")}</ul>
          <aside class="resumen">
            <h2>Resumen</h2>
            <p><span>Subtotal</span><b>${dinero(carrito.total())}</b></p>
            <p><span>Envío</span><b>Se calcula al confirmar</b></p>
            <p class="r-total"><span>Total</span><b>${dinero(carrito.total())}</b></p>
            <small>Precios con IVA incluido.</small>
            <form id="f-pago" class="form-pago">
              <h3>Datos de envío</h3>
              <label>Nombre completo<input name="nombre" required autocomplete="name"></label>
              <label>Dirección<input name="dir" required autocomplete="street-address"></label>
              <div class="dos"><label>C.P.<input name="cp" required inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code"></label>
              <label>Teléfono<input name="tel" required inputmode="tel" autocomplete="tel"></label></div>
              <p class="nota-proto">Pago simulado: en la versión final aquí se conecta la pasarela de pago (tarjeta, OXXO o transferencia).</p>
              <button class="btn btn-primario btn-bloque">Confirmar pedido</button>
            </form>
          </aside>
        </div>`;
    };
    $("#carrito").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const cant = id => carrito.items().find(x => x.id === id).cant;
      if (b.dataset.quitar) carrito.quitar(b.dataset.quitar);
      if (b.dataset.mas) carrito.cambiar(b.dataset.mas, cant(b.dataset.mas) + 1);
      if (b.dataset.menos) carrito.cambiar(b.dataset.menos, cant(b.dataset.menos) - 1);
      if (b.dataset.quitar || b.dataset.mas || b.dataset.menos) pintar();
    });
    $("#carrito").addEventListener("submit", e => {
      e.preventDefault();
      const folio = "MM-" + Date.now().toString().slice(-6);
      const u = auth.usuario();
      if (u) { u.pedidos.unshift({ folio, fecha: Date.now(), total: carrito.total(), items: carrito.items() }); auth.guardar(u); }
      carrito.vaciar(); sonido.efecto("aplausos");
      $("#carrito").innerHTML = `<div class="vacio exito"><h2>¡Gracias por tu compra! 🚀</h2><p>Tu pedido <b>${folio}</b> quedó registrado. ${u ? "Lo puedes ver en tu cuenta." : "Crea una cuenta para descargar las plantillas de tus cajones."}</p><a class="btn btn-primario" href="actividades.html">Ver actividades y guías</a></div>`;
    });
    pintar();
  }
};
