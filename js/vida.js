/* Cyber Incognita · la vida de la ciudad
   Pau (01/11/2026): «añadiría algo más, es como muy poco». Todo lo que se mueve encima de las teselas:
   - interiores abiertos: el dentista, una partida de mahjong, una fábrica de bolas de pescado, una familia cenando,
     una costurera y un niño haciendo los deberes;
   - ventanas: siluetas que pasan, luces que se encienden y se apagan, alguien fumando, gatos en las repisas;
   - pértigas de bambú con ropa tendida que se mueve con el viento, vapor de las cocinas y chorros de agua de la marquesina;
   - azotea: palomas, un niño con su cometa, alguien haciendo taichí;
   - calle: el autobús de dos pisos, el carrito de bolas de pescado, un ciclista, un gato, alguien corriendo con el
     periódico en la cabeza y los reflejos del neón alargados sobre el asfalto;
   - delante: letreros enormes colgados sobre la calle (paralaje 1,12).
   Se engancha a NI.ciudad.VIVO; solo se dibuja lo que está en pantalla. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, A = NI.arte, C = NI.ciudad, P = A.P;
  var TAU = Math.PI * 2, PB = C.PB, FH = C.FH, ACERA = C.ACERA, BORDILLO = C.BORDILLO, TECHO = C.TECHO;
  var V = C.VIVO;
  function lTop(k) { return PB - k * FH; }                       // la λ de arriba de la planta k (1…14, desde abajo)
  function enPantalla(y, m) { return y > -(m || 80) && y < E.H + (m || 80); }
  function techoEn(xu) { for (var i = 0; i < C.COLS.length; i++) { var c = C.COLS[i]; if (xu >= c.x && xu <= c.x + c.w) return c.top; } return TECHO; }
  var R = A.ROPAS;
  function gente(c, x, y, h, op) { return A.cuerpo(c, x, y, h, op); }
  function brasa(c, x, y, k) { var g = c.createRadialGradient(x, y, 0, x, y, 4 + k * 6); g.addColorStop(0, 'rgba(255,140,60,' + (0.7 + k * 0.3).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,80,20,0)'); c.fillStyle = g; c.fillRect(x - 12, y - 12, 24, 24); }
  function humo(c, x, y, t, i) { c.strokeStyle = 'rgba(220,210,235,.28)'; c.lineWidth = 1.3; c.beginPath(); for (var k = 0; k < 14; k++) { var sx = x + Math.sin(t / 700 + k * 0.6 + i) * k * 0.7, sy = y - k * 4; k ? c.lineTo(sx, sy) : c.moveTo(sx, sy); } c.stroke(); }

  /* ================================================================== interiores abiertos */
  var INTERIORES = [
    { xu: -0.37, k: 4, luz: ['#dff8f4', '#8fcfc8'], escena: dentista },
    { xu: 0.27, k: 9, luz: ['#ffd78a', '#c8783c'], escena: mahjong },
    { xu: 0.31, k: 3, luz: ['#e6f6ff', '#9ab8c8'], escena: fabrica },
    { xu: -0.3, k: 11, luz: ['#ffd28a', '#d0843c'], escena: cena },
    { xu: -0.05, k: 5, luz: ['#ffe2b0', '#c89a5a'], escena: costura },
    { xu: 0.38, k: 12, luz: ['#fff0c8', '#7a5a38'], escena: deberes }
  ];
  var BATA = { top: '#e6f0f0', bottom: '#e6f0f0', piel: '#c4916e', pelo: '#1a1210', zapato: '#2a2a30', abrigo: true };
  function dentista(c, x, y, w, h, t) {
    c.fillStyle = 'rgba(120,180,170,.4)'; c.fillRect(x + w * 0.05, y + h * 0.1, w * 0.18, h * 0.3);
    c.fillStyle = '#fff'; for (var d = 0; d < 4; d++) c.fillRect(x + w * 0.07 + d * w * 0.035, y + h * 0.2, w * 0.025, h * 0.08);
    // el sillón reclinado con el paciente tumbado
    c.fillStyle = '#2a5a6a'; c.beginPath(); c.moveTo(x + w * 0.16, y + h * 0.7); c.lineTo(x + w * 0.64, y + h * 0.62); c.lineTo(x + w * 0.68, y + h * 0.74); c.lineTo(x + w * 0.18, y + h * 0.82); c.fill();
    c.fillRect(x + w * 0.4, y + h * 0.76, w * 0.04, h * 0.24);
    c.save(); c.translate(x + w * 0.62, y + h * 0.66); c.rotate(-1.42); gente(c, 0, 0, h * 0.8, { ropa: R[1], brazoI: [0.1, 0.1], brazoD: [0.15, 0.2], piernas: [0, 0, 0.05, 0.05] }); c.restore();
    // la lámpara, muy blanca, sobre la boca
    c.strokeStyle = '#3a3a44'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w * 0.5, y); c.lineTo(x + w * 0.42, y + h * 0.28); c.lineTo(x + w * 0.27, y + h * 0.32); c.stroke();
    var g = c.createRadialGradient(x + w * 0.25, y + h * 0.34, 0, x + w * 0.25, y + h * 0.34, h * 0.42); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x, y, w * 0.7, h);
    // el dentista de bata, inclinado sobre él, con el torno que vibra
    var vib = Math.sin(t / 30) * 0.04;
    c.save(); c.translate(x + w * 0.66, y + h); c.rotate(-0.3); var gd = gente(c, 0, 0, h * 0.95, { ropa: BATA, dir: -1, brazoD: [0.95 + vib, 1.5 + vib], brazoI: [0.6, 1.2], mira: -0.25 }); c.restore();
  }
  function mahjong(c, x, y, w, h, t) {
    var bal = Math.sin(t / 1300) * 0.08, lx = x + w * 0.5 + Math.sin(bal) * h * 0.4, ly = y + h * 0.3;
    c.strokeStyle = '#2a1a10'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w * 0.5, y); c.lineTo(lx, ly); c.stroke();
    var g = c.createRadialGradient(lx, ly + h * 0.3, 0, lx, ly + h * 0.3, w * 0.5); g.addColorStop(0, 'rgba(255,240,180,.55)'); g.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = g; c.fillRect(x, y, w, h);
    // los dos de detrás de la mesa
    [[0.4, 1, R[5]], [0.6, -1, R[4]]].forEach(function (q, i) { gente(c, x + w * q[0], y + h * 1.02, h * 0.82, { ropa: q[2], dir: q[1], sentado: true, brazoD: [1.3, 1.7 + Math.max(0, Math.sin(t / 800 + i * 3)) * 0.4], brazoI: [1.2, 1.6] }); });
    c.fillStyle = '#0e6a3a'; c.fillRect(x + w * 0.25, y + h * 0.68, w * 0.5, h * 0.08); c.fillStyle = '#2a1a10'; c.fillRect(x + w * 0.25, y + h * 0.76, w * 0.5, h * 0.24);
    c.fillStyle = '#f4ecd8'; for (var f = 0; f < 10; f++) c.fillRect(x + w * 0.28 + f * w * 0.044, y + h * 0.63, w * 0.035, h * 0.05);
    // los dos de los lados, de perfil, que alargan la mano hacia las fichas
    [[0.17, 1, R[0]], [0.83, -1, R[7]]].forEach(function (q, i) { var mueve = Math.max(0, Math.sin(t / 700 + i * 2)); gente(c, x + w * q[0], y + h * 1.02, h * 0.82, { ropa: q[2], dir: q[1], sentado: true, brazoD: [1.1 + mueve * 0.3, 1.5 + mueve * 0.3], brazoI: [0.9, 1.3] }); });
    c.fillStyle = '#3a2412'; c.beginPath(); c.moveTo(lx - w * 0.07, ly + h * 0.05); c.lineTo(lx + w * 0.07, ly + h * 0.05); c.lineTo(lx + w * 0.03, ly - h * 0.03); c.lineTo(lx - w * 0.03, ly - h * 0.03); c.fill();
    humo(c, x + w * 0.86, y + h * 0.5, t, 0);
  }
  function fabrica(c, x, y, w, h, t) {
    c.fillStyle = '#c8c0a8'; c.fillRect(x + w * 0.76, y + h * 0.7, w * 0.22, 3); for (var b = 0; b < 6; b++) { c.beginPath(); c.arc(x + w * 0.78 + b * w * 0.033, y + h * 0.68, 2.4, 0, TAU); c.fill(); }
    var a = t / 600;
    gente(c, x + w * 0.66, y + h, h * 0.9, { ropa: { top: '#dfe6ea', bottom: '#2a3040', piel: '#c99a78', pelo: '#e8e8f0', zapato: '#1a1a20', pelo2: 'gorra' }, dir: -1, brazoD: [1.0 + Math.sin(a) * 0.25, 1.6 + Math.cos(a) * 0.3], brazoI: [0.8, 1.3] });
    c.strokeStyle = '#4a4a54'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x + w * 0.53, y + h * 0.48); c.lineTo(x + w * 0.34 + Math.cos(a) * w * 0.05, y + h * 0.66); c.stroke();
    c.fillStyle = '#7a8a94'; c.fillRect(x + w * 0.12, y + h * 0.6, w * 0.4, h * 0.4); c.fillStyle = '#a8b8c0'; c.fillRect(x + w * 0.12, y + h * 0.6, w * 0.4, 3);
    for (var k = 0; k < 5; k++) { var kk = ((t / 1600) + k / 5) % 1, g = c.createRadialGradient(x + w * 0.32 + Math.sin(kk * 6 + k) * 6, y + h * (0.55 - kk * 0.5), 0, x + w * 0.32, y + h * (0.55 - kk * 0.5), h * (0.1 + kk * 0.22)); g.addColorStop(0, 'rgba(255,255,255,' + (0.35 * (1 - kk)).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); }
  }
  function cena(c, x, y, w, h, t) {
    var tv = 0.4 + 0.4 * U.ruido(t / 200, 4); c.fillStyle = 'rgba(120,160,255,' + tv.toFixed(2) + ')'; c.fillRect(x + w * 0.74, y + h * 0.14, w * 0.17, h * 0.2); c.strokeStyle = '#1a1018'; c.strokeRect(x + w * 0.74, y + h * 0.14, w * 0.17, h * 0.2);
    [[0.36, 1, R[2]], [0.52, -1, R[3]]].forEach(function (q, i) { var come = Math.max(0, Math.sin(t / 600 + i * 1.7)); gente(c, x + w * q[0], y + h * 1.04, h * 0.8, { ropa: q[2], dir: q[1], sentado: true, brazoD: [1.2 - come * 0.4, 1.6 - come * 1.4], mira: -come * 0.15 }); });
    c.fillStyle = '#6a2a1a'; c.beginPath(); c.ellipse(x + w * 0.44, y + h * 0.72, w * 0.3, h * 0.07, 0, 0, TAU); c.fill(); c.fillStyle = '#4a1a10'; c.fillRect(x + w * 0.4, y + h * 0.76, w * 0.08, h * 0.24);
    c.fillStyle = '#f4ecd8'; for (var b = 0; b < 4; b++) { c.beginPath(); c.arc(x + w * (0.26 + b * 0.12), y + h * 0.69, 3, Math.PI, 0); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1; for (b = 0; b < 2; b++) { c.beginPath(); for (var k = 0; k < 6; k++) { var sx = x + w * (0.32 + b * 0.24) + Math.sin(t / 400 + k + b) * 2, sy = y + h * 0.65 - k * h * 0.05; k ? c.lineTo(sx, sy) : c.moveTo(sx, sy); } c.stroke(); }
    [[0.13, 1, R[6]], [0.76, -1, R[4]]].forEach(function (q, i) { var come = Math.max(0, Math.sin(t / 700 + i * 2.4)); gente(c, x + w * q[0], y + h * 1.04, h * 0.8, { ropa: q[2], dir: q[1], sentado: true, brazoD: [1.3 - come * 0.5, 1.6 - come * 1.3] }); });
  }
  function costura(c, x, y, w, h, t) {
    var g = c.createRadialGradient(x + w * 0.45, y + h * 0.4, 0, x + w * 0.45, y + h * 0.4, w * 0.4); g.addColorStop(0, 'rgba(255,240,200,.5)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(x, y, w, h);
    ['#c8202e', '#3a5a9a', '#e8c840', '#2a8a5a', '#c860a0'].forEach(function (col, i) { c.fillStyle = col; c.fillRect(x + w * (0.74 + (i % 2) * 0.1), y + h * (0.1 + Math.floor(i / 2) * 0.18), w * 0.08, h * 0.14); });
    gente(c, x + w * 0.2, y + h * 1.02, h * 0.85, { ropa: R[4], sentado: true, brazoD: [1.25, 1.6 + Math.sin(t / 300) * 0.08], brazoI: [1.15, 1.55], mira: -0.2 });
    c.fillStyle = '#1a1420'; c.fillRect(x + w * 0.3, y + h * 0.66, w * 0.36, h * 0.06); c.fillRect(x + w * 0.36, y + h * 0.46, w * 0.24, h * 0.07); c.fillRect(x + w * 0.56, y + h * 0.46, w * 0.04, h * 0.2);
    c.fillStyle = '#3a2a20'; c.fillRect(x + w * 0.28, y + h * 0.72, w * 0.4, h * 0.28);
    c.strokeStyle = '#e8e0d0'; c.lineWidth = 1; var ag = Math.sin(t / 40) * h * 0.03; c.beginPath(); c.moveTo(x + w * 0.4, y + h * 0.53); c.lineTo(x + w * 0.4, y + h * 0.62 + ag); c.stroke();
    c.fillStyle = '#c860a0'; c.fillRect(x + w * 0.26 - ((t / 40) % 10), y + h * 0.645, w * 0.22, h * 0.025);
  }
  function deberes(c, x, y, w, h, t) {
    c.fillStyle = 'rgba(255,90,170,.35)'; c.fillRect(x + w * 0.74, y + h * 0.1, w * 0.18, h * 0.3);
    gente(c, x + w * 0.24, y + h * 1.02, h * 0.66, { ropa: R[2], sentado: true, brazoD: [1.3, 1.7 + Math.sin(t / 120) * 0.08], brazoI: [1.2, 1.5], mira: -0.3 + Math.sin(t / 900) * 0.06 });
    c.fillStyle = '#3a2410'; c.fillRect(x + w * 0.2, y + h * 0.72, w * 0.52, h * 0.06); c.fillRect(x + w * 0.62, y + h * 0.78, w * 0.04, h * 0.22);
    c.fillStyle = '#f4f0e0'; c.fillRect(x + w * 0.36, y + h * 0.7, w * 0.14, h * 0.025);
    c.strokeStyle = '#2a2420'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w * 0.64, y + h * 0.72); c.lineTo(x + w * 0.6, y + h * 0.4); c.lineTo(x + w * 0.5, y + h * 0.38); c.stroke();
    var g = c.createRadialGradient(x + w * 0.46, y + h * 0.66, 0, x + w * 0.46, y + h * 0.66, h * 0.4); g.addColorStop(0, 'rgba(255,240,190,.6)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.fillRect(x, y, w, h);
  }
  V.ventanas.push(function (c, t) {
    var u = E.u;
    INTERIORES.forEach(function (it) {
      var l = lTop(it.k) + FH * 0.17, y = E.sy(l), h = FH * 0.52 * u; if (!enPantalla(y, h)) return;
      var w = 0.12 * u, x = E.sx(it.xu) - w / 2;
      c.fillStyle = '#0b0912'; c.fillRect(x - 4, y - 4, w + 8, h + 8);
      var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, it.luz[0]); g.addColorStop(1, it.luz[1]); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); it.escena(c, x, y, w, h, t); c.restore();
      // el marco de aluminio, el cristal mojado y el alféizar
      c.strokeStyle = 'rgba(20,16,26,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 3, y); c.lineTo(x + w / 3, y + h); c.moveTo(x + w * 2 / 3, y); c.lineTo(x + w * 2 / 3, y + h); c.moveTo(x, y + h * 0.25); c.lineTo(x + w, y + h * 0.25); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(x + w * 0.05, y); c.lineTo(x + w * 0.2, y); c.lineTo(x + w * 0.05, y + h * 0.6); c.fill();
      c.fillStyle = '#3c3248'; c.fillRect(x - 6, y + h + 2, w + 12, 4);
    });
  });

  /* ================================================================== vida en las ventanas */
  var LUCES = [], SILUETAS = [], FUMADORES = [], GATOS = [], BAMBU = [];
  (function () {
    var lista = C.VENTANAS, r = U.azar(808);
    function libre(v) { return !INTERIORES.some(function (it) { return Math.abs(it.xu - v.xu) < 0.09 && Math.abs(lTop(it.k) - v.l) < FH; }); }
    function lejosDeTodo(v) { return !INTERIORES.some(function (it) { return Math.abs(it.xu - v.xu) < 0.28 && Math.abs(lTop(it.k) + FH * 0.2 - v.l) < FH * 0.8; }) && !C.LETREROS.some(function (L) { return Math.abs(L.xu - v.xu) < 0.2 && Math.abs(L.l - v.l) < 0.12; }); }
    lista.forEach(function (v, i) {
      if (!libre(v)) return;
      var enc = v.estado !== 'oscura' && v.estado !== 'tv';
      if (i % 9 === 0) LUCES.push(v);
      else if (enc && i % 7 === 3) SILUETAS.push(v);
      else if (enc && !v.jaula && i % 41 === 5 && FUMADORES.length < 4) FUMADORES.push(v);
      else if (!v.ac && i % 37 === 11 && GATOS.length < 3) GATOS.push(v);
      else if (!v.jaula && !v.ac && i % 23 === 2 && BAMBU.length < 9 && lejosDeTodo(v)) BAMBU.push({ v: v, lado: r() < 0.5 ? -1 : 1, largo: 0.09 + r() * 0.06, ropa: 3 + Math.floor(r() * 3), semilla: Math.floor(r() * 1e5) });
    });
  })();
  V.ventanas.push(function (c, t) {
    var u = E.u;
    // luces que se encienden y se apagan (la tesela trae su estado; aquí se tapa o se enciende)
    LUCES.forEach(function (v, i) {
      var y = E.sy(v.l); if (!enPantalla(y)) return;
      var on = U._h(Math.floor((t + i * 1777) / (12000 + (i % 5) * 3000)) + i) > 0.4, base = v.estado !== 'oscura';
      if (on === base) return;
      var x = E.sx(v.xu), w = v.w * u, h = v.h * u, col = on ? P.calida : P.oscura, g = c.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke();
    });
    // gente que cruza la habitación: a su escala, de color, vista a través del cristal
    SILUETAS.forEach(function (v, i) {
      var y = E.sy(v.l); if (!enPantalla(y)) return;
      var per = 9000 + (i % 7) * 1700, k = ((t + i * 2311) % per) / 3600; if (k > 1) return;
      var x = E.sx(v.xu), w = v.w * u, h = v.h * u, dir = i % 2 ? 1 : -1, px = dir > 0 ? x - w * 0.4 + k * w * 1.8 : x + w * 1.4 - k * w * 1.8;
      var luz = v.estado === 'fluor' ? P.fluor : P.calida;
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      gente(c, px, y + h * 1.0, h * 0.94, { ropa: R[i % R.length], dir: dir, fase: t / 260 + i });
      var gv = c.createLinearGradient(0, y, 0, y + h); gv.addColorStop(0, U.rgba(luz[0], 0.28)); gv.addColorStop(1, U.rgba(luz[1], 0.18)); c.fillStyle = gv; c.fillRect(x, y, w, h);
      c.restore();
      c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * 0.3); c.lineTo(x + w, y + h * 0.3); c.stroke();
    });
    // alguien fumando en la ventana abierta: se lleva el cigarrillo a la boca, la brasa se aviva y sale el humo
    FUMADORES.forEach(function (v, i) {
      var y = E.sy(v.l); if (!enPantalla(y)) return;
      var x = E.sx(v.xu), w = v.w * u, h = v.h * u, tir = Math.max(0, Math.sin(t / 1400 + i * 2)), hp = h * 0.98, px = x + w * 0.45, py = y + h * 1.02;
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      var g = gente(c, px, py, hp, { ropa: R[(i + 3) % R.length], brazoD: [0.35 + tir * 0.5, 2.0 + tir * 0.6], brazoI: [0.2, 0.5], mira: 0.05, borde: 'rgba(255,200,140,.7)' });
      c.restore();
      var bx = px + g.mano[0], by = py + g.mano[1];
      if (by > y && by < y + h + 4) { brasa(c, bx + 3, by - 2, tir); humo(c, bx + 3, by - 4, t, i); }
    });
    // gatos en la repisa, con la cola que va y viene
    GATOS.forEach(function (v, i) {
      var y = E.sy(v.l + v.h) + 3; if (!enPantalla(y)) return;
      var x = E.sx(v.xu) + v.w * u * 0.3, s = 0.016 * u;
      c.fillStyle = '#08060c'; c.beginPath(); c.ellipse(x, y - s * 0.6, s * 0.55, s * 0.65, 0, 0, TAU); c.fill();
      c.beginPath(); c.arc(x, y - s * 1.4, s * 0.38, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x - s * 0.32, y - s * 1.6); c.lineTo(x - s * 0.2, y - s * 2.05); c.lineTo(x - s * 0.05, y - s * 1.7); c.moveTo(x + s * 0.32, y - s * 1.6); c.lineTo(x + s * 0.2, y - s * 2.05); c.lineTo(x + s * 0.05, y - s * 1.7); c.fill();
      var cola = Math.sin(t / 600 + i * 2) * 0.6; c.strokeStyle = '#08060c'; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + s * 0.4, y - s * 0.2); c.quadraticCurveTo(x + s * 1.1, y + s * 0.3, x + s * 1.1 + Math.sin(cola) * s, y + s * 0.9); c.stroke();
      if (U._h(Math.floor(t / 180) + i) > 0.9) return; c.fillStyle = '#d8ff6a'; c.fillRect(x - s * 0.2, y - s * 1.45, 2, 2); c.fillRect(x + s * 0.12, y - s * 1.45, 2, 2);
    });
  });

  /* ================================================================== bambú con ropa, vapor y chorros de agua */
  var COLORES_ROPA = ['#c8344e', '#3a6ad8', '#e8e0d0', '#4a9a6a', '#e8b040', '#9a5ac8', '#f08ab8', '#2a2a3a'];
  V.fachada.push(function (c, t) {
    var u = E.u, viento = (0.6 + 0.4 * Math.sin(t / 2300)) * (1 + 2.5 * (C.vientoExtra || 0));   // C.vientoExtra: el paso de un avión (secreto 01)
    BAMBU.forEach(function (b, i) {
      var v = b.v, y = E.sy(v.l + v.h * 0.15); if (!enPantalla(y, 120)) return;
      var x0 = E.sx(v.lado < 0 ? v.xu : v.xu + v.w) , x0b = b.lado < 0 ? E.sx(v.xu) : E.sx(v.xu + v.w), x1 = x0b + b.lado * b.largo * u, y1 = y - 0.012 * u;
      c.strokeStyle = '#8a7a4a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0b, y); c.lineTo(x1, y1); c.stroke();
      c.strokeStyle = '#b4a46a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0b, y - 1); c.lineTo(x1, y1 - 1); c.stroke();
      var r = U.azar(b.semilla);
      for (var k = 0; k < b.ropa; k++) {
        var f = (k + 0.7) / (b.ropa + 0.4), hx = U.lerp(x0b, x1, f), hy = U.lerp(y, y1, f), col = COLORES_ROPA[Math.floor(r() * COLORES_ROPA.length)], tipo = r(), ancho = 0.022 * u, alto = 0.035 * u * (0.8 + r() * 0.5);
        var ang = Math.sin(t / 700 + k * 1.3 + i) * 0.18 * viento * (C.lluvia > 0.7 ? 1.4 : 1);
        c.save(); c.translate(hx, hy); c.rotate(ang); c.fillStyle = col;
        if (tipo < 0.4) { c.beginPath(); c.moveTo(-ancho / 2, 0); c.lineTo(ancho / 2, 0); c.lineTo(ancho * 0.6, alto * 0.3); c.lineTo(ancho * 0.35, alto * 0.25); c.lineTo(ancho * 0.35, alto); c.lineTo(-ancho * 0.35, alto); c.lineTo(-ancho * 0.35, alto * 0.25); c.lineTo(-ancho * 0.6, alto * 0.3); c.closePath(); c.fill(); }
        else if (tipo < 0.7) { c.fillRect(-ancho * 0.4, 0, ancho * 0.8, alto * 0.25); c.fillRect(-ancho * 0.4, alto * 0.2, ancho * 0.35, alto * 0.8); c.fillRect(ancho * 0.05, alto * 0.2, ancho * 0.35, alto * 0.8); }
        else c.fillRect(-ancho * 0.5, 0, ancho, alto * 0.6);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 0, ancho * 0.6, alto);
        c.restore();
      }
    });
    // vapor de las cocinas (la fábrica de bolas de pescado y el restaurante de abajo)
    [[0.38, lTop(3) + 0.02], [-0.25, PB - 0.04]].forEach(function (q, j) {
      var y = E.sy(q[1]); if (!enPantalla(y, 200)) return;
      for (var k = 0; k < 6; k++) {
        var kk = ((t / 2600) + k / 6 + j * 0.3) % 1, px = E.sx(q[0]) + Math.sin(kk * 5 + k) * 0.02 * u, py = y - kk * 0.25 * u, rr = (0.015 + kk * 0.05) * u;
        var g = c.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, 'rgba(225,215,245,' + (0.12 * Math.sin(Math.PI * kk)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(225,215,245,0)'); c.fillStyle = g; c.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      }
    });
    // los chorros de agua que caen de la marquesina
    var yA = E.sy(PB + 0.004), yB = E.sy(ACERA);
    if (yB > -20 && yA < E.H + 20 && C.lluvia > 0.15) {
      c.strokeStyle = 'rgba(200,215,255,' + (0.25 + C.lluvia * 0.35).toFixed(2) + ')'; c.lineWidth = 1.4; c.beginPath();
      for (var j = 0; j < 22; j++) {
        var x = E.sx(-0.62 + j * 0.059 + U._h(j) * 0.02), vel = 0.9 + U._h(j * 3) * 0.4;
        for (var s = 0; s < 4; s++) { var k2 = ((t * vel / 700) + s / 4 + U._h(j * 7)) % 1, y0 = U.lerp(yA, yB, k2); c.moveTo(x, y0); c.lineTo(x, y0 + 10 + C.lluvia * 10); }
      }
      c.stroke();
      c.fillStyle = 'rgba(200,215,255,.35)'; for (j = 0; j < 22; j++) { var sxp = E.sx(-0.62 + j * 0.059 + U._h(j) * 0.02), kk3 = (t / 300 + j) % 1; c.beginPath(); c.ellipse(sxp, yB - 2, 3 + kk3 * 6, 1.5, 0, 0, TAU); c.fill(); }
    }
  });

  /* ================================================================== la azotea */
  var PALOMAS = []; for (var p = 0; p < 13; p++) PALOMAS.push({ f: p / 13 * TAU + U._h(p) * 0.4, r: 0.8 + U._h(p * 3) * 0.4, alt: U._h(p * 5) });
  V.azotea.push(function (c, t) {
    var u = E.u, yT = E.sy(TECHO); if (yT < -100 || yT > E.H + 0.6 * u) return;
    // la bandada: da vueltas sobre los tejados, a veces se posa
    var cx = E.sx(0.08), cy = E.sy(TECHO - 0.22);
    PALOMAS.forEach(function (pa, i) {
      var a = t / 2600 + pa.f, x = cx + Math.cos(a) * 0.32 * u * pa.r, y = cy + Math.sin(a) * 0.05 * u + pa.alt * 0.04 * u, s = 0.009 * u, ala = Math.sin(t / 90 + i) * 0.7;
      c.fillStyle = '#0a0812'; c.beginPath(); c.ellipse(x, y, s * 0.9, s * 0.4, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x - s * 0.2, y); c.lineTo(x - s * 1.4, y - s * (0.6 + ala)); c.lineTo(x + s * 0.3, y); c.moveTo(x + s * 0.2, y); c.lineTo(x + s * 1.4, y - s * (0.6 - ala)); c.lineTo(x - s * 0.3, y); c.fill();
    });
    // el palomar y su cuidador, que guía la bandada con una pértiga y una bandera roja
    var px = -0.44, ptop = techoEn(px), pX = E.sx(px), pY = E.sy(ptop - 0.012), s = u / 900;
    c.fillStyle = '#3a2a1c'; c.fillRect(pX - 70 * s, pY - 46 * s, 64 * s, 46 * s); c.fillStyle = '#5a422a'; c.fillRect(pX - 74 * s, pY - 50 * s, 72 * s, 6 * s);
    c.strokeStyle = 'rgba(170,160,150,.55)'; c.lineWidth = 1; c.beginPath(); for (var k = 0; k < 8; k++) { c.moveTo(pX - 68 * s + k * 8 * s, pY - 44 * s); c.lineTo(pX - 68 * s + k * 8 * s, pY - 4 * s); } for (k = 0; k < 5; k++) { c.moveTo(pX - 68 * s, pY - 40 * s + k * 8 * s); c.lineTo(pX - 8 * s, pY - 40 * s + k * 8 * s); } c.stroke();
    c.fillStyle = '#d8d4cc'; [[-58, -12], [-42, -28], [-26, -12]].forEach(function (q) { c.beginPath(); c.ellipse(pX + q[0] * s, pY + q[1] * s, 5 * s, 3.5 * s, 0, 0, TAU); c.fill(); });
    var ond = Math.sin(t / 380), g1 = gente(c, pX + 16 * s, pY, 82 * s, { ropa: R[3], brazoD: [2.4 + ond * 0.15, 2.9 + ond * 0.2], brazoI: [1.9, 2.6], mira: 0.35, borde: 'rgba(255,90,220,.6)' });
    var hx = pX + 16 * s + g1.mano[0], hy = pY + g1.mano[1], tx2 = hx + 70 * s + ond * 22 * s, ty2 = hy - 150 * s;
    c.strokeStyle = '#a89a6a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(hx, hy); c.lineTo(tx2, ty2); c.stroke();
    c.fillStyle = '#c8202e'; c.beginPath(); c.moveTo(tx2, ty2); c.quadraticCurveTo(tx2 + 30 * s, ty2 + 4 * s + ond * 8 * s, tx2 + 44 * s, ty2 + 10 * s + ond * 10 * s); c.lineTo(tx2 + 40 * s, ty2 + 34 * s + ond * 8 * s); c.quadraticCurveTo(tx2 + 24 * s, ty2 + 26 * s, tx2 + 2 * s, ty2 + 28 * s); c.closePath(); c.fill();
    // la pareja que mira pasar el avión bajo un paraguas
    var cx2 = 0.14, cY = E.sy(techoEn(cx2) - 0.012), cX = E.sx(cx2), av = C.avion(), mira = av ? 0.25 + 0.25 * (1 - Math.abs(av.k - 0.5) * 2) : 0.12;
    gente(c, cX + 26 * s, cY, 78 * s, { ropa: R[4], dir: -1, mira: mira, brazoD: [0.3, 0.6], borde: 'rgba(90,240,255,.6)' });
    gente(c, cX, cY, 86 * s, { ropa: R[6], paraguas: '#33f0ff', mira: mira, borde: 'rgba(255,90,220,.6)' });
    // el fumador bajo un tejadillo de chapa, al borde de la azotea
    var fx = 0.5; C.COLS.forEach(function (col) { if (col.n === 14 && col.x > 0.35) fx = Math.min(fx === 0.5 ? 9 : fx, col.x + col.w * 0.5); }); if (fx === 9) fx = 0.5;
    var fY = E.sy(techoEn(fx) - 0.012), fX = E.sx(fx);
    c.fillStyle = '#4a4a56'; c.beginPath(); c.moveTo(fX - 60 * s, fY - 112 * s); c.lineTo(fX + 50 * s, fY - 100 * s); c.lineTo(fX + 50 * s, fY - 94 * s); c.lineTo(fX - 60 * s, fY - 106 * s); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); for (k = 0; k < 10; k++) { c.moveTo(fX - 58 * s + k * 11 * s, fY - 111 * s + k * 1.2 * s); c.lineTo(fX - 58 * s + k * 11 * s, fY - 105 * s + k * 1.2 * s); } c.stroke();
    c.strokeStyle = '#2a2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(fX - 52 * s, fY - 106 * s); c.lineTo(fX - 52 * s, fY); c.moveTo(fX + 44 * s, fY - 96 * s); c.lineTo(fX + 44 * s, fY); c.stroke();
    var tir = Math.max(0, Math.sin(t / 1600)), gf = gente(c, fX - 8 * s, fY, 80 * s, { ropa: R[0], brazoD: [0.35 + tir * 0.5, 2.0 + tir * 0.6], brazoI: [0.1, 0.4], borde: 'rgba(255,190,120,.5)' });
    brasa(c, fX - 8 * s + gf.mano[0] + 3, fY + gf.mano[1] - 2, tir); humo(c, fX - 8 * s + gf.mano[0] + 3, fY + gf.mano[1] - 4, t, 3);
    for (k = 0; k < 6; k++) { var kk2 = ((t / 450) + k / 6) % 1; c.fillStyle = 'rgba(210,220,255,.55)'; c.fillRect(fX - 60 * s + k * 20 * s, fY - 100 * s + kk2 * 100 * s, 1.3, 5); }
  });

  /* ================================================================== la calle */
  function autobus(c, x, y, s, dir, t) {
    var L = 0.62 * E.u * s, H = 0.27 * E.u * s;
    c.save(); c.translate(x, y); c.scale(dir, 1);
    var gh = c.createLinearGradient(L * 0.5, 0, L * 1.3, 0); gh.addColorStop(0, 'rgba(255,240,200,.3)'); gh.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gh; c.beginPath(); c.moveTo(L * 0.5, -H * 0.15); c.lineTo(L * 1.4, 0); c.lineTo(L * 1.4, H * 0.1); c.lineTo(L * 0.5, -H * 0.05); c.fill();
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(0, -1, L * 0.52, 6, 0, 0, TAU); c.fill();
    c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(-L / 2, -H * 0.06); c.lineTo(-L / 2, -H + 8); c.quadraticCurveTo(-L / 2, -H, -L / 2 + 8, -H); c.lineTo(L / 2 - 10, -H); c.quadraticCurveTo(L / 2, -H, L / 2, -H + 10); c.lineTo(L / 2, -H * 0.06); c.closePath(); c.fill();
    c.fillStyle = '#c8202e'; c.fillRect(-L / 2, -H * 0.52, L, H * 0.07); c.fillRect(-L / 2, -H * 0.16, L, H * 0.07);
    var gr = c.createLinearGradient(0, -H, 0, 0); gr.addColorStop(0.5, 'rgba(255,43,214,0)'); gr.addColorStop(0.75, 'rgba(255,43,214,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = gr; c.fillRect(-L / 2, -H, L, H);
    // las dos filas de ventanas encendidas, con pasajeros
    [[-H * 0.92, H * 0.3], [-H * 0.44, H * 0.24]].forEach(function (fila, j) {
      for (var k = 0; k < 8; k++) {
        var wx = -L / 2 + L * 0.06 + k * L * 0.112, ww = L * 0.095;
        c.fillStyle = j ? '#ffe2a8' : '#fff0c8'; c.fillRect(wx, fila[0], ww, fila[1]);
        if (U._h(k + j * 9) > 0.35) { c.fillStyle = 'rgba(20,12,18,.85)'; c.beginPath(); c.arc(wx + ww * 0.5, fila[0] + fila[1] * 0.45, fila[1] * 0.18, 0, TAU); c.fill(); c.fillRect(wx + ww * 0.25, fila[0] + fila[1] * 0.6, ww * 0.5, fila[1] * 0.4); }
      }
    });
    c.fillStyle = '#151226'; c.fillRect(L / 2 - L * 0.05, -H * 0.4, L * 0.05, H * 0.34);
    c.fillStyle = '#1a1420'; c.fillRect(L / 2 - L * 0.14, -H * 0.98, L * 0.12, H * 0.08); c.fillStyle = '#ffb030'; c.font = '600 ' + Math.round(H * 0.06) + 'px ' + A.LAT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.scale(dir, 1); c.fillText('1A', dir * (L / 2 - L * 0.08), -H * 0.94); c.restore();
    c.fillStyle = '#fff6d8'; c.fillRect(L / 2 - 4, -H * 0.2, 4, 7); c.fillStyle = '#ff3b4f'; c.fillRect(-L / 2, -H * 0.2, 4, 7);
    [-L * 0.32, L * 0.3].forEach(function (wx) { c.fillStyle = '#05040a'; c.beginPath(); c.arc(wx, -2, H * 0.1, 0, TAU); c.fill(); c.fillStyle = '#9aa0ac'; c.beginPath(); c.arc(wx, -2, H * 0.045, 0, TAU); c.fill(); });
    c.restore();
  }
  function bici(c, x, y, h, t, dir) {
    var r = h * 0.28, ped = t / 120;
    c.save(); c.translate(x, y); c.scale(dir, 1); c.strokeStyle = '#1a1622'; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath(); c.arc(-h * 0.36, -r, r, 0, TAU); c.arc(h * 0.36, -r, r, 0, TAU); c.stroke();
    c.strokeStyle = '#c8202e'; c.lineWidth = 3; c.beginPath(); c.moveTo(-h * 0.36, -r); c.lineTo(-h * 0.06, -r * 2.3); c.lineTo(h * 0.28, -r * 2.1); c.lineTo(h * 0.36, -r); c.moveTo(-h * 0.06, -r * 2.3); c.lineTo(0, -r); c.lineTo(h * 0.28, -r * 2.1); c.stroke();
    c.strokeStyle = '#1a1622'; c.lineWidth = 2; c.beginPath(); c.moveTo(h * 0.28, -r * 2.1); c.lineTo(h * 0.25, -r * 2.7); c.lineTo(h * 0.34, -r * 2.75); c.stroke();
    c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(h * 0.38, -r * 2.5, 2.5, 0, TAU); c.fill();
    // el ciclista: la cadera en el sillín, las manos en el manillar y los pies en los pedales
    var cad = -r * 2.4, hp = h * 1.05, pie = Math.sin(ped);
    gente(c, -h * 0.06, cad + hp * 0.5, hp, { ropa: R[1], piernas: [1.0 + pie * 0.35, 0.1 + pie * 0.25, 1.0 - pie * 0.35, 0.1 - pie * 0.25], brazoD: [1.15, 1.25], brazoI: [1.05, 1.2], mira: -0.15, borde: 'rgba(255,90,220,.7)' });
    c.restore();
  }
  V.calle.push(function (c, t) {
    var u = E.u, yA = E.sy(ACERA); if (yA > E.H + 50 || yA < -0.6 * u) return;
    // los reflejos del neón, alargados sobre el asfalto mojado (como en toda calle de noche con lluvia)
    c.globalCompositeOperation = 'lighter';
    C.LETREROS.forEach(function (L, i) {
      if (L.l < 2.6 || L.azotea) return;
      var x = E.sx(L.xu), y0 = E.sy(BORDILLO) + 4, alto = (0.18 + (L.l - 2.6) * 0.3) * u, ancho = L.s * u * (L.v ? 1.1 : 2.2);
      var g = c.createLinearGradient(0, y0, 0, y0 + alto); g.addColorStop(0, U.rgba(L.c, 0.22)); g.addColorStop(1, U.rgba(L.c, 0));
      c.fillStyle = g; for (var k = 0; k < alto; k += 4) { var o = Math.sin(k * 0.3 + t / 300 + i) * 3; c.fillRect(x - ancho / 2 + o, y0 + k, ancho, 3); }
    });
    c.globalCompositeOperation = 'source-over';
    // el carrito de bolas de pescado, junto al callejón
    var cx = E.sx(-0.2), cy = E.sy(ACERA + 0.05), s = u / 900;
    gente(c, cx + 26 * s, cy - 6 * s, 84 * s, { ropa: { top: '#e8e2d4', bottom: '#2a2a34', piel: '#c4916e', pelo: '#140f12', zapato: '#0c0a10', abrigo: true }, dir: -1, brazoD: [1.0 + Math.sin(t / 500) * 0.2, 1.4 + Math.sin(t / 500) * 0.3], brazoI: [0.6, 1.0], borde: 'rgba(255,220,150,.6)' });
    c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(cx, cy, 70 * s, 6 * s, 0, 0, TAU); c.fill();
    c.fillStyle = '#3a4a5a'; c.fillRect(cx - 60 * s, cy - 58 * s, 120 * s, 46 * s); c.fillStyle = '#5a6a7a'; c.fillRect(cx - 60 * s, cy - 58 * s, 120 * s, 4 * s);
    c.fillStyle = '#a8b8c0'; c.fillRect(cx - 40 * s, cy - 74 * s, 36 * s, 16 * s); c.fillRect(cx + 4 * s, cy - 74 * s, 36 * s, 16 * s);
    c.fillStyle = '#c8202e'; c.beginPath(); c.moveTo(cx - 80 * s, cy - 130 * s); c.lineTo(cx + 80 * s, cy - 130 * s); c.lineTo(cx + 70 * s, cy - 112 * s); c.lineTo(cx - 70 * s, cy - 112 * s); c.fill();
    c.fillStyle = '#fff'; for (var k = 0; k < 8; k++) c.fillRect(cx - 80 * s + k * 20 * s, cy - 130 * s, 10 * s, 18 * s);
    c.strokeStyle = '#2a2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 66 * s, cy - 112 * s); c.lineTo(cx - 62 * s, cy - 12 * s); c.moveTo(cx + 66 * s, cy - 112 * s); c.lineTo(cx + 62 * s, cy - 12 * s); c.stroke();
    var gb = c.createRadialGradient(cx, cy - 100 * s, 0, cx, cy - 100 * s, 90 * s); gb.addColorStop(0, 'rgba(255,220,150,.45)'); gb.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = gb; c.fillRect(cx - 90 * s, cy - 190 * s, 180 * s, 180 * s);
    c.fillStyle = '#fff4c8'; c.beginPath(); c.arc(cx, cy - 100 * s, 5 * s, 0, TAU); c.fill();
    c.fillStyle = '#ffe9b0'; c.fillRect(cx - 34 * s, cy - 50 * s, 68 * s, 22 * s); c.fillStyle = '#c8202e'; c.font = '700 ' + Math.round(16 * s) + 'px ' + A.CJK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('魚蛋', cx, cy - 39 * s);
    for (k = 0; k < 4; k++) { var kk = ((t / 1800) + k / 4) % 1, px = cx - 20 * s + Math.sin(kk * 6 + k) * 8 * s, py = cy - 80 * s - kk * 70 * s, rr = (12 + kk * 30) * s, g2 = c.createRadialGradient(px, py, 0, px, py, rr); g2.addColorStop(0, 'rgba(240,230,255,' + (0.18 * Math.sin(Math.PI * kk)).toFixed(3) + ')'); g2.addColorStop(1, 'rgba(240,230,255,0)'); c.fillStyle = g2; c.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
    // el autobús de dos pisos (uno cada 40 s)
    var kb = ((t + 12000) % 40000) / 11000; if (kb < 1 && !C.sinTrafico) autobus(c, E.sx(U.lerp(-E.W / 2 / u - 0.4, E.W / 2 / u + 0.4, kb)), E.sy(3.84), 1, 1, t);
    // el ciclista (cada 23 s) y alguien corriendo con el periódico en la cabeza (cada 31 s)
    var kc = ((t + 5000) % 23000) / 7000; if (kc < 1) bici(c, E.sx(U.lerp(E.W / 2 / u + 0.1, -E.W / 2 / u - 0.1, kc)), E.sy(3.7), 0.085 * u, t, -1);
    var kr = ((t + 17000) % 31000) / 5500;
    if (kr < 1) { var rx = E.sx(U.lerp(-E.W / 2 / u - 0.1, E.W / 2 / u + 0.1, kr)), ry = E.sy(ACERA + 0.052), hr = 0.085 * u; gente(c, rx, ry, hr, { ropa: R[2], fase: t / 90, corre: true, brazoD: [2.6, 3.2], brazoI: [2.4, 3.1], mira: -0.1, borde: 'rgba(90,240,255,.7)' }); c.save(); c.translate(rx, ry - hr * 0.97); c.rotate(0.15); c.fillStyle = '#e8e0cc'; c.fillRect(-hr * 0.14, -hr * 0.03, hr * 0.28, hr * 0.05); c.fillStyle = 'rgba(40,40,50,.5)'; for (var ln = 0; ln < 4; ln++) c.fillRect(-hr * 0.12 + ln * hr * 0.065, -hr * 0.02, hr * 0.04, 1); c.restore(); }
    // un gato que cruza la acera (cada 47 s)
    var kg = ((t + 30000) % 47000) / 6000;
    if (kg < 1) { var gx = E.sx(U.lerp(0.5, -0.5, kg)), gy = E.sy(ACERA + 0.03), gs = 0.012 * u, paso = Math.sin(t / 70); c.fillStyle = '#07060d'; c.beginPath(); c.ellipse(gx, gy - gs, gs * 1.4, gs * 0.55, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(gx - gs * 1.4, gy - gs * 1.5, gs * 0.5, 0, TAU); c.fill(); c.fillRect(gx - gs, gy - gs, 2, gs * (1 + paso * 0.3)); c.fillRect(gx + gs, gy - gs, 2, gs * (1 - paso * 0.3)); c.strokeStyle = '#07060d'; c.lineWidth = 2; c.beginPath(); c.moveTo(gx + gs * 1.3, gy - gs * 1.2); c.quadraticCurveTo(gx + gs * 2.4, gy - gs * 2.6, gx + gs * 2.2, gy - gs * 3); c.stroke(); }
  });

  /* ================================================================== delante: letreros enormes colgados sobre la calle */
  var GRANDES = [
    { t: '大押', lado: -1, l: 2.72, s: 0.07, c: '#4dff88' },     // gran casa de empeños
    { t: '酒樓', lado: 1, l: 2.86, s: 0.075, c: '#ff3b4f' },     // restaurante cantonés
    { t: '藥房', lado: -1, l: 3.2, s: 0.06, c: '#33f0ff' },      // farmacia
    { t: '金行', lado: 1, l: 3.32, s: 0.065, c: '#ffe14d' }      // joyería de oro
  ];
  var cacheGrandes = {};
  function spriteGrande(G) {
    var s = G.s * E.u, k = G.t + '|' + Math.round(s) + '|' + E.dpr; if (cacheGrandes[k]) return cacheGrandes[k];
    var L = { t: G.t, c: G.c, v: true, caja: true }, g = A.letreroGeo(L, 0, 0, s), lz = A.letreroLuz(L, g, E.dpr), cv = document.createElement('canvas');
    cv.width = Math.ceil(lz.w * E.dpr); cv.height = Math.ceil(lz.h * E.dpr); var x = cv.getContext('2d'); x.scale(E.dpr, E.dpr);
    var g2 = A.letreroGeo(L, lz.w / 2, lz.h / 2, s); A.letreroTabla(x, L, g2);
    x.globalCompositeOperation = 'lighter'; x.drawImage(lz.c, 0, 0, lz.w, lz.h);
    return (cacheGrandes[k] = { c: cv, w: lz.w, h: lz.h, bw: g.w, bh: g.h });
  }
  V.delante.push(function (c, t) {
    var mitad = E.W / 2 / E.u;
    GRANDES.forEach(function (G, i) {
      var y = E.sy(G.l, 1.12); if (!enPantalla(y, G.s * E.u * 4)) return;
      var sp = spriteGrande(G), x = E.sx(G.lado * (mitad - 0.035 - G.s * 0.15));
      // el brazo de hierro que lo sujeta a la pared (fuera de la pantalla)
      c.strokeStyle = '#05040a'; c.lineWidth = 5; c.beginPath(); var bordeX = G.lado < 0 ? -10 : E.W + 10; c.moveTo(bordeX, y - sp.bh * 0.45); c.lineTo(x, y - sp.bh * 0.45); c.moveTo(bordeX, y - sp.bh * 0.1); c.lineTo(x - G.lado * sp.bw * 0.3, y - sp.bh * 0.45); c.stroke();
      var on = U._h(Math.floor(t / 110) + i * 5) > 0.97 ? 0.7 : 1;
      c.globalAlpha = on; c.drawImage(sp.c, x - sp.w / 2, y - sp.h / 2, sp.w, sp.h); c.globalAlpha = 1;
      // el agua que chorrea del borde de abajo
      if (C.lluvia > 0.3) { c.fillStyle = 'rgba(200,215,255,.4)'; for (var k = 0; k < 3; k++) { var kk = ((t / 600) + k / 3 + i * 0.3) % 1; c.fillRect(x - sp.bw * 0.3 + k * sp.bw * 0.3, y + sp.bh / 2 + kk * 60, 1.5, 6); } }
    });
  });
  E.en('tamano', function () { cacheGrandes = {}; });
})();
