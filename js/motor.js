/* Cyber Incognita · motor
   La ciudad amurallada de Kowloon de noche, que se recorre en vertical: de la azotea (donde pasan los aviones de Kai Tak)
   a la calle mojada. Cámara con inercia y muelle, capas con paralaje, la entrada (rueda, arrastre, táctil, teclado)
   convertida en eventos con nombre, y las escenas de los secretos.
   Unidades: «u» = min(alto de pantalla, 0,9 × ancho), así la fachada cabe también en el móvil. La λ va de arriba (0, el
   cielo) abajo (E.largo, la calle). La x se da en u desde el centro de la pantalla (xu). */
(function () {
  'use strict';
  var NI = window.NI = window.NI || {};

  /* ------------------------------------------------------------------ utilidades */
  var U = NI.util = {
    clamp: function (x, a, b) { return x < a ? a : x > b ? b : x; },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    tramo: function (t, a, b) { return U.clamp((t - a) / (b - a), 0, 1); },
    suave: function (t) { t = U.clamp(t, 0, 1); return t * t * (3 - 2 * t); },
    entra: function (t) { t = U.clamp(t, 0, 1); return t * t * t; },
    sale: function (t) { t = U.clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); },
    inOut: function (t) { t = U.clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    meseta: function (t, a, b, c, d) { return t < a || t > d ? 0 : t < b ? U.suave((t - a) / (b - a)) : t > c ? 1 - U.suave((t - c) / (d - c)) : 1; },
    azar: function (semilla) { var s = (semilla | 0) || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; },
    rgb: function (hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; },
    rgba: function (c, a) { if (typeof c === 'string') c = U.rgb(c); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')'; },
    mezcla: function (a, b, t) { if (typeof a === 'string') a = U.rgb(a); if (typeof b === 'string') b = U.rgb(b); return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')'; },
    dos: function (n) { return (n < 10 ? '0' : '') + n; },
    _h: function (n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); },
    ruido: function (x, semilla) { var i = Math.floor(x), f = x - i, a = U._h(i + (semilla | 0) * 131), b = U._h(i + 1 + (semilla | 0) * 131); f = f * f * (3 - 2 * f); return a + (b - a) * f; }
  };
  NI.color = { acento: [255, 43, 214], texto: [236, 230, 255] };

  /* ------------------------------------------------------------------ el motor */
  var E = NI.motor = {
    t: 0, W: 800, H: 600, u: 600, dpr: 1,
    largo: 5,                 // alto de la ciudad, en u (de la azotea a la calle)
    camY: 0, velY: 0, camObj: null, empuje: 0, empujeI: 0,
    puntero: { x: -999, y: -999, sobre: false, tipo: 'mouse', velocidad: 0 },
    senal: 0,
    escena: null, bloqueado: false, ligero: false, lectura: 5000,
    ultimoInput: 0,
    oyentes: {}, capas: []
  };
  var cv, ctx, raf = window.requestAnimationFrame.bind(window), ultimoRaf = null, congelado = false, cam = null, mediaDt = 16, nMedidos = 0;

  E.en = function (n, fn) { (E.oyentes[n] = E.oyentes[n] || []).push(fn); };
  function emitir(n, d) { var l = E.oyentes[n]; if (!l) return; for (var i = 0; i < l.length; i++) { try { l[i](d); } catch (err) { console.error(err); } } }
  E.emitir = emitir;

  /* ---------- coordenadas ---------- */
  E.sx = function (xu) { return E.W / 2 + xu * E.u; };
  E.xuDe = function (sx) { return (sx - E.W / 2) / E.u; };
  E.sy = function (l, p) { p = p == null ? 1 : p; return E.H / 2 + l * E.u - (E.H / 2 + E.camY) * p; };
  E.lDe = function (sy, p) { p = p == null ? 1 : p; return (sy - E.H / 2 + (E.H / 2 + E.camY) * p) / E.u; };
  E.maxCam = function () { return Math.max(0, E.largo * E.u - E.H); };
  E.centro = function () { return (E.camY + E.H / 2) / E.u; };    // la λ en el centro de la pantalla
  E.irA = function (l, ms, ease) {   // centra la cámara en λ
    cam = { y0: E.camY, y1: U.clamp(l * E.u - E.H / 2, 0, E.maxCam()), t0: E.t, dur: ms || 1400, ease: ease || U.inOut };
    E.velY = 0; E.camObj = null;
  };
  E.camaraActiva = function () { return !!cam; };

  /* ---------- tamaño ---------- */
  function medir() {
    var w = window.innerWidth, h = window.innerHeight, centro = E.u ? (E.camY + E.H / 2) / E.u : 0;
    E.W = w; E.H = h; E.u = Math.min(h, w * 0.9);
    E.dpr = E.ligero ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * E.dpr); cv.height = Math.round(h * E.dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    E.camY = U.clamp(centro * E.u - E.H / 2, 0, E.maxCam()); E.camObj = null;
    emitir('tamano', { W: w, H: h });
  }

  /* ---------- la espera a WebKit: Safari pinta los lienzos en otro proceso; leer un píxel obliga a acabar lo pedido ---------- */
  var unPixel = null;
  E.vaciar = function () {
    if (!unPixel) { var c1 = document.createElement('canvas'); c1.width = c1.height = 1; unPixel = c1.getContext('2d', { willReadFrequently: true }); }
    try { unPixel.fillRect(0, 0, 1, 1); unPixel.getImageData(0, 0, 1, 1); } catch (err) { /* nada */ }
  };

  /* ---------- dibujar un fotograma ---------- */
  function dibujar() {
    ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    var esc = E.escena, s = esc && esc.s, t = esc ? esc.t : 0;
    NI.ciudad.dibujar(ctx, s, t);
    if (!s) for (var i = 0; i < E.capas.length; i++) { try { E.capas[i](ctx, E.t); } catch (err) { console.error(err); } }
    if (s && s.frente) { try { s.frente(ctx, t); } catch (err) { console.error(err); } }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    NI.ciudad.dibujarEncendido(ctx);
  }

  /* ---------- un paso del reloj ---------- */
  function actualizar(dt) {
    E.t += dt;
    var esc = E.escena, antes = E.camY;
    if (cam) {
      var k = U.clamp((E.t - cam.t0) / cam.dur, 0, 1); E.camY = U.lerp(cam.y0, cam.y1, cam.ease(k)); if (k >= 1) cam = null;
    } else if (!esc) {
      if (Math.abs(E.velY) > 0.001) { E.camY += E.velY * dt; E.velY *= Math.pow(0.93, dt / 16); }
      if (E.camObj != null) {
        E.camY += (E.camObj - E.camY) * (1 - Math.exp(-dt / 110));
        if (Math.abs(E.camObj - E.camY) < 0.25) { E.camY = E.camObj; E.camObj = null; }
      }
    }
    E.camY = U.clamp(E.camY, 0, E.maxCam());
    E.puntero.velocidad *= Math.pow(0.8, dt / 16);
    if (esc) {
      esc.t += dt;
      var sc = esc.s, ta = sc.tarjeta;
      if (ta && !esc.tv && esc.t >= ta.en) { esc.tv = true; NI.interfaz && NI.interfaz.tarjeta(ta); }
      if (ta && esc.tv && !esc.tq && esc.t >= ta.hasta) { esc.tq = true; NI.interfaz && NI.interfaz.tarjeta(null); }
      if (sc.cuadro) { try { sc.cuadro(esc.t, dt); } catch (err) { console.error(err); } }
      if (esc.t >= esc.dur) terminarEscena(false);
    }
    NI.ciudad.actualizar(dt);
    if (!esc && !E.bloqueado) emitir('cuadro', { t: E.t, dt: dt, inactivo: E.t - E.ultimoInput, movido: E.camY - antes });
  }
  function paso(dt) { actualizar(dt); dibujar(); }
  function bucle(ahora) {
    if (congelado) return;
    var dt = ultimoRaf === null ? 16 : Math.min(50, ahora - ultimoRaf); ultimoRaf = ahora;
    paso(dt);
    // si el equipo no llega (de media más de 28 ms por fotograma), modo ligero (resolución 1×); solo con el taller parado
    var midiendo = !E.ligero && !E.escena && !NI.ciudad.ocupado();
    if (midiendo) { mediaDt = mediaDt * 0.95 + dt * 0.05; if (++nMedidos > 120 && mediaDt > 28) { E.ligero = true; medir(); } }
    raf(bucle);
  }

  /* ---------- escenas ---------- */
  E.reproducir = function (h, alTerminar) {
    if (E.escena) return false;
    var s = h.escena(E) || {};
    E.escena = { h: h, s: s, t: 0, dur: s.duracion || 8000, fin: alTerminar };
    E.velY = 0; cam = null; arrastre = null; E.camObj = null;
    document.documentElement.classList.add('en-escena');
    if (s.inicio) { try { s.inicio(); } catch (err) { console.error(err); } }
    emitir('escena', { fase: 'inicio', huevo: h });
    return true;
  };
  function terminarEscena(saltada) {
    var e = E.escena; if (!e) return;
    try { e.s.fin && e.s.fin(saltada); } catch (err) { console.error(err); }
    E.escena = null; cam = null;
    NI.interfaz && NI.interfaz.tarjeta(null);
    document.documentElement.classList.remove('en-escena');
    E.ultimoInput = E.t;
    emitir('escena', { fase: 'fin', huevo: e.h, saltada: saltada });
    if (e.fin) e.fin(saltada);
  }
  E.saltar = function () { terminarEscena(true); };

  /* ---------- entrada ----------
     Arrastrar, rueda, trackpad o flechas: subir y bajar por la ciudad. Un clic sin moverse: el evento «clic».
     Un secreto puede quedarse un arrastre que empieza sobre algo suyo: en «bajar», d.tomar() (llegan «arrastrar» y «soltar»). */
  var arrastre = null, punteros = {}, dosDedos = null;
  function libre() { return !E.escena && !E.bloqueado; }
  function marcar() { E.ultimoInput = E.t; }
  function datos(x, y) { return { x: x, y: y, xu: E.xuDe(x), l: E.lDe(y) }; }

  function alBajar(ev) {
    marcar();
    var p = E.puntero; p.x = ev.clientX; p.y = ev.clientY; p.sobre = true; p.tipo = ev.pointerType || 'mouse';
    if (!libre()) return;
    punteros[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ }
    if (Object.keys(punteros).length === 2) { arrastre = null; dosDedos = {}; return; }
    arrastre = { x0: ev.clientX, y0: ev.clientY, t0: E.t, cam0: E.camY, movido: 0, tomado: false, pts: [[ev.clientX, ev.clientY, E.t, E.camY]] };
    cam = null; E.velY = 0; E.camObj = null;
    var d = datos(ev.clientX, ev.clientY); d.tomar = function () { if (arrastre) arrastre.tomado = true; };
    emitir('bajar', d);
    document.documentElement.classList.toggle('arrastrando', !arrastre.tomado);
  }
  function alMover(ev) {
    marcar();
    var p = E.puntero, dx = ev.clientX - p.x, dy = ev.clientY - p.y;
    if (p.sobre && E.t - (p.tm || 0) > 0) { var v = Math.hypot(dx, dy) / Math.max(1, E.t - (p.tm || E.t - 16)); p.velocidad = Math.max(p.velocidad, v); }
    p.x = ev.clientX; p.y = ev.clientY; p.sobre = ev.target === cv || !!arrastre; p.tm = E.t; p.tipo = ev.pointerType || p.tipo;
    if (punteros[ev.pointerId]) { punteros[ev.pointerId].x = ev.clientX; punteros[ev.pointerId].y = ev.clientY; }
    if (!libre()) return;
    if (dosDedos) {
      var ids = Object.keys(punteros); if (ids.length < 2) return;
      var my = (punteros[ids[0]].y + punteros[ids[1]].y) / 2;
      if (dosDedos.ultimo != null) E.camY = U.clamp(E.camY - (my - dosDedos.ultimo), 0, E.maxCam());
      dosDedos.ultimo = my; return;
    }
    var A = arrastre;
    if (A) {
      var ult = A.pts[A.pts.length - 1];
      A.movido += Math.hypot(ev.clientX - ult[0], ev.clientY - ult[1]);
      if (A.tomado) emitir('arrastrar', datos(ev.clientX, ev.clientY));
      else {
        var obj = A.cam0 - (ev.clientY - A.y0);
        if (obj < 0 && E.camY <= 0.5) { E.empujarInicio(-obj - (A.empujado || 0)); A.empujado = -obj; }
        if (obj > E.maxCam() && E.camY >= E.maxCam() - 0.5) { E.empujarFin(obj - E.maxCam() - (A.empujado || 0)); A.empujado = obj - E.maxCam(); }
        E.camY = U.clamp(obj, 0, E.maxCam());
      }
      A.pts.push([ev.clientX, ev.clientY, E.t, E.camY]);
    } else emitir('mover', datos(ev.clientX, ev.clientY));
  }
  function alSubir(ev) {
    marcar();
    delete punteros[ev.pointerId];
    document.documentElement.classList.remove('arrastrando');
    if (dosDedos) { if (Object.keys(punteros).length < 2) dosDedos = null; arrastre = null; return; }
    var A = arrastre; arrastre = null;
    if (!A || !libre()) return;
    var dur = E.t - A.t0, d = datos(ev.clientX, ev.clientY);
    if (A.tomado) { emitir('soltar', d); return; }
    if (A.movido < 6 && dur < 600) { emitir('clic', datos(A.x0, A.y0)); return; }
    var n = A.pts.length; if (n > 2) { var a = A.pts[Math.max(0, n - 5)], b = A.pts[n - 1]; E.velY = -(b[1] - a[1]) / Math.max(16, b[2] - a[2]); }
    var pts = A.pts.map(function (q) { return { x: q[0], y: q[1], t: q[2], xu: (q[0] - E.W / 2) / E.u, l: (q[1] + q[3]) / E.u }; });
    emitir('trazo', { pts: pts, dur: dur, movido: A.movido });
  }

  E.iniciar = function (lienzo) {
    cv = lienzo; ctx = cv.getContext('2d', { alpha: false }); E.ctx = ctx;
    medir();
    window.addEventListener('resize', medir);
    cv.addEventListener('pointerdown', alBajar);
    window.addEventListener('pointermove', function (ev) { if (ev.target === cv || arrastre || dosDedos) alMover(ev); else { E.puntero.sobre = false; marcar(); } });
    window.addEventListener('pointerup', alSubir);
    window.addEventListener('pointercancel', function (ev) { delete punteros[ev.pointerId]; arrastre = null; dosDedos = null; document.documentElement.classList.remove('arrastrando'); });
    cv.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse' && !arrastre) E.puntero.sobre = false; });
    cv.addEventListener('wheel', function (ev) {
      ev.preventDefault(); marcar();
      if (!libre()) return;
      var d = (Math.abs(ev.deltaY) >= Math.abs(ev.deltaX) ? ev.deltaY : ev.deltaX) * (ev.deltaMode === 1 ? 16 : 1);
      cam = null;
      var antes = E.camObj != null ? E.camObj : E.camY; E.camObj = U.clamp(antes + d, 0, E.maxCam());
      if (d > 0 && antes >= E.maxCam() - 0.5) E.empujarFin(d);
      if (d < 0 && antes <= 0.5) E.empujarInicio(-d);
      E.velY = 0;
    }, { passive: false });
    window.addEventListener('keydown', function (ev) {
      marcar();
      var t = ev.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (ev.key === 'Backspace') ev.preventDefault();
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (libre() && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) {
        ev.preventDefault(); cam = null; E.camObj = null;
        var dir = ev.key === 'ArrowDown' ? 1 : -1;
        if (dir > 0 && E.camY >= E.maxCam() - 0.5) E.empujarFin(120);
        if (dir < 0 && E.camY <= 0.5) E.empujarInicio(120);
        E.velY = dir * 1.5;
      }
      emitir('tecla', { key: ev.key });
    });
    document.addEventListener('visibilitychange', function () { ultimoRaf = null; marcar(); });
    raf(bucle);
  };
  // empujar más allá de los extremos: se acumula mientras sigas empujando (si paras 0,7 s, vuelve a cero)
  E.empujarFin = function (d) { if (E.t - (E.ultimoEmpuje || -1e9) > 700) E.empuje = 0; E.ultimoEmpuje = E.t; E.empuje += d; emitir('empujar', { lado: 'fin', d: d, total: E.empuje }); };
  E.empujarInicio = function (d) { if (E.t - (E.ultimoEmpujeI || -1e9) > 700) E.empujeI = 0; E.ultimoEmpujeI = E.t; E.empujeI += d; emitir('empujar', { lado: 'inicio', d: d, total: E.empujeI }); };

  /* ---------- pruebas: pasos manuales (cada fotograma simulado espera a que WebKit lo pinte) ---------- */
  E.congelar = function (si) { congelado = si !== false; if (!congelado) { ultimoRaf = null; raf(bucle); } };
  E.paso = function (ms, trozos) { trozos = trozos || Math.max(1, Math.round(ms / 16)); for (var i = 0; i < trozos; i++) { paso(ms / trozos); E.vaciar(); } };
})();
