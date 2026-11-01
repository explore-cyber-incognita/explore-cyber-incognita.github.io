/* Cyber Incognita · piezas de las escenas
   Lo que comparten los secretos: rótulos, la estática de una tele sin señal, el fallo de imagen (glitch), chispas,
   polvo, y un letrero de neón grande que se monta letra a letra. Todo en píxeles de pantalla. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, A = NI.arte, C = NI.ciudad;
  var TAU = Math.PI * 2, MAG = '#ff2bd6', CIAN = '#33f0ff';
  var S = NI.esc = { MAG: MAG, CIAN: CIAN };

  // un rótulo en la escena (mono, versalitas) sobre una placa oscura con filo de neón
  S.rotulo = function (c, txt, x, y, a, color) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.font = '500 12px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if ('letterSpacing' in c) c.letterSpacing = '2px';
    var w = c.measureText(txt).width + 24; c.fillStyle = 'rgba(8,6,16,.86)'; c.fillRect(x - w / 2, y - 13, w, 26);
    c.strokeStyle = U.rgba(color || MAG, 0.7); c.lineWidth = 1; c.strokeRect(x - w / 2 + 0.5, y - 12.5, w - 1, 25);
    c.shadowColor = color || MAG; c.shadowBlur = 8; c.fillStyle = color || '#ece6ff'; c.fillText(txt, x, y + 0.5); c.restore();
  };
  // la estática de una tele sin señal: un lienzo pequeño de ruido, rehecho en cada fotograma y ampliado sin suavizar
  var tv = null;
  S.estatica = function (c, x, y, w, h, a) {
    if (!tv) { tv = document.createElement('canvas'); tv.width = 180; tv.height = 110; }
    var tx = tv.getContext('2d'), im = tx.createImageData(tv.width, tv.height), d = im.data;
    for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255; d[i] = v * 0.95; d[i + 1] = v; d[i + 2] = v * 1.05 > 255 ? 255 : v * 1.05; d[i + 3] = 255; }
    tx.putImageData(im, 0, 0);
    c.save(); c.globalAlpha = a; c.imageSmoothingEnabled = false; c.drawImage(tv, x, y, w, h);
    c.fillStyle = 'rgba(0,0,0,.18)'; for (var yy = y; yy < y + h; yy += 3) c.fillRect(x, yy, w, 1);
    c.restore();
  };
  // fallo de imagen: franjas de la pantalla desplazadas y teñidas
  S.glitch = function (c, fuerza, semilla) {
    if (fuerza <= 0) return;
    var W = E.W, H = E.H, d = E.dpr, r = U.azar(semilla || 1);
    for (var k = 0; k < 7 * fuerza + 1; k++) {
      var y = r() * H, h = 4 + r() * 40 * fuerza, dx = (r() - 0.5) * 80 * fuerza;
      try { c.drawImage(c.canvas, 0, y * d, W * d, h * d, dx, y, W, h); } catch (err) { /* nada */ }
      c.fillStyle = r() < 0.5 ? 'rgba(255,43,214,' + (0.18 * fuerza).toFixed(3) + ')' : 'rgba(51,240,255,' + (0.18 * fuerza).toFixed(3) + ')'; c.fillRect(0, y, W, h);
    }
  };
  // chispas que saltan de un punto y caen
  S.chispas = function (c, x, y, t0, t, n) {
    var k = (t - t0) / 900; if (k < 0 || k > 1) return;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < (n || 18); i++) {
      var a = U._h(i * 3.7 + t0) * TAU, v = 40 + U._h(i * 5.1 + t0) * 90, px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k * 0.6 + 160 * k * k;
      c.fillStyle = 'rgba(255,' + Math.round(200 + 55 * (1 - k)) + ',140,' + (1 - k).toFixed(2) + ')'; c.fillRect(px, py, 2.2, 2.2);
    }
    c.restore();
  };
  // nubes de polvo (derribos)
  S.polvo = function (c, x, y, r, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(120,108,120,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(120,108,120,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  };
  // un letrero de neón grande en el centro, que se monta letra a letra (en caché por longitud)
  var grandes = {};
  S.neonGrande = function (c, txt, x, y, s, color, hasta, a, lat) {
    var n = Math.max(1, Math.min(txt.length, Math.ceil(hasta))), sub = txt.slice(0, n), k = sub + '|' + Math.round(s) + '|' + color + '|' + E.dpr;
    if (!grandes[k]) { var L = { t: sub, c: color, lat: lat !== false, caja: n === txt.length }, g = A.letreroGeo(L, 0, 0, s); grandes[k] = { L: L, g: g, luz: A.letreroLuz(L, g, E.dpr) }; }
    var G = grandes[k], gg = A.letreroGeo(G.L, x - (A.letreroGeo({ t: txt, lat: lat !== false }, 0, 0, s).w - G.g.w) / 2, y, s);
    c.save(); c.globalAlpha = a; A.letreroTabla(c, G.L, gg); c.globalCompositeOperation = 'lighter'; c.drawImage(G.luz.c, gg.x - G.luz.w / 2, gg.y - G.luz.h / 2, G.luz.w, G.luz.h); c.restore();
  };
  // sacudir la cámara alrededor de donde está (para pasos de avión o derribos)
  S.sacudir = function (base, fuerza, t) { E.camY = U.clamp(base + Math.sin(t / 23) * fuerza + Math.sin(t / 37) * fuerza * 0.6, 0, E.maxCam()); };
})();
