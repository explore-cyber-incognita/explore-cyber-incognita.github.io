/* Cyber Incognita · arte
   Las piezas de la ciudad amurallada en el estilo A (Pau, 01/11/2026: «la versión A es la mejor, me encanta»): ilustración
   de cine nocturna, con el neón que brilla y tiñe las paredes, ventanas encendidas con sus rejas y aires acondicionados,
   el bosque de antenas, la lluvia y la calle mojada. Todo en píxeles; la paleta es una sola (siempre es de noche). */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util;
  var TAU = Math.PI * 2;
  var A = NI.arte = {};
  var CJK = '"Noto Sans TC", "PingFang TC", "Heiti TC", "Microsoft JhengHei", sans-serif';
  var LAT = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  A.CJK = CJK; A.LAT = LAT;

  A.P = {
    cielo: [[0, '#05040f'], [0.5, '#130c2a'], [0.8, '#2e1440'], [1, '#5a1f4e']], nube: 'rgba(170,70,140,', silueta: '#07060d',
    lejos: '#100c1e', lejosLuz: 'rgba(255,205,140,.55)', vecino: ['#0d0a18', '#15111f'],
    muro: ['#1b1726', '#2b2333', '#241c2c', '#1e2230', '#2a2026'], muroLuz: '#3c3248', muroSombra: 'rgba(0,0,0,.4)', mancha: 'rgba(0,0,0,.2)',
    marco: '#0b0912', calida: ['#ffd88a', '#d8823c'], fluor: ['#d2fff6', '#4fc9d8'], tv: ['#8aa8ff', '#3a4aa8'], oscura: ['#15111e', '#0b0910'],
    interior: 'rgba(28,16,24,.8)', cortina: ['rgba(190,40,90,.6)', 'rgba(60,120,90,.6)', 'rgba(200,150,60,.55)'], reja: '#3d3549', ac: '#4a4458', acLinea: '#26212e',
    tuberia: '#2a2434', cable: 'rgba(6,5,10,.95)', antena: '#211c2c', tanque: '#2b2536',
    tienda: '#15111d', persiana: '#3c3644', persianaLinea: 'rgba(0,0,0,.35)', callejon: '#040309',
    acera: '#1c1824', calle: '#0b0a12', bordillo: '#36303f', lluvia: '#c8d2ff'
  };

  /* ---------- letreros de neón ----------
     L = { t, xu, l, s (alto de letra en u), c (color), v (vertical), lat (letras latinas), caja (marco de tubo) }
     La tabla (y los tubos apagados) se pinta en la tesela; la luz es un sprite aparte que se dibuja en vivo con
     'lighter', así parpadea sin repintar nada. */
  A.letreroGeo = function (L, x, y, s) {
    var chars = L.lat && !L.v ? [L.t] : Array.from(L.t), paso = L.lat ? 0.95 : 1.1, w, h;
    var m = document.createElement('canvas').getContext('2d');
    m.font = (L.lat ? '600 ' : '700 ') + s + 'px ' + (L.lat ? LAT : CJK);
    if (L.v) { w = s * (L.lat ? 1.05 : 1.2); h = chars.length * s * paso + s * 0.45; }
    else { w = m.measureText(L.t).width + s * 0.7; h = s * 1.45; }
    return { x: x, y: y, s: s, w: w, h: h, x0: x - w / 2, y0: y - h / 2, chars: chars, paso: paso, font: m.font };
  };
  function trazarLetras(c, L, g, skip, solo) {
    c.font = g.font; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (L.v) g.chars.forEach(function (ch, i) { if (i === skip || (solo != null && i !== solo)) return; c.strokeText(ch, g.x, g.y0 + g.s * 0.22 + (i + 0.5) * g.s * g.paso); });
    else if (solo == null || solo === 0) c.strokeText(L.t, g.x, g.y + g.s * 0.05);
  }
  A.letreroTabla = function (c, L, g) {
    c.save();
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(g.x0 + 5, g.y0 + 7, g.w, g.h);
    c.fillStyle = '#0c0a14'; c.fillRect(g.x0, g.y0, g.w, g.h);
    c.strokeStyle = U.rgba(L.c, 0.22); c.lineWidth = 1.5; c.strokeRect(g.x0 + 0.5, g.y0 + 0.5, g.w - 1, g.h - 1);
    // los soportes que la sujetan a la pared
    c.strokeStyle = '#2a2433'; c.lineWidth = 2; c.beginPath();
    if (L.v) { c.moveTo(g.x0 + g.w, g.y0 + g.h * 0.15); c.lineTo(g.x0 + g.w + 10, g.y0 + g.h * 0.12); c.moveTo(g.x0 + g.w, g.y0 + g.h * 0.85); c.lineTo(g.x0 + g.w + 10, g.y0 + g.h * 0.88); }
    else { c.moveTo(g.x0 + g.w * 0.2, g.y0); c.lineTo(g.x0 + g.w * 0.2, g.y0 - 10); c.moveTo(g.x0 + g.w * 0.8, g.y0); c.lineTo(g.x0 + g.w * 0.8, g.y0 - 10); }
    c.stroke();
    // los tubos apagados: vidrio con un poco de color
    c.lineJoin = 'round'; c.strokeStyle = U.rgba(L.c, 0.28); c.lineWidth = g.s * 0.085; trazarLetras(c, L, g);
    if (L.caja) { c.lineWidth = g.s * 0.05; c.strokeRect(g.x0 + g.s * 0.14, g.y0 + g.s * 0.14, g.w - g.s * 0.28, g.h - g.s * 0.28); }
    c.restore();
  };
  // la luz de un letrero (halo + tubos encendidos) en un lienzo propio; skip/solo: para la letra rota que parpadea
  A.letreroLuz = function (L, g, dpr, skip, solo) {
    var m = g.s * 1.6, cw = g.w + m * 2, ch = g.h + m * 2, cv = document.createElement('canvas');
    cv.width = Math.ceil(cw * dpr); cv.height = Math.ceil(ch * dpr);
    var c = cv.getContext('2d'); c.scale(dpr, dpr);
    var gg = { x: cw / 2, y: ch / 2, s: g.s, w: g.w, h: g.h, x0: m, y0: m, chars: g.chars, paso: g.paso, font: g.font };
    if (solo == null) {
      var R = Math.max(g.w, g.h) * 0.5 + m, hal = c.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, R);
      hal.addColorStop(0, U.rgba(L.c, 0.24)); hal.addColorStop(0.5, U.rgba(L.c, 0.08)); hal.addColorStop(1, U.rgba(L.c, 0));
      c.fillStyle = hal; c.fillRect(0, 0, cw, ch);
    }
    c.lineJoin = 'round'; c.shadowColor = L.c;
    c.shadowBlur = g.s * 0.42; c.strokeStyle = L.c; c.lineWidth = g.s * 0.08; trazarLetras(c, L, gg, skip, solo);
    c.shadowBlur = g.s * 0.25; trazarLetras(c, L, gg, skip, solo);
    c.shadowBlur = g.s * 0.1; c.strokeStyle = U.mezcla(L.c, '#ffffff', 0.72); c.lineWidth = g.s * 0.032; trazarLetras(c, L, gg, skip, solo);
    if (L.caja && solo == null) { c.shadowBlur = g.s * 0.45; c.strokeStyle = L.c; c.lineWidth = g.s * 0.05; c.strokeRect(m + g.s * 0.14, m + g.s * 0.14, g.w - g.s * 0.28, g.h - g.s * 0.28); }
    return { c: cv, w: cw, h: ch, m: m };
  };

  /* ---------- ventanas ---------- */
  A.ventana = function (c, P, x, y, w, h, v, r) {
    var col = P[v.estado];
    c.fillStyle = P.marco; c.fillRect(x - 2, y - 2, w + 4, h + 4);
    var gv = c.createLinearGradient(0, y, 0, y + h); gv.addColorStop(0, col[0]); gv.addColorStop(1, col[1]); c.fillStyle = gv; c.fillRect(x, y, w, h);
    if (v.estado !== 'oscura') {
      // el interior: una silueta, una lámpara, un estante; o una cortina de color
      if (v.dentro < 0.22) {
        // alguien en la habitación, a su escala (asoma de cintura para arriba), de color y visto a través del cristal
        c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
        A.cuerpo(c, x + w * (0.3 + v.dentro * 2), y + h * 1.0, h * 0.94, { ropa: A.ROPAS[Math.floor(v.dentro * 97) % A.ROPAS.length], dir: v.dentro < 0.11 ? 1 : -1, brazoD: [0.4, 0.9], brazoI: [0.2, 0.5] });
        var gv2 = c.createLinearGradient(0, y, 0, y + h); gv2.addColorStop(0, U.rgba(col[0], 0.28)); gv2.addColorStop(1, U.rgba(col[1], 0.18)); c.fillStyle = gv2; c.fillRect(x, y, w, h);
        c.restore();
      }
      else if (v.dentro < 0.4) { c.fillStyle = P.interior; c.fillRect(x, y + h * 0.62, w, h * 0.06); c.fillRect(x + w * 0.1, y + h * 0.4, w * 0.12, h * 0.22); c.fillRect(x + w * 0.3, y + h * 0.47, w * 0.2, h * 0.15); }
      else if (v.dentro > 0.72) { c.fillStyle = P.cortina[Math.floor(v.dentro * 30) % 3]; c.fillRect(x, y, w * 0.34, h); c.fillRect(x + w * 0.74, y, w * 0.26, h); }
    } else if (v.dentro > 0.7) { c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(x + 2, y + 2, w * 0.3, h - 4); }
    // el marco de aluminio: dos hojas
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * 0.3); c.lineTo(x + w, y + h * 0.3); c.stroke();
    if (v.jaula) A.jaula(c, P, x, y, w, h, r);
    if (v.ac) A.ac(c, P, x + w * 0.08, y + h + 6, w * 0.84);
    if (v.ropa) A.ropa(c, x - w * 0.4, x + w * 1.4, y + h + 3, r);
  };
  // la «jaula»: la reja que sobresale de la ventana, con su repisa y macetas
  A.jaula = function (c, P, x, y, w, h, r) {
    var m = Math.max(4, w * 0.12), x0 = x - m, y0 = y - m * 0.6, x1 = x + w + m, y1 = y + h + m * 0.9;
    c.strokeStyle = P.reja; c.lineWidth = 1.3;
    c.strokeRect(x0, y0, x1 - x0, y1 - y0);
    c.beginPath(); for (var b = 1; b < 7; b++) { var bx = x0 + (x1 - x0) * b / 7; c.moveTo(bx, y0); c.lineTo(bx, y1); } c.moveTo(x0, y0 + (y1 - y0) * 0.55); c.lineTo(x1, y0 + (y1 - y0) * 0.55); c.stroke();
    c.fillStyle = '#2e2838'; c.fillRect(x0 - 2, y1 - 3, x1 - x0 + 4, 4);
    // macetas con plantas
    for (var k = 0; k < 3; k++) { if (r() < 0.45) continue; var px = x0 + 4 + k * (x1 - x0 - 8) / 3; c.fillStyle = '#4a2a22'; c.fillRect(px, y1 - 9, 7, 6); c.fillStyle = '#1e3a24'; c.beginPath(); c.arc(px + 3.5, y1 - 11, 5, 0, TAU); c.fill(); }
  };
  A.ac = function (c, P, x, y, w) {
    var h = Math.max(8, w * 0.42);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x + 3, y + 3, w, h);
    c.fillStyle = P.ac; c.fillRect(x, y, w, h);
    c.fillStyle = '#5a5468'; c.fillRect(x, y, w, 2);
    c.strokeStyle = P.acLinea; c.lineWidth = 1; c.beginPath(); for (var a = 3; a < h - 2; a += 2.5) { c.moveTo(x + w * 0.08, y + a); c.lineTo(x + w * 0.55, y + a); } c.stroke();
    c.beginPath(); c.arc(x + w * 0.76, y + h / 2, h * 0.32, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + w * 0.45, y + h, 2, 6 + w * 0.2);
  };
  A.ropa = function (c, x0, x1, y, r) {
    c.strokeStyle = '#2a2433'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + 4, x1, y); c.stroke();
    var COL = ['#a8344e', '#3a5a9a', '#d8d0c0', '#5a8a6a', '#c8a040', '#7a4a9a'];
    for (var x = x0 + 4; x < x1 - 8; x += 9 + r() * 6) { var t = (x - x0) / (x1 - x0), yy = y + 4 * 4 * t * (1 - t); c.fillStyle = COL[Math.floor(r() * COL.length)]; c.globalAlpha = 0.75; if (r() < 0.5) c.fillRect(x, yy, 7, 9 + r() * 6); else { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + 9, yy); c.lineTo(x + 8, yy + 12); c.lineTo(x + 1, yy + 12); c.closePath(); c.fill(); } }
    c.globalAlpha = 1;
  };

  /* ---------- la azotea ---------- */
  A.antena = function (c, x, y, h, brazos, incl, color) {
    var tx = x + incl * h;
    c.strokeStyle = color; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(tx, y - h);
    for (var b = 0; b < brazos; b++) { var k = 0.5 + b * 0.13, yy = y - h * k, xx = x + incl * h * k, l = h * 0.22 - b * h * 0.03; c.moveTo(xx - l, yy); c.lineTo(xx + l, yy); }
    c.stroke();
  };
  A.tanque = function (c, P, x, y, w, h) {
    c.fillStyle = P.tanque; c.fillRect(x, y - h, w, h);
    c.fillStyle = '#3e364a'; c.fillRect(x, y - h, w, 2);
    c.strokeStyle = '#1a1622'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 3, y - h * 0.5); c.lineTo(x + w - 3, y - h * 0.5); c.stroke();
    c.fillStyle = '#1a1622'; c.fillRect(x + w * 0.2, y, 3, 6); c.fillRect(x + w * 0.75, y, 3, 6);
  };

  /* ---------- tiendas ---------- */
  var GENERO = ['#c8202e', '#ffd84d', '#3a8ad8', '#4dbf6a', '#e8e0d0', '#ff8a3d', '#b46bff', '#ff5aa8'];
  A.tienda = function (c, P, x, y, w, h, abierta, calida, r) {
    c.fillStyle = P.tienda; c.fillRect(x, y, w, h);
    // arriba, el entresuelo con su ventana y el rótulo de la tienda (una caja de luz)
    var ent = h * 0.3; c.fillStyle = '#100d17'; c.fillRect(x, y, w, ent);
    c.fillStyle = r() < 0.5 ? P.calida[1] : P.fluor[1]; c.globalAlpha = 0.7; c.fillRect(x + w * 0.15, y + ent * 0.12, w * 0.7, ent * 0.42); c.globalAlpha = 1;
    c.strokeStyle = '#06050a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w / 2, y + ent * 0.12); c.lineTo(x + w / 2, y + ent * 0.54); c.stroke();
    var CAJA = ['#f4efe2', '#ffe9a8', '#cfeaff', '#ffd0e0'], cb = CAJA[Math.floor(r() * CAJA.length)];
    c.fillStyle = cb; c.fillRect(x + 3, y + ent * 0.62, w - 6, ent * 0.34);
    // el nombre de la tienda, en letra china: ultramarinos, ferretería, farmacia, tienda, panadería, asados, periódicos, relojes, lavandería
    var NOMBRES = ['雜貨', '五金', '藥房', '士多', '餅家', '燒臘', '書報', '鐘錶', '洗衣'], nom = NOMBRES[Math.floor(r() * NOMBRES.length)];
    c.fillStyle = ['#c8202e', '#1a3a8a', '#0e5a3a', '#1a1420'][Math.floor(r() * 4)]; c.font = '700 ' + Math.round(ent * 0.26) + 'px ' + CJK; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(nom, x + w / 2, y + ent * 0.8);
    y += ent; h -= ent;
    var alto = (h - 14) * abierta;
    var col = calida ? P.calida : P.fluor, gi = c.createLinearGradient(0, y, 0, y + h); gi.addColorStop(0, col[0]); gi.addColorStop(1, col[1]);
    c.fillStyle = gi; c.fillRect(x + 5, y + 8, w - 10, h - 10);
    // dentro: estanterías, cajas, una persona
    // el fluorescente del techo, estanterías llenas de género de colores y alguien detrás del mostrador
    c.fillStyle = '#ffffff'; c.globalAlpha = 0.8; c.fillRect(x + w * 0.2, y + 9, w * 0.6, 2); c.globalAlpha = 1;
    for (var e = 0; e < 3; e++) {
      var ey = y + 16 + e * (h - 24) / 3, eh = (h - 24) / 3 - 6;
      c.fillStyle = 'rgba(30,18,24,.55)'; c.fillRect(x + 7, ey + eh, w - 14, 3);
      for (var xx = x + 9; xx < x + w - 12; xx += 4 + r() * 6) { if (r() < 0.25) continue; c.fillStyle = GENERO[Math.floor(r() * GENERO.length)]; c.globalAlpha = 0.75; var bh = eh * (0.4 + r() * 0.55); c.fillRect(xx, ey + eh - bh, 3 + r() * 4, bh); }
      c.globalAlpha = 1;
    }
    if (r() < 0.6) { c.fillStyle = 'rgba(20,12,18,.85)'; c.fillRect(x + w * 0.52, y + h * 0.5, w * 0.14, h * 0.5); c.beginPath(); c.arc(x + w * 0.59, y + h * 0.44, w * 0.06, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(40,24,30,.8)'; c.fillRect(x + 5, y + h * 0.78, w - 10, h * 0.22);
    // la persiana metálica, medio bajada
    c.fillStyle = P.persiana; c.fillRect(x + 5, y + 8, w - 10, h - 10 - alto);
    c.strokeStyle = P.persianaLinea; c.lineWidth = 1; c.beginPath(); for (var yy = y + 11; yy < y + h - 2 - alto; yy += 4) { c.moveTo(x + 5, yy); c.lineTo(x + w - 5, yy); } c.stroke();
    if (alto < h - 14) { c.fillStyle = '#5a5464'; c.fillRect(x + 5, y + h - 4 - alto, w - 10, 3); }
  };

  /* ---------- coches de Hong Kong: el taxi rojo de techo plateado y el minibús crema de techo rojo ---------- */
  A.coche = function (c, x, y, s, tipo, dir) {
    var mini = tipo === 'minibus', L = (mini ? 190 : 170) * s, alto = (mini ? 78 : 50) * s, rr = 12 * s;
    c.save(); c.translate(x, y); c.scale(dir, 1);
    var gh = c.createLinearGradient(L * 0.5, 0, L * 1.6, 0); gh.addColorStop(0, 'rgba(255,240,200,.35)'); gh.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = gh; c.beginPath(); c.moveTo(L * 0.48, -rr * 1.2); c.lineTo(L * 1.7, -2); c.lineTo(L * 1.7, rr * 1.2); c.lineTo(L * 0.48, -rr * 0.6); c.fill();
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(0, -1, L * 0.52, 5 * s, 0, 0, TAU); c.fill();
    var cuerpo = new Path2D();
    if (mini) { cuerpo.moveTo(-L * 0.5, -rr * 0.6); cuerpo.lineTo(-L * 0.5, -alto + 6 * s); cuerpo.quadraticCurveTo(-L * 0.5, -alto, -L * 0.46, -alto); cuerpo.lineTo(L * 0.4, -alto); cuerpo.quadraticCurveTo(L * 0.5, -alto + 2 * s, L * 0.5, -alto * 0.55); cuerpo.lineTo(L * 0.5, -rr * 0.6); cuerpo.closePath(); }
    else { cuerpo.moveTo(-L * 0.5, -rr * 0.6); cuerpo.lineTo(-L * 0.5, -alto * 0.52); cuerpo.lineTo(-L * 0.36, -alto * 0.56); cuerpo.lineTo(-L * 0.24, -alto); cuerpo.lineTo(L * 0.14, -alto); cuerpo.lineTo(L * 0.27, -alto * 0.58); cuerpo.lineTo(L * 0.48, -alto * 0.52); cuerpo.lineTo(L * 0.5, -rr * 0.6); cuerpo.closePath(); }
    c.fillStyle = mini ? '#e9dfc4' : '#c8202e'; c.fill(cuerpo);
    c.save(); c.clip(cuerpo);
    if (mini) { c.fillStyle = '#c8202e'; c.fillRect(-L, -alto - 2, L * 2, 14 * s); c.fillStyle = '#c9bfa4'; c.fillRect(-L, -rr * 1.6, L * 2, rr); }
    else { c.fillStyle = '#c9ccd4'; c.fillRect(-L, -alto - 2, L * 2, alto * 0.47); }
    var gr = c.createLinearGradient(0, -alto, 0, 0); gr.addColorStop(0, 'rgba(255,43,214,0)'); gr.addColorStop(0.55, 'rgba(255,43,214,.22)'); gr.addColorStop(0.62, 'rgba(51,240,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.35)');
    c.fillStyle = gr; c.fillRect(-L, -alto, L * 2, alto);
    c.restore();
    c.fillStyle = '#151226';
    if (mini) { for (var k = 0; k < 5; k++) c.fillRect(-L * 0.45 + k * L * 0.17, -alto * 0.86, L * 0.14, alto * 0.32); c.fillRect(L * 0.4, -alto * 0.86, L * 0.08, alto * 0.38); }
    else { c.beginPath(); c.moveTo(-L * 0.21, -alto * 0.94); c.lineTo(-0.02 * L, -alto * 0.94); c.lineTo(-0.02 * L, -alto * 0.6); c.lineTo(-L * 0.33, -alto * 0.6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0.02 * L, -alto * 0.94); c.lineTo(L * 0.12, -alto * 0.94); c.lineTo(L * 0.23, -alto * 0.6); c.lineTo(0.02 * L, -alto * 0.6); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(51,240,255,.35)'; c.fillRect(-L * 0.12, -alto * 0.9, 3 * s, alto * 0.26); c.fillStyle = 'rgba(255,43,214,.35)'; c.fillRect(L * 0.06, -alto * 0.9, 2 * s, alto * 0.26);
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.2; c.beginPath();
    if (mini) { c.moveTo(L * 0.3, -alto * 0.5); c.lineTo(L * 0.3, -rr * 0.7); } else { c.moveTo(-0.02 * L, -alto * 0.56); c.lineTo(-0.02 * L, -rr * 0.7); c.moveTo(-L * 0.25, -alto * 0.52); c.lineTo(-L * 0.25, -rr * 0.7); }
    c.stroke();
    c.fillStyle = '#2a2a30'; c.fillRect(-L * 0.52, -rr, 8 * s, 6 * s); c.fillRect(L * 0.47, -rr, 8 * s, 6 * s);
    c.fillStyle = '#fff6d8'; c.fillRect(L * 0.47, -alto * (mini ? 0.42 : 0.46), 5 * s, 6 * s);
    c.fillStyle = '#ff3b4f'; c.fillRect(-L * 0.51, -alto * (mini ? 0.42 : 0.46), 5 * s, 6 * s);
    if (!mini) { c.fillStyle = '#ffe9b0'; c.fillRect(-12 * s, -alto - 8 * s, 24 * s, 8 * s); c.fillStyle = '#1a1420'; c.font = '600 ' + Math.max(5, Math.round(6 * s)) + 'px ' + LAT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.scale(dir, 1); c.fillText('TAXI', 0, -alto - 4 * s); c.restore(); }
    else { c.fillStyle = '#ffe9b0'; c.fillRect(L * 0.28, -alto + 4 * s, L * 0.18, 8 * s); }
    [mini ? -L * 0.32 : -L * 0.3, L * 0.3].forEach(function (wx) {
      c.fillStyle = '#05040a'; c.beginPath(); c.arc(wx, -rr * 0.15, rr * 1.15, Math.PI, 0); c.fill();
      c.fillStyle = '#121018'; c.beginPath(); c.arc(wx, -rr * 0.05, rr, 0, TAU); c.fill();
      c.fillStyle = '#9aa0ac'; c.beginPath(); c.arc(wx, -rr * 0.05, rr * 0.5, 0, TAU); c.fill();
      c.fillStyle = '#121018'; c.beginPath(); c.arc(wx, -rr * 0.05, rr * 0.15, 0, TAU); c.fill();
    });
    c.restore();
  };

  /* ---------- el 747 que baja hacia Kai Tak: de perfil, con la joroba, las luces de aterrizaje y las balizas ---------- */
  A.avion = function (c, x, y, s, t) {
    c.save(); c.translate(x, y); c.rotate(-0.08);
    // los conos de las luces de aterrizaje, hacia delante y abajo
    c.globalCompositeOperation = 'lighter';
    [-0.42, 0.02].forEach(function (lx) {
      var g = c.createRadialGradient(s * lx, s * 0.02, 0, s * lx, s * 0.02, s * 0.9); g.addColorStop(0, 'rgba(255,250,230,.26)'); g.addColorStop(1, 'rgba(255,250,230,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(s * lx, s * 0.02); c.lineTo(s * lx - s * 1.1, s * 0.55); c.lineTo(s * lx - s * 0.55, s * 0.85); c.closePath(); c.fill();
    });
    c.globalCompositeOperation = 'source-over';
    var p = new Path2D();
    p.moveTo(-s * 0.5, 0); p.quadraticCurveTo(-s * 0.44, -s * 0.05, -s * 0.3, -s * 0.06); p.lineTo(s * 0.4, -s * 0.045); p.quadraticCurveTo(s * 0.52, -s * 0.03, s * 0.55, 0); p.quadraticCurveTo(s * 0.5, s * 0.03, s * 0.4, s * 0.035); p.lineTo(-s * 0.42, s * 0.03); p.closePath();
    p.moveTo(-s * 0.02, 0); p.lineTo(s * 0.18, s * 0.28); p.lineTo(s * 0.25, s * 0.28); p.lineTo(s * 0.12, 0); p.closePath();
    p.moveTo(s * 0.36, -s * 0.03); p.lineTo(s * 0.5, -s * 0.2); p.lineTo(s * 0.55, -s * 0.2); p.lineTo(s * 0.5, -s * 0.02); p.closePath();
    p.moveTo(-s * 0.36, -s * 0.06); p.quadraticCurveTo(-s * 0.3, -s * 0.11, -s * 0.18, -s * 0.07); p.closePath();
    c.fillStyle = '#0a0914'; c.fill(p);
    // la panza, iluminada por la ciudad (magenta) y las ventanillas
    c.save(); c.clip(p); var gp = c.createLinearGradient(0, -s * 0.06, 0, s * 0.04); gp.addColorStop(0, 'rgba(0,0,0,0)'); gp.addColorStop(1, 'rgba(255,60,190,.45)'); c.fillStyle = gp; c.fillRect(-s, -s * 0.1, s * 2, s * 0.2); c.restore();
    c.fillStyle = 'rgba(255,220,160,.8)'; for (var k = 0; k < 22; k++) c.fillRect(-s * 0.32 + k * s * 0.03, -s * 0.03, s * 0.012, s * 0.012);
    // el tren de aterrizaje, ya bajado
    c.strokeStyle = '#0a0914'; c.lineWidth = Math.max(1.5, s * 0.012); c.beginPath(); c.moveTo(-s * 0.36, s * 0.03); c.lineTo(-s * 0.36, s * 0.08); c.moveTo(s * 0.06, s * 0.035); c.lineTo(s * 0.06, s * 0.09); c.stroke();
    c.fillStyle = '#0a0914'; c.beginPath(); c.arc(-s * 0.36, s * 0.09, s * 0.014, 0, TAU); c.arc(s * 0.06, s * 0.1, s * 0.014, 0, TAU); c.fill();
    // balizas: la roja de abajo parpadea, la blanca de la cola destella
    var b = (t || 0) % 1200;
    if (b < 120) { c.fillStyle = '#ff3b4f'; c.shadowColor = '#ff3b4f'; c.shadowBlur = 12; c.beginPath(); c.arc(-s * 0.1, s * 0.04, 3.5, 0, TAU); c.fill(); }
    if (b > 600 && b < 680) { c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 14; c.beginPath(); c.arc(s * 0.54, -s * 0.2, 3, 0, TAU); c.fill(); }
    c.shadowBlur = 0; c.fillStyle = '#7dff9a'; c.beginPath(); c.arc(s * 0.2, s * 0.28, 2.5, 0, TAU); c.fill();
    c.restore();
  };

  /* ---------- la gente (Pau: «los muñequitos no me gustan»): siluetas de película con volumen, ropa y un filo de neón ----------
     (x, y) = los pies; h = altura en px. op: color, borde (el filo de luz), dir (1 mira a la derecha, −1 a la izquierda),
     fase (al andar), corre, sentado, paraguas (color de la tela), abrigo, falda, pelo ('corto' | 'largo' | 'mono' | 'gorra'),
     brazoI / brazoD: [hombro, codo] en rad (0 = colgando, positivo = hacia delante), mira (inclina la cabeza arriba). */
  function miembro(c, x, y, a1, l1, w1, a2, l2, w2) {
    var x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2;
    c.lineWidth = w1; c.beginPath(); c.moveTo(x, y); c.lineTo(x1, y1); c.stroke();
    c.lineWidth = w2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    return [x2, y2];
  }
  // la ropa: colores de noche (apagados, que el neón levanta)
  A.ROPAS = [
    { top: '#7a1f2e', bottom: '#1d2333', piel: '#b98364', pelo: '#140f14', zapato: '#0c0a10' },
    { top: '#23466e', bottom: '#2a2420', piel: '#c4916e', pelo: '#1a1210', zapato: '#100c0c' },
    { top: '#e2d6c0', bottom: '#2a2f3a', piel: '#a87458', pelo: '#0e0c12', zapato: '#1a1414' },
    { top: '#2f5a44', bottom: '#191a24', piel: '#c99a78', pelo: '#2a1a12', zapato: '#0c0a10' },
    { top: '#5a3a6e', bottom: '#5a3a6e', piel: '#b98364', pelo: '#120c10', zapato: '#0c0a10', falda: true, pelo2: 'largo' },
    { top: '#b8862e', bottom: '#20202a', piel: '#c4916e', pelo: '#100c0c', zapato: '#0c0a10' },
    { top: '#16161e', bottom: '#16161e', piel: '#b07a5c', pelo: '#0c0a0e', zapato: '#08070a', abrigo: true },
    { top: '#c8c8d2', bottom: '#2b3550', piel: '#c99a78', pelo: '#0e0a0c', zapato: '#101014', pelo2: 'mono' }
  ];
  function silueta(c, h, op, cols) {
    var uno = typeof cols === 'string', col = function (k, osc) { if (uno) return cols; var v = cols[k] || cols.top; return osc ? U.mezcla(v, '#05040a', osc) : v; };
    c.lineCap = 'round'; c.lineJoin = 'round';
    var f = op.fase || 0, corre = op.corre ? 1.6 : 1, sent = op.sentado;
    var cadY = sent ? -h * 0.3 : -h * 0.5, homY = cadY - h * 0.31, cabY = homY - h * 0.12;
    var mI = sent ? 1.45 : Math.sin(f) * 0.42 * corre, mD = sent ? 1.5 : -Math.sin(f) * 0.42 * corre;
    var eI = sent ? -0.05 : mI - Math.max(0, Math.sin(f + 1.4)) * 0.85 * corre, eD = sent ? 0 : mD - Math.max(0, Math.sin(f + 1.4 + Math.PI)) * 0.85 * corre;
    if (op.fase == null && !sent && !op.piernas) { mI = -0.06; eI = -0.06; mD = 0.08; eD = 0.08; }   // de pie y quieto: plantado
    if (op.piernas) { mI = op.piernas[0]; eI = op.piernas[1]; mD = op.piernas[2]; eD = op.piernas[3]; }
    var pie = function (p, osc) { c.fillStyle = col('zapato', osc); c.beginPath(); c.ellipse(p[0] + h * 0.03, p[1] - h * 0.012, h * 0.05, h * 0.022, 0, 0, TAU); c.fill(); };
    var brI = op.brazoI || [-Math.sin(f) * 0.38 * corre, -Math.sin(f) * 0.38 * corre - (op.corre ? 1.2 : 0.25)], brD = op.brazoD || [Math.sin(f) * 0.38 * corre, Math.sin(f) * 0.38 * corre - (op.corre ? 1.2 : 0.25)];
    var falda = op.falda || (!uno && cols.falda), abrigo = op.abrigo || (!uno && cols.abrigo), pelo = op.pelo || (!uno && cols.pelo2) || 'corto';
    // lo de detrás, más en sombra: brazo y pierna izquierdos
    c.fillStyle = c.strokeStyle = col('top', 0.35); var mi = miembro(c, -h * 0.03, homY + h * 0.03, brI[0], h * 0.15, h * 0.058, brI[1], h * 0.14, h * 0.048);
    c.fillStyle = col('piel', 0.35); c.beginPath(); c.arc(mi[0], mi[1], h * 0.024, 0, TAU); c.fill();
    c.strokeStyle = col('bottom', 0.35); pie(miembro(c, -h * 0.02, cadY, mI, h * 0.25, h * 0.085, eI, h * 0.24, h * 0.065), 0.35);
    // el cuello y el tronco (con abrigo o falda si toca)
    c.fillStyle = col('piel'); c.fillRect(-h * 0.022, homY - h * 0.05, h * 0.044, h * 0.06);
    var tr = new Path2D(); tr.moveTo(-h * 0.1, homY); tr.quadraticCurveTo(0, homY - h * 0.03, h * 0.1, homY);
    tr.quadraticCurveTo(h * 0.085, cadY - h * 0.15, h * 0.075, cadY);
    if (abrigo && !sent) { tr.lineTo(h * 0.11, cadY + h * 0.2); tr.lineTo(-h * 0.1, cadY + h * 0.2); }
    else if (falda && !sent) { tr.lineTo(h * 0.13, cadY + h * 0.17); tr.lineTo(-h * 0.12, cadY + h * 0.17); }
    else tr.lineTo(-h * 0.075, cadY + h * 0.03);
    tr.quadraticCurveTo(-h * 0.085, cadY - h * 0.15, -h * 0.1, homY);
    c.fillStyle = col('top'); c.fill(tr);
    if (!uno) {
      // pliegues: la sombra del lado de atrás y el cinturón o la cintura
      c.save(); c.clip(tr); c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(-h * 0.12, homY - h * 0.05, h * 0.07, h * 0.6);
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(h * 0.03, homY, h * 0.05, h * 0.3); c.restore();
      if (!falda && !abrigo) { c.fillStyle = col('bottom'); c.fillRect(-h * 0.078, cadY - h * 0.03, h * 0.156, h * 0.06); }
    }
    // lo de delante: pierna y brazo derechos
    c.strokeStyle = col('bottom'); pie(miembro(c, h * 0.02, cadY, mD, h * 0.25, h * 0.085, eD, h * 0.24, h * 0.065));
    c.strokeStyle = col('top'); var mano = miembro(c, h * 0.03, homY + h * 0.03, brD[0], h * 0.15, h * 0.058, brD[1], h * 0.14, h * 0.048);
    c.fillStyle = col('piel'); c.beginPath(); c.arc(mano[0], mano[1], h * 0.026, 0, TAU); c.fill();
    // la cabeza: cara de perfil (frente, nariz, barbilla), la oreja, el pelo encima y detrás
    c.save(); c.translate(0, cabY); c.rotate(-(op.mira || 0));
    c.fillStyle = col('piel'); c.beginPath(); c.ellipse(0, 0, h * 0.056, h * 0.068, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(h * 0.048, -h * 0.01); c.lineTo(h * 0.068, h * 0.012); c.lineTo(h * 0.048, h * 0.02); c.fill();
    c.fillStyle = col('pelo');
    c.beginPath(); c.ellipse(-h * 0.006, -h * 0.025, h * 0.06, h * 0.05, 0, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    c.beginPath(); c.ellipse(-h * 0.035, 0, h * 0.03, h * 0.055, 0, 0, TAU); c.fill();
    if (pelo === 'largo') { c.beginPath(); c.moveTo(-h * 0.06, -h * 0.03); c.quadraticCurveTo(-h * 0.1, h * 0.08, -h * 0.07, h * 0.15); c.lineTo(-h * 0.02, h * 0.1); c.fill(); }
    else if (pelo === 'mono') { c.beginPath(); c.arc(-h * 0.06, -h * 0.045, h * 0.03, 0, TAU); c.fill(); }
    else if (pelo === 'gorra') { c.fillStyle = uno ? cols : '#2a3a5a'; c.beginPath(); c.ellipse(0, -h * 0.04, h * 0.064, h * 0.04, 0, Math.PI, 0); c.fill(); c.fillRect(0, -h * 0.046, h * 0.1, h * 0.014); }
    if (!uno) { c.fillStyle = col('piel', 0.3); c.beginPath(); c.arc(-h * 0.008, h * 0.005, h * 0.012, 0, TAU); c.fill(); c.fillStyle = '#0a0808'; c.fillRect(h * 0.025, -h * 0.008, h * 0.01, h * 0.008); }
    c.restore();
    return { mano: mano, hombro: [h * 0.03, homY + h * 0.03], cabeza: [0, cabY] };
  }
  A.cuerpo = function (c, x, y, h, op) {
    op = op || {};
    var dir = op.dir || 1, col = op.ropa || op.color || A.ROPAS[0];
    if (op.paraguas && !op.brazoD) op.brazoD = [0.4, 2.35];
    c.save(); c.translate(x, y); c.scale(dir, 1);
    // el filo de luz: la misma figura en color, un poco movida hacia la luz, y la oscura encima
    if (op.borde) { c.save(); c.translate(-Math.max(1, h * 0.018), -Math.max(0.5, h * 0.008)); c.globalAlpha = 0.9; silueta(c, h, op, op.borde); c.restore(); }
    var g = silueta(c, h, op, op.contraluz ? op.contraluz : col);
    if (op.paraguas) {
      var px = g.mano[0], py = g.mano[1], r = h * 0.48, cy = Math.min(py - h * 0.22, -h * 1.02);
      c.strokeStyle = '#1a1622'; c.lineWidth = Math.max(1, h * 0.014); c.beginPath(); c.moveTo(px, py + h * 0.03); c.lineTo(px, cy); c.stroke();
      var tela = new Path2D(); tela.moveTo(px - r, cy + r * 0.16); tela.quadraticCurveTo(px - r * 0.95, cy - r * 0.62, px, cy - r * 0.66); tela.quadraticCurveTo(px + r * 0.95, cy - r * 0.62, px + r, cy + r * 0.16);
      for (var q = 0; q < 8; q++) { var xa = px + r - q * r / 4, xb = xa - r / 4; tela.quadraticCurveTo((xa + xb) / 2, cy + r * 0.02, xb, cy + r * 0.16); }
      tela.closePath();
      c.fillStyle = op.paraguas; c.fill(tela);
      c.save(); c.clip(tela);
      // gajos alternos más oscuros, el brillo de arriba y la luz de la calle por debajo
      c.fillStyle = 'rgba(0,0,0,.22)'; for (q = 0; q < 8; q += 2) { c.beginPath(); c.moveTo(px, cy - r * 0.66); c.lineTo(px - r + q * r / 4, cy + r * 0.2); c.lineTo(px - r + (q + 1) * r / 4, cy + r * 0.2); c.fill(); }
      var gb = c.createLinearGradient(0, cy - r * 0.66, 0, cy + r * 0.2); gb.addColorStop(0, 'rgba(255,255,255,.35)'); gb.addColorStop(0.45, 'rgba(255,255,255,0)'); c.fillStyle = gb; c.fillRect(px - r, cy - r, r * 2, r * 1.3);
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px - r, cy + r * 0.16); c.quadraticCurveTo(px - r * 0.95, cy - r * 0.62, px, cy - r * 0.66); c.stroke();
      c.fillStyle = '#1a1622'; c.beginPath(); c.arc(px, cy - r * 0.68, Math.max(1.2, h * 0.012), 0, TAU); c.fill();
      // las gotas que caen del borde
      c.fillStyle = 'rgba(210,220,255,.6)'; for (q = 0; q < 3; q++) { var k = ((performance.now() / 500) + q / 3) % 1; c.fillRect(px - r * 0.9 + q * r * 0.9, cy + r * 0.18 + k * h * 0.3, 1.2, 4); }
    }
    c.restore();
    return g;
  };
  // (lo de antes, para quien aún lo use: una persona andando con paraguas)
  A.persona = function (c, x, y, h, fase, paraguas, op) {
    op = op || {}; op.fase = fase; op.paraguas = paraguas; return A.cuerpo(c, x, y, h, op);
  };
})();
