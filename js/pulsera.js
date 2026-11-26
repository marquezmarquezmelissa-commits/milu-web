/* =========================================================
   Milu & Me · Pulsera de cuentas con física + Milu caminando
   Hilo negro con cuentas de letras "MILU AND ME" (como las del kit).
   Se puede jalar con el mouse o el dedo.
   ========================================================= */
(() => {
  const banda = document.getElementById("pulsera");
  if (!banda) return;
  const cv = banda.querySelector("canvas"), ctx = cv.getContext("2d");
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Colores de las cuentas (paleta de marca + tonos de las cuentas reales) */
  const C = { rosa: "#EC76AD", rosaClaro: "#F7B9D3", lila: "#B9A5E8", cielo: "#7CC6E6", amarillo: "#F9DB54", crema: "#FFF8E8", coral: "#CE4D3E", pizarra: "#4D5A71" };
  const LETRAS = [C.lila, C.rosa, C.cielo, C.amarillo, C.rosaClaro];
  const PONY = [C.rosa, C.cielo, C.lila, C.amarillo, C.rosaClaro];

  /* ---------- Cuentas ---------- */
  let S = 1; // tamaño de las cuentas (más chicas en celular)
  const cuenta = {
    letra: (l, i) => ({ t: "letra", l, w: 44 * S, h: 48 * S, c: LETRAS[i % LETRAS.length] }),
    pony: i => ({ t: "pony", w: 26 * S, h: 36 * S, c: PONY[i % PONY.length] }),
    estrella: () => ({ t: "estrella", w: 40 * S, h: 40 * S, c: C.amarillo }),
    bola: i => ({ t: "bola", w: 30 * S, h: 30 * S, c: [C.cielo, C.rosa, C.lila][i % 3] })
  };
  function armarSarta(largo) {
    const palabra = (txt, k) => [...txt].map((l, i) => cuenta.letra(l, i + k));
    const centro = [cuenta.estrella(), cuenta.pony(0), ...palabra("MILU", 0), cuenta.pony(1), cuenta.bola(0), cuenta.pony(2),
      ...palabra("AND", 2), cuenta.pony(3), cuenta.bola(1), cuenta.pony(4), ...palabra("ME", 1), cuenta.pony(0), cuenta.estrella()];
    const ancho = arr => arr.reduce((a, b) => a + b.w, 0);
    let izq = [], der = [], i = 0;
    while (ancho(izq) + ancho(der) + ancho(centro) < largo) {
      const b = i % 5 === 4 ? cuenta.bola(i) : cuenta.pony(i);
      (i % 2 ? der : izq).push(b); i++;
    }
    return [...izq.reverse(), ...centro, ...der];
  }

  /* ---------- Física (Verlet) ---------- */
  let W, H, pts = [], beads = [], arrastre = null, puntero = null, t0 = performance.now();
  const G = 1400, DAMP = 0.985, ITER = 14;
  function montar() {
    const r = banda.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.max(.62, Math.min(1, W / 760));
    const yA = 30, span = W + 60, sag = Math.min(85, H - 70) * (S < 1 ? .8 : 1);
    const largo = span + (8 * sag * sag) / (3 * span); // largo de una cuerda que cuelga ~sag px
    beads = armarSarta(largo - 30);
    const x0 = -30;
    pts = [{ x: x0, y: yA, px: x0, py: yA, fijo: true }];
    let x = x0;
    const tot = beads.reduce((a, b) => a + b.w, 0), esc = span / tot;
    beads.forEach(b => { x += (b.w / 2) * esc; const y = yA + Math.sin(((x - x0) / span) * Math.PI) * sag; pts.push({ x, y, px: x, py: y, b }); x += (b.w / 2) * esc; });
    pts.push({ x: W + 30, y: yA, px: W + 30, py: yA, fijo: true });
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1].b ? pts[i - 1].b.w / 2 : 0, b = pts[i].b ? pts[i].b.w / 2 : 0;
      pts[i].d = a + b;
    }
    // ajusta para que el largo total sea exactamente "largo"
    const suma = pts.slice(1).reduce((s, p) => s + p.d, 0), k = largo / suma;
    pts.slice(1).forEach(p => p.d *= k);
  }
  function paso(dt) {
    for (const p of pts) {
      if (p.fijo || p === arrastre) continue;
      const vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + G * dt * dt;
    }
    if (arrastre && puntero) { arrastre.px = arrastre.x; arrastre.py = arrastre.y; arrastre.x += (puntero.x - arrastre.x) * .6; arrastre.y += (puntero.y - arrastre.y) * .6; }
    for (let k = 0; k < ITER; k++) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || .001, dif = (dist - b.d) / dist;
        const fa = a.fijo || a === arrastre ? 0 : (b.fijo || b === arrastre ? 1 : .5), fb = b.fijo || b === arrastre ? 0 : (a.fijo || a === arrastre ? 1 : .5);
        a.x += dx * dif * fa; a.y += dy * dif * fa; b.x -= dx * dif * fb; b.y -= dy * dif * fb;
      }
      for (const p of pts) if (!p.fijo) { p.y = Math.min(p.y, H - 30); p.y = Math.max(p.y, 8); }
    }
  }

  /* ---------- Dibujo ---------- */
  function sombra(color, amt) { // aclara (+) u oscurece (−) un hex
    const n = parseInt(color.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function estrella(r1, r2) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }
  function dibujarCuenta(b) {
    const { w, h, c } = b;
    ctx.shadowColor = "rgba(77,90,113,.25)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 4;
    if (b.t === "letra") {
      const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, sombra(c, .25)); g.addColorStop(1, sombra(c, -.12));
      rr(-w / 2, -h / 2, w, h, 12); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = "transparent";
      ctx.font = `900 ${h * .66}px "Arial Rounded MT Bold","Helvetica Neue",Arial,sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = sombra(c, .7); ctx.fillText(b.l, 0, 3.5);
      ctx.fillStyle = sombra(c, -.42); ctx.fillText(b.l, 0, 2);
      ctx.fillStyle = "rgba(255,255,255,.55)"; rr(-w / 2 + 6, -h / 2 + 4, w - 18, 6, 3); ctx.fill();
    } else if (b.t === "pony") {
      const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, sombra(c, -.15)); g.addColorStop(.45, sombra(c, .3)); g.addColorStop(1, sombra(c, -.2));
      rr(-w / 2, -h / 2, w, h, w / 2.2); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(-w * .12, -h * .26, w * .16, h * .09, -.5, 0, Math.PI * 2); ctx.fill();
    } else if (b.t === "bola") {
      const g = ctx.createRadialGradient(-w * .18, -h * .2, 2, 0, 0, w / 2); g.addColorStop(0, sombra(c, .6)); g.addColorStop(1, sombra(c, -.1));
      ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = "transparent";
    } else {
      ctx.lineJoin = "round"; estrella(w / 2, w / 4.2); ctx.fillStyle = C.amarillo; ctx.strokeStyle = C.amarillo; ctx.lineWidth = 5 * S; ctx.fill(); ctx.stroke();
      ctx.shadowColor = "transparent"; estrella(w / 3.6, w / 7.5); ctx.fillStyle = C.lila; ctx.fill();
    }
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  }
  function dibujar() {
    ctx.clearRect(0, 0, W, H);
    // hilo negro
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2; ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my); }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = "#1d1d1f"; ctx.lineWidth = 2.2; ctx.stroke();
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i], a = pts[i - 1], b = pts[i + 1];
      let ang = Math.atan2(b.y - a.y, b.x - a.x);
      if (p.b.t === "letra") ang *= .55; // las letras se mantienen casi derechas para leerse
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang); dibujarCuenta(p.b); ctx.restore();
    }
  }

  /* ---------- Sonido muy suave ---------- */
  let ac;
  function tic(f = 900) {
    if (typeof sonido !== "undefined" && !sonido.efectosOn()) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.035, ac.currentTime + .005); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + .09);
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .1);
    } catch {}
  }

  /* ---------- Interacción ---------- */
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const cercana = (p, max) => { let best = null, bd = max; for (const q of pts) if (!q.fijo) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } } return best; };
  cv.addEventListener("pointerdown", e => {
    const p = pos(e), q = cercana(p, 50); if (!q) return;
    e.preventDefault(); arrastre = q; puntero = p; cv.setPointerCapture(e.pointerId); banda.classList.add("jalando"); tic(1100);
    banda.querySelector(".pulsera-pista")?.classList.add("oculta");
  });
  cv.addEventListener("pointermove", e => {
    const p = pos(e);
    if (arrastre) { puntero = p; return; }
    // al pasar el mouse cerca, las cuentas se mueven un poquito
    for (const q of pts) if (!q.fijo) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < 40) { q.px -= (e.movementX || 0) * .25; q.py -= (e.movementY || 0) * .25; } }
    cv.style.cursor = cercana(p, 46) ? "grab" : "default";
  });
  const soltar = () => { if (arrastre) { tic(700); } arrastre = null; puntero = null; banda.classList.remove("jalando"); };
  cv.addEventListener("pointerup", soltar); cv.addEventListener("pointercancel", soltar);

  /* ---------- Milu caminando ---------- */
  const milu = banda.querySelector(".milu-camina");
  let mx = -120, dir = 1;
  function moverMilu(dt) {
    if (!milu) return;
    const w = milu.offsetWidth || 70;
    mx += dir * 55 * dt;
    if (mx > W + 10) { dir = -1; } if (mx < -w - 10) { dir = 1; }
    milu.style.transform = `translateX(${mx}px) scaleX(${dir > 0 ? -1 : 1})`; // la imagen mira a la izquierda
  }

  /* ---------- Bucle ---------- */
  montar();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
    if (!reducir) { paso(dt); moverMilu(dt); } else if (now - t0 < 2000) paso(dt);
    dibujar(); requestAnimationFrame(frame);
  }
  if (reducir && milu) milu.style.transform = "translateX(40px)";
  requestAnimationFrame(frame);
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(montar, 150); });
})();
