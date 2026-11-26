/* =========================================================
   Milu & Me · Milu "shimeji"
   Milu camina por la pantalla, trepa por las orillas, se suelta y cae.
   Lo puedes agarrar y aventar con el mouse o el dedo.
   Doble clic (o doble toque): ¡aparece otro Milu! (máximo 4)
   Botón redondo abajo a la izquierda: mostrar / ocultar.
   ========================================================= */
(() => {
  const SRC = "img/personajes/milu-caminando.webp";
  const MAX = 4, VEL = 48, G = 1500;
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const guardado = (() => { try { return localStorage.getItem("milu_shimeji"); } catch { return null; } })();
  let activo = guardado ? guardado === "on" : !reducir;
  const H = innerWidth < 600 ? 70 : 92, Wm = Math.round(H * 124 / 300);
  const lista = [];

  /* Botón para mostrar / ocultar */
  const btn = document.createElement("button");
  btn.className = "shimeji-btn"; btn.type = "button";
  btn.innerHTML = `<img src="img/personajes/milu-cabeza.png" alt="">`;
  document.body.appendChild(btn);
  const pintarBtn = () => { btn.setAttribute("aria-pressed", activo); btn.setAttribute("aria-label", activo ? "Ocultar a Milu" : "Mostrar a Milu"); btn.title = activo ? "Ocultar a Milu" : "Mostrar a Milu"; btn.classList.toggle("off", !activo); };

  function pop() { if (typeof sonido !== "undefined") sonido.efecto("burbuja"); }

  function crear(x, y) {
    if (lista.length >= MAX) return;
    const el = document.createElement("img");
    el.src = SRC; el.alt = ""; el.className = "shimeji"; el.draggable = false;
    el.style.width = Wm + "px"; el.style.height = H + "px";
    document.body.appendChild(el);
    const m = { el, x: x ?? Math.random() * (innerWidth - Wm), y: y ?? -H, vx: 0, vy: 0, dir: Math.random() < .5 ? -1 : 1,
                estado: "cae", pared: 0, meta: 0, pausa: 0, rot: 0 };
    lista.push(m);
    el.addEventListener("pointerdown", e => agarrar(e, m));
    el.addEventListener("dblclick", () => { crear(m.x + 30, m.y - 40); pop(); });
    let ultimoToque = 0;
    el.addEventListener("pointerup", e => { if (e.pointerType === "touch") { const t = Date.now(); if (t - ultimoToque < 320) { crear(m.x + 30, m.y - 40); pop(); } ultimoToque = t; } });
    return m;
  }

  /* Agarrar y aventar */
  let sujeto = null, ult = null;
  function agarrar(e, m) {
    e.preventDefault(); sujeto = m; m.estado = "agarrado"; m.el.setPointerCapture(e.pointerId);
    ult = { x: e.clientX, y: e.clientY, t: performance.now() };
    m.el.classList.add("agarrado");
  }
  addEventListener("pointermove", e => {
    if (!sujeto) return;
    const now = performance.now(), dt = Math.max(.016, (now - ult.t) / 1000);
    sujeto.vx = (e.clientX - ult.x) / dt; sujeto.vy = (e.clientY - ult.y) / dt;
    sujeto.x = e.clientX - Wm / 2; sujeto.y = e.clientY - 12;
    ult = { x: e.clientX, y: e.clientY, t: now };
  });
  addEventListener("pointerup", () => {
    if (!sujeto) return;
    sujeto.estado = "cae"; sujeto.vx = Math.max(-900, Math.min(900, sujeto.vx * .6)); sujeto.vy = Math.max(-900, Math.min(900, sujeto.vy * .6));
    sujeto.el.classList.remove("agarrado"); sujeto = null;
  });

  /* Comportamiento */
  function paso(m, dt) {
    const piso = innerHeight - H, maxX = innerWidth - Wm;
    switch (m.estado) {
      case "camina":
        if (m.pausa > 0) { m.pausa -= dt; break; }
        m.x += m.dir * VEL * dt;
        if (Math.random() < dt * .08) m.pausa = 1 + Math.random() * 2;          // se detiene a ver
        if (Math.random() < dt * .05) m.dir *= -1;                               // cambia de idea
        if (m.x <= 0 || m.x >= maxX) {
          m.x = Math.max(0, Math.min(maxX, m.x));
          if (Math.random() < .6) { m.estado = "trepa"; m.pared = m.x <= 0 ? -1 : 1; m.meta = innerHeight * (.15 + Math.random() * .5); }
          else m.dir = m.x <= 0 ? 1 : -1;
        }
        break;
      case "trepa":
        m.y -= VEL * .8 * dt;
        if (m.y <= m.meta || Math.random() < dt * .06) { m.estado = "cae"; m.vx = -m.pared * 120; m.vy = -60; }
        break;
      case "cae":
        m.vy += G * dt; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.x < 0) { m.x = 0; m.vx *= -.5; } if (m.x > maxX) { m.x = maxX; m.vx *= -.5; }
        if (m.y >= piso) { m.y = piso; m.vy = 0; m.vx = 0; m.estado = "camina"; m.dir = Math.random() < .5 ? -1 : 1; m.pausa = .4; }
        break;
    }
    if (m.estado !== "trepa" && m.estado !== "agarrado" && m.y > piso) m.y = piso;
  }
  function pintar(m, t) {
    let tr = `translate(${m.x}px, ${m.y}px)`;
    if (m.estado === "trepa") {
      // pies contra la pared, mirando hacia arriba (la imagen original mira a la izquierda)
      tr += m.pared > 0 ? ` translateX(${Wm * .35}px) rotate(-90deg) scaleX(-1)` : ` translateX(${-Wm * .35}px) rotate(90deg)`;
    } else if (m.estado === "agarrado") {
      tr += ` rotate(${Math.max(-35, Math.min(35, -m.vx / 25 + Math.sin(t / 180) * 6))}deg)`;
    } else if (m.estado === "cae") {
      tr += ` rotate(${Math.max(-25, Math.min(25, m.vx / 30))}deg)`;
    } else {
      tr += m.dir > 0 ? " scaleX(-1)" : "";
    }
    m.el.style.transform = tr;
    m.el.classList.toggle("quieto", m.estado === "camina" && m.pausa > 0);
  }

  /* De vez en cuando aparece otro Milu (máximo 2 solos; con doble clic hasta 4) */
  let reloj = 0;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
    if (activo) {
      lista.forEach(m => { paso(m, dt); pintar(m, now); });
      reloj += dt;
      if (reloj > 45 && lista.length < 2) { reloj = 0; if (Math.random() < .5) { crear(); pop(); } }
    }
    requestAnimationFrame(frame);
  }

  function aplicar() {
    pintarBtn();
    if (activo && !lista.length) crear(innerWidth * .15, -H);
    lista.forEach(m => m.el.hidden = !activo);
  }
  btn.addEventListener("click", () => { activo = !activo; try { localStorage.setItem("milu_shimeji", activo ? "on" : "off"); } catch {} aplicar(); });
  addEventListener("resize", () => lista.forEach(m => { m.x = Math.min(m.x, innerWidth - Wm); if (m.estado === "camina") m.y = innerHeight - H; }));
  aplicar();
  requestAnimationFrame(frame);
})();
