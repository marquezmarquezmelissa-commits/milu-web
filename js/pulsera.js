/* =========================================================
   Milu & Me · Pulsera de cuentas con física
   Hilo negro con cuentas en forma de letra: "MILU & ME" (como las del kit).
   Se puede jalar con el mouse o el dedo; las cuentas chocan y suenan muy bajito.
   ========================================================= */
(() => {
  const banda = document.getElementById("pulsera");
  if (!banda) return;
  const cv = banda.querySelector("canvas"), ctx = cv.getContext("2d");
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(2, devicePixelRatio || 1);

  /* ---------- Colores (paleta de marca + tonos de las cuentas reales) ---------- */
  const C = { rosa: "#EC76AD", rosaClaro: "#F7B9D3", lila: "#B9A5E8", cielo: "#7CC6E6", azul: "#3FA9DE", amarillo: "#F9DB54", crema: "#FFF8E8" };
  const LETRAS = [C.lila, C.rosa, C.cielo, C.amarillo, C.rosaClaro];
  const PONY = [C.rosa, C.lila, C.amarillo, C.rosaClaro, C.cielo];
  const FUENTE = `"Arial Rounded MT Bold","Nunito","Varela Round","Arial Black","Helvetica Neue",Arial,sans-serif`;

  const tono = (hex, amt) => { // aclara (+) u oscurece (−)
    const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  };

  /* ---------- Sprites 3D de cada cuenta (se dibujan una sola vez) ---------- */
  function lienzo(w, h) { const c = document.createElement("canvas"); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR); const x = c.getContext("2d"); x.scale(DPR, DPR); return [c, x]; }
  function brillo(x, w, h, alpha = .6) { // reflejo superior, solo sobre lo ya dibujado
    x.globalCompositeOperation = "source-atop";
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(255,255,255,${alpha})`); g.addColorStop(.38, "rgba(255,255,255,.08)"); g.addColorStop(1, "rgba(0,0,0,.12)");
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.globalCompositeOperation = "source-over";
  }
  function spriteLetra(l, c, alto) {
    const fs = alto, prof = Math.round(alto * .1), grosor = alto * .2;
    const [m] = lienzo(10, 10), mx = m.getContext("2d"); mx.font = `900 ${fs}px ${FUENTE}`;
    const ancho = mx.measureText(l).width + grosor + 6, h = alto * 1.05 + grosor + prof;
    const [cv2, x] = lienzo(ancho, h), cx = ancho / 2, cy = (h - prof) / 2;
    x.font = `900 ${fs}px ${FUENTE}`; x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round"; x.lineWidth = grosor;
    const glifo = (dy, color) => { x.fillStyle = x.strokeStyle = color; x.strokeText(l, cx, cy + dy); x.fillText(l, cx, cy + dy); };
    for (let k = prof; k > 0; k--) glifo(k, tono(c, -.32 + k * .015));      // volumen (extrusión)
    // cara frontal en una capa aparte para darle brillo
    const [cf, fx] = lienzo(ancho, h);
    fx.font = x.font; fx.textAlign = "center"; fx.textBaseline = "middle"; fx.lineJoin = "round"; fx.lineWidth = grosor;
    const g = fx.createLinearGradient(0, cy - fs / 2, 0, cy + fs / 2); g.addColorStop(0, tono(c, .35)); g.addColorStop(1, tono(c, -.06));
    fx.fillStyle = fx.strokeStyle = g; fx.strokeText(l, cx, cy); fx.fillText(l, cx, cy);
    brillo(fx, ancho, h, .55);
    // borde suave interior
    fx.globalCompositeOperation = "source-atop"; fx.lineWidth = 2; fx.strokeStyle = "rgba(255,255,255,.16)"; fx.strokeText(l, cx - 1, cy - 1.5); fx.globalCompositeOperation = "source-over";
    x.drawImage(cf, 0, 0, ancho, h);
    return { img: cv2, w: ancho, h, rad: Math.min(ancho, alto) * .5 };
  }
  function spritePony(c, w, h) {
    const [cv2, x] = lienzo(w, h + 4);
    const g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, tono(c, -.3)); g.addColorStop(.32, tono(c, .25)); g.addColorStop(.55, c); g.addColorStop(1, tono(c, -.35));
    x.beginPath(); x.roundRect(1, 2, w - 2, h, w * .45); x.fillStyle = g; x.fill();
    brillo(x, w, h + 4, .5);
    x.fillStyle = "rgba(255,255,255,.75)"; x.beginPath(); x.ellipse(w * .32, h * .25, w * .09, h * .14, -.2, 0, 7); x.fill();
    x.fillStyle = tono(c, -.4); x.globalAlpha = .35; x.fillRect(1, h * .5, w - 2, 1.5); x.globalAlpha = 1; // aro del orificio
    return { img: cv2, w, h: h + 4, rad: w * .5 };
  }
  function spriteBola(c, d, rayas) {
    const [cv2, x] = lienzo(d, d), r = d / 2;
    const g = x.createRadialGradient(r * .7, r * .6, 1, r, r, r); g.addColorStop(0, tono(c, .45)); g.addColorStop(.7, c); g.addColorStop(1, tono(c, -.35));
    x.beginPath(); x.arc(r, r, r - .5, 0, 7); x.fillStyle = g; x.fill();
    if (rayas) { // franjas blancas curvas, como las cuentas azules del kit
      x.save(); x.beginPath(); x.arc(r, r, r - .5, 0, 7); x.clip();
      x.strokeStyle = "rgba(255,255,255,.95)"; x.lineWidth = d * .13;
      for (const k of [-.55, 0, .55]) { x.beginPath(); x.ellipse(r + k * r * 1.1, r, r * .28, r * 1.05, 0, 0, 7); x.stroke(); }
      x.restore();
      const s = x.createRadialGradient(r, r, r * .4, r, r, r); s.addColorStop(0, "rgba(0,0,0,0)"); s.addColorStop(1, "rgba(0,40,80,.35)");
      x.beginPath(); x.arc(r, r, r - .5, 0, 7); x.fillStyle = s; x.fill();
    }
    x.fillStyle = "rgba(255,255,255,.85)"; x.beginPath(); x.ellipse(r * .65, r * .55, r * .2, r * .13, -.6, 0, 7); x.fill();
    return { img: cv2, w: d, h: d, rad: r };
  }
  function spriteEstrella(d) {
    const prof = Math.round(d * .08), [cv2, x] = lienzo(d + 6, d + 6 + prof), r = d / 2, cx = r + 3, cy = r + 3;
    const forma = (dy, r1, r2) => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r2 : r1; x.lineTo(cx + Math.cos(a) * rr, cy + dy + Math.sin(a) * rr); } x.closePath(); };
    x.lineJoin = "round"; x.lineWidth = d * .16;
    for (let k = prof; k > 0; k--) { forma(k, r * .8, r * .38); x.fillStyle = x.strokeStyle = tono(C.amarillo, -.28); x.fill(); x.stroke(); }
    forma(0, r * .8, r * .38); const g = x.createLinearGradient(0, 0, 0, d); g.addColorStop(0, tono(C.amarillo, .4)); g.addColorStop(1, C.amarillo); x.fillStyle = x.strokeStyle = g; x.fill(); x.stroke();
    forma(0, r * .42, r * .2); x.lineWidth = d * .08; x.fillStyle = x.strokeStyle = C.lila; x.fill(); x.stroke();
    return { img: cv2, w: d + 6, h: d + 6 + prof, rad: r * .9 };
  }

  /* ---------- Armar la pulsera ---------- */
  let S = 1, GAP = 12;
  const cache = new Map();
  const spr = (key, fn) => cache.has(key) ? cache.get(key) : (cache.set(key, fn()), cache.get(key));
  const B = {
    letra: (l, i) => spr(`l${l}${i}${S}`, () => spriteLetra(l, LETRAS[i % LETRAS.length], 62 * S)),
    pony: i => spr(`p${i % PONY.length}${S}`, () => spritePony(PONY[i % PONY.length], 30 * S, 40 * S)),
    rayada: () => spr(`r${S}`, () => spriteBola(C.azul, 38 * S, true)),
    bola: i => spr(`b${i % 3}${S}`, () => spriteBola([C.cielo, C.rosa, C.lila][i % 3], 34 * S, false)),
    estrella: () => spr(`e${S}`, () => spriteEstrella(46 * S))
  };
  function armarSarta(largo) {
    const pal = (txt, k) => [...txt].map((l, i) => B.letra(l, i + k));
    const centro = [B.estrella(), B.pony(0), B.rayada(), B.pony(1), ...pal("MILU", 0), B.pony(2), B.rayada(), B.pony(3),
      B.letra("&", 3), B.pony(4), B.rayada(), B.pony(0), ...pal("ME", 1), B.pony(1), B.rayada(), B.pony(2), B.estrella()];
    const ancho = arr => arr.reduce((a, b) => a + b.w + GAP, 0);
    const patron = i => [B.pony(i), B.rayada(), B.pony(i + 2), B.bola(i), B.pony(i + 1), B.estrella()][i % 6];
    let izq = [], der = [], i = 0;
    while (ancho(izq) + ancho(der) + ancho(centro) < largo) { (i % 2 ? der : izq).push(patron(Math.floor(i / 2))); i++; }
    return [...izq.reverse(), ...centro, ...der];
  }

  /* ---------- Física (Verlet + choques entre cuentas) ---------- */
  let W, H, pts = [], arrastre = null, puntero = null;
  const Gr = 1500, DAMP = .988, ITER = 12;
  function montar() {
    const r = banda.getBoundingClientRect();
    W = r.width; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const nuevoS = Math.max(.6, Math.min(1, W / 900));
    if (nuevoS !== S) { S = nuevoS; cache.clear(); }
    GAP = 12 * S;
    const yA = 26, span = W + 60, sag = Math.min(80, H - 90);
    const largo = span + (8 * sag * sag) / (3 * span);
    const beads = armarSarta(largo - 20);
    const x0 = -30;
    pts = [{ x: x0, y: yA, px: x0, py: yA, fijo: true }];
    const tot = beads.reduce((a, b) => a + b.w + GAP, 0), esc = span / tot;
    let x = x0;
    beads.forEach(b => { x += ((b.w + GAP) / 2) * esc; const y = yA + Math.sin(((x - x0) / span) * Math.PI) * sag; pts.push({ x, y, px: x, py: y, b }); x += ((b.w + GAP) / 2) * esc; });
    pts.push({ x: W + 30, y: yA, px: W + 30, py: yA, fijo: true });
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1].b ? pts[i - 1].b.w / 2 : 0, b = pts[i].b ? pts[i].b.w / 2 : 0;
      pts[i].d = a + b + GAP;
    }
    const suma = pts.slice(1).reduce((s, p) => s + p.d, 0), k = largo / suma;
    pts.slice(1).forEach(p => p.d *= k);
  }
  let golpe = 0;
  function paso(dt) {
    for (const p of pts) {
      if (p.fijo || p === arrastre) continue;
      const vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + Gr * dt * dt;
    }
    if (arrastre && puntero) { arrastre.px = arrastre.x; arrastre.py = arrastre.y; arrastre.x += (puntero.x - arrastre.x) * .6; arrastre.y += (puntero.y - arrastre.y) * .6; }
    golpe = 0;
    for (let k = 0; k < ITER; k++) {
      // hilo: distancia máxima entre cuentas vecinas (puede quedar flojo)
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || .001;
        if (dist <= b.d && !(a.fijo || b.fijo)) continue;
        const dif = (dist - b.d) / dist;
        const fa = a.fijo || a === arrastre ? 0 : (b.fijo || b === arrastre ? 1 : .5), fb = b.fijo || b === arrastre ? 0 : (a.fijo || a === arrastre ? 1 : .5);
        a.x += dx * dif * fa; a.y += dy * dif * fa; b.x -= dx * dif * fb; b.y -= dy * dif * fb;
      }
      // choques entre cuentas
      for (let i = 1; i < pts.length - 1; i++) for (let j = i + 1; j < pts.length - 1; j++) {
        const a = pts[i], b = pts[j], min = (a.b.rad + b.b.rad) * .92, dx = b.x - a.x, dy = b.y - a.y;
        if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
        const dist = Math.hypot(dx, dy) || .001; if (dist >= min) continue;
        if (k === 0) { const rv = Math.hypot((b.x - b.px) - (a.x - a.px), (b.y - b.py) - (a.y - a.py)) / dt; golpe = Math.max(golpe, rv); }
        const push = (min - dist) / dist * .5, fa = a === arrastre ? 0 : 1, fb = b === arrastre ? 0 : 1;
        a.x -= dx * push * fa; a.y -= dy * push * fa; b.x += dx * push * fb; b.y += dy * push * fb;
      }
      for (const p of pts) if (!p.fijo) { p.y = Math.max(6, Math.min(p.y, H - 22)); }
    }
    if (golpe > 140) choque(golpe);
  }

  /* ---------- Dibujo ---------- */
  function dibujar() {
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2; ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my); }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = "#1d1d1f"; ctx.lineWidth = 2.4; ctx.stroke();
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i], a = pts[i - 1], b = pts[i + 1], s = p.b;
      let ang = Math.atan2(b.y - a.y, b.x - a.x);
      if (s.img && s.h > 50 * S) ang *= .4; // las letras se mantienen casi derechas para leerse
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang);
      ctx.shadowColor = "rgba(77,90,113,.28)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 6;
      ctx.drawImage(s.img, -s.w / 2, -s.h / 2, s.w, s.h);
      ctx.restore();
    }
  }

  /* ---------- Sonido de cuentas que chocan (muy suave) ---------- */
  const CLICS = [1, 2, 3, 4, 5].map(n => `audio/cuenta-${n}.mp3`);
  let ultimoClic = 0, yaTocaron = false;
  function choque(fuerza) {
    if (!yaTocaron || (typeof sonido !== "undefined" && !sonido.efectosOn())) return;
    const now = performance.now(); if (now - ultimoClic < 90) return; ultimoClic = now;
    try { const a = new Audio(CLICS[Math.floor(Math.random() * CLICS.length)]); a.volume = Math.min(.22, .05 + fuerza / 6000); a.play().catch(() => {}); } catch {}
  }

  /* ---------- Interacción ---------- */
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const cercana = (p, max) => { let best = null, bd = max; for (const q of pts) if (!q.fijo) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } } return best; };
  cv.addEventListener("pointerdown", e => {
    const p = pos(e), q = cercana(p, 50 * S + 6); if (!q) return;
    e.preventDefault(); yaTocaron = true; arrastre = q; puntero = p; cv.setPointerCapture(e.pointerId); banda.classList.add("jalando");
    banda.querySelector(".pulsera-pista")?.classList.add("oculta");
  });
  cv.addEventListener("pointermove", e => {
    const p = pos(e);
    if (arrastre) { puntero = p; return; }
    for (const q of pts) if (!q.fijo) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < 44) { q.px -= (e.movementX || 0) * .3; q.py -= (e.movementY || 0) * .3; } }
    cv.style.cursor = cercana(p, 50 * S + 6) ? "grab" : "default";
  });
  const soltar = () => { arrastre = null; puntero = null; banda.classList.remove("jalando"); };
  cv.addEventListener("pointerup", soltar); cv.addEventListener("pointercancel", soltar);
  cv.addEventListener("pointerenter", () => { yaTocaron = true; });

  /* ---------- Bucle ---------- */
  montar();
  let last = performance.now(), t0 = last;
  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
    if (!reducir || now - t0 < 2000) paso(dt);
    dibujar(); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(montar, 150); });
})();
