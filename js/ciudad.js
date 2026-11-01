/* Cyber Incognita · la ciudad
   La ciudad amurallada de Kowloon (九龍城寨) de noche, de arriba abajo:
     cielo (λ 0–1): nubes teñidas por la ciudad y los 747 que bajan hacia Kai Tak, rozando las azoteas;
     azotea (λ ≈ 1): el bosque de antenas, depósitos, casetas y ropa tendida (por los aviones, nada pasaba de 14 plantas);
     fachada (λ 1–3,24): 14 plantas de ventanas con rejas, aires acondicionados, tuberías, cables y letreros de neón;
     tiendas (3,24–3,58): persianas, interiores encendidos y el callejón que entra en la ciudad;
     calle (3,58–4,1): la acera, la calzada mojada que lo refleja todo, coches, gente con paraguas y vapor.
   Capas: lejos (p 0,3: Kowloon a lo lejos y la Roca del León) · vecinos (p 0,8) · bloque (p 1) · cables de delante (p 1,25).
   Las capas fijas se pintan por teselas horizontales (TH px de alto, todo el ancho) con un taller que pinta primero lo que
   se ve y espera a WebKit. En vivo: el cielo, los aviones, la luz de los letreros (que parpadean), las teles, las gotas de
   los aires acondicionados, los coches, la gente, el vapor, los charcos, la lluvia y algún relámpago. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, A = NI.arte, P = A.P;
  var TAU = Math.PI * 2;
  var C = NI.ciudad = {};
  // lo vivo que añaden otros archivos (vida.js, los secretos): C.VIVO[capa].push(fn(ctx, t))
  C.VIVO = { cielo: [], ventanas: [], fachada: [], azotea: [], calle: [], delante: [] };
  function vivo(n, ctx) { var l = C.VIVO[n]; for (var i = 0; i < l.length; i++) { try { l[i](ctx, E.t); } catch (err) { console.error(err); } } }
  var TECHO = C.TECHO = 1.0, FH = C.FH = 0.16, PB = C.PB = TECHO + 14 * FH, ACERA = C.ACERA = 3.58, BORDILLO = C.BORDILLO = 3.64;
  var FX0 = -0.64, FX1 = 0.64;   // la fachada, en xu
  E.largo = 4.1;
  var TH = 512;

  /* ================================================================== la composición (fija, en u) */
  var r = U.azar(1993);
  var COLS = [], VENTANAS = [], ACS = [], TELES = [];
  (function () {
    var x = FX0;
    while (x < FX1 - 0.01) {
      var w = Math.min(FX1 - x, 0.07 + r() * 0.07); if (FX1 - x - w < 0.05) w = FX1 - x;
      var e = r(), n = e < 0.66 ? 14 : e < 0.86 ? 13 : e < 0.96 ? 12 : 11;
      COLS.push({ x: x, w: w, n: n, top: PB - n * FH, tono: Math.floor(r() * P.muro.length), semilla: Math.floor(r() * 1e6), caseta: r() < 0.45, tanque: r() < 0.6, ropa: r() < 0.35, gente: r() < 0.22 });
      x += w;
    }
    COLS.forEach(function (col, ci) {
      var nw = Math.max(1, Math.round((col.w - 0.016) / 0.045)), paso = (col.w - 0.016) / nw;
      for (var f = 0; f < col.n; f++) {
        var lf = col.top + f * FH;
        for (var k = 0; k < nw; k++) {
          var es = r(), v = { col: ci, f: f, xu: col.x + 0.008 + k * paso + paso * 0.19, l: lf + FH * 0.22, w: paso * 0.62, h: FH * 0.42,
            estado: es < 0.36 ? 'calida' : es < 0.52 ? 'fluor' : es < 0.58 ? 'tv' : 'oscura', jaula: r() < 0.28, ac: r() < 0.26, ropa: r() < 0.05, dentro: r(), semilla: Math.floor(r() * 1e6) };
          VENTANAS.push(v);
          if (v.estado === 'tv') TELES.push(v);
          if (v.ac) ACS.push(v);
        }
      }
    });
  })();
  C.VENTANAS = VENTANAS; C.COLS = COLS;

  // los letreros: lo que se anunciaba en la ciudad (sobre todo dentistas y clínicas sin licencia de Hong Kong)
  var LETREROS = C.LETREROS = [
    { t: '夜總會', xu: -0.12, l: 1.32, s: 0.034, c: '#b46bff', caja: true },                       // club nocturno
    { t: '旅館', xu: -0.44, l: 1.42, s: 0.04, c: '#33f0ff', v: true },                               // hostal
    { t: 'HOTEL', xu: 0.53, l: 1.5, s: 0.03, c: '#ff2bd6', v: true, lat: true, efecto: 'roto', roto: 2 },
    { t: '麻雀', xu: 0.13, l: 1.76, s: 0.042, c: '#ffe14d', v: true },                               // mahjong
    { t: '跌打', xu: -0.58, l: 1.9, s: 0.036, c: '#ff3b4f', v: true, efecto: 'zumba' },              // huesero
    { t: '九龍城寨', xu: 0.0, l: 2.06, s: 0.056, c: '#33f0ff', caja: true },                         // la ciudad amurallada de Kowloon
    { t: '理髮', xu: 0.57, l: 2.12, s: 0.04, c: '#ff8a3d', v: true },                                // barbero
    { t: '中醫', xu: -0.2, l: 2.42, s: 0.034, c: '#4dff88', caja: true },                            // medicina china
    { t: '診所', xu: 0.42, l: 2.44, s: 0.038, c: '#9fe0ff' },                                       // clínica
    { t: '牙醫', xu: -0.5, l: 2.6, s: 0.045, c: '#ff2bd6', v: true, efecto: 'zumba' },               // dentista
    { t: '牙科', xu: 0.2, l: 2.76, s: 0.04, c: '#ff2bd6', v: true },                                 // odontología
    { t: 'DENTAL', xu: -0.27, l: 2.93, s: 0.026, c: '#33f0ff', lat: true },
    { t: '押', xu: 0.4, l: 3.03, s: 0.07, c: '#4dff88' },                                           // casa de empeños
    { t: '魚蛋', xu: -0.47, l: 3.13, s: 0.042, c: '#ff8a3d' },                                      // bolas de pescado
    { t: '茶餐廳', xu: -0.17, l: 3.15, s: 0.042, c: '#ff3b4f', caja: true },                        // cafetería de Hong Kong
    { t: '粥麵', xu: 0.13, l: 3.13, s: 0.044, c: '#ffe14d', efecto: 'roto', roto: 1 },               // gachas y fideos
    { t: '涼茶', xu: 0.55, l: 3.13, s: 0.04, c: '#4dff88' }                                        // té de hierbas
  ];
  (function () {
    var mejor = null; COLS.forEach(function (col) { if (col.n === 14 && (!mejor || Math.abs(col.x + col.w / 2 - 0.3) < Math.abs(mejor.x + mejor.w / 2 - 0.3))) mejor = col; });
    if (mejor) { C.ROTULO_AZOTEA = { xu: mejor.x + mejor.w / 2, top: mejor.top }; LETREROS.push({ t: '酒店', xu: mejor.x + mejor.w / 2, l: mejor.top - 0.16, s: 0.075, c: '#ff2bd6', caja: true, azotea: true }); }   // hotel
  })();
  LETREROS.forEach(function (L, i) { L.i = i; L.tOn = 0; L.r = U._h(i * 7.7); });

  /* ================================================================== las capas y sus piezas */
  var CAPAS = [
    { id: 'lejos', p: 0.3, res: 0.6, els: [] },
    { id: 'vecinos', p: 0.8, res: 0.75, els: [] },
    { id: 'bloque', p: 1, res: 1, els: [] }
  ];
  var CAPA = {}; CAPAS.forEach(function (c) { CAPA[c.id] = c; });
  function pieza(capa, l0, l1, z, f, sinReflejo) { CAPA[capa].els.push({ l0: l0, l1: l1, z: z, f: f, sinReflejo: sinReflejo }); }

  function construir() {
    var rr = U.azar(7);
    /* ---- lejos: la Roca del León y las torres de Kowloon, con sus ventanitas y balizas rojas ---- */
    pieza('lejos', 0.2, 0.6, 0, function (c, u, cx) {
      c.fillStyle = '#0c0a18'; c.beginPath(); c.moveTo(cx - 2 * u, 0.6 * u);
      c.bezierCurveTo(cx - 1.6 * u, 0.36 * u, cx - 1.2 * u, 0.3 * u, cx - 0.95 * u, 0.33 * u); c.bezierCurveTo(cx - 0.85 * u, 0.26 * u, cx - 0.72 * u, 0.25 * u, cx - 0.62 * u, 0.33 * u); c.lineTo(cx - 0.3 * u, 0.5 * u); c.lineTo(cx - 0.3 * u, 0.6 * u); c.closePath(); c.fill();
    });
    for (var n = 0; n < 90; n++) {
      (function (xu, w, top, s) {
        pieza('lejos', top - 0.02, 1.8, 1, function (c, u, cx) {
          var r2 = U.azar(s), x = cx + xu * u, ww = w * u, y = top * u;
          c.fillStyle = P.lejos; c.fillRect(x, y, ww, 1.8 * u - y);
          c.fillStyle = P.lejosLuz; for (var yy = y + 4; yy < 1.8 * u; yy += 7) for (var xx = x + 2; xx < x + ww - 3; xx += 6) if (r2() < 0.28) c.fillRect(xx, yy, 2.5, 2.5);
          if (r2() < 0.5) { c.fillStyle = '#ff3b4f'; c.fillRect(x + ww / 2 - 1.5, y - 4, 3, 3); }
        });
      })(-2 + rr() * 4, 0.03 + rr() * 0.07, 0.36 + rr() * 0.3, Math.floor(rr() * 1e6));
    }
    /* ---- vecinos: los edificios de alrededor, a los lados ---- */
    [[-2.2, FX0 - 0.03], [FX1 + 0.03, 2.2]].forEach(function (lado, li) {
      for (var x = lado[0]; x < lado[1];) {
        var w = 0.1 + rr() * 0.14; if (x + w > lado[1]) w = lado[1] - x; if (w < 0.03) break;
        (function (xu, w, top, s, tono) {
          pieza('vecinos', top - 0.12, 3.7, 0, function (c, u, cx) {
            var r2 = U.azar(s), x0 = cx + xu * u, ww = w * u, y0 = top * u, y1 = 3.7 * u;
            c.fillStyle = P.vecino[tono]; c.fillRect(x0, y0, ww, y1 - y0);
            c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(x0, y0, ww, 2);
            for (var a = 0; a < ww / 10; a++) A.antena(c, x0 + 4 + r2() * (ww - 8), y0, 0.03 * u + r2() * 0.05 * u, 2 + Math.floor(r2() * 3), (r2() - 0.5) * 0.1, '#14101e');
            for (var yy = y0 + 0.03 * u; yy < y1 - 0.08 * u; yy += 0.11 * u) for (var xx = x0 + 6; xx < x0 + ww - 20; xx += 0.045 * u) {
              var e = r2(); if (e < 0.55) continue;
              c.fillStyle = e < 0.8 ? 'rgba(255,200,130,.5)' : 'rgba(170,240,240,.45)'; c.fillRect(xx, yy, 0.022 * u, 0.04 * u);
            }
          });
        })(x, w, 1.05 + rr() * 0.5, Math.floor(rr() * 1e6), Math.floor(rr() * 2));
        x += w + 0.008;
      }
    });
    // letreros encendidos en los vecinos (fijos, sin parpadeo)
    [{ t: '金舖', xu: -0.86, l: 2.2, s: 0.03, c: '#ffe14d', v: true }, { t: '電器', xu: 0.9, l: 2.0, s: 0.03, c: '#33f0ff', v: true }, { t: '冰室', xu: -0.95, l: 2.75, s: 0.03, c: '#ff8ad8' }, { t: 'OPEN 24', xu: 0.98, l: 2.6, s: 0.022, c: '#ff3b4f', lat: true }].forEach(function (L) {
      pieza('vecinos', L.l - 0.15, L.l + 0.15, 2, function (c, u, cx) { var g = A.letreroGeo(L, cx + L.xu * u, L.l * u, L.s * u); A.letreroTabla(c, L, g); var lz = A.letreroLuz(L, g, 1); c.globalCompositeOperation = 'lighter'; c.drawImage(lz.c, g.x - lz.w / 2, g.y - lz.h / 2, lz.w, lz.h); c.globalCompositeOperation = 'source-over'; });
    });

    /* ---- el bloque: cada columna, planta a planta ---- */
    COLS.forEach(function (col, ci) {
      // la azotea: pretil, casetas, depósitos, antenas, ropa y alguien mirando los aviones
      pieza('bloque', col.top - 0.16, col.top + 0.02, 1, function (c, u, cx) {
        var r2 = U.azar(col.semilla), x0 = cx + col.x * u, w = col.w * u, y = col.top * u;
        c.fillStyle = P.muro[col.tono]; c.fillRect(x0, y - 0.012 * u, w, 0.012 * u + 2);
        c.fillStyle = P.muroLuz; c.fillRect(x0, y - 0.012 * u, w, 2);
        if (col.caseta) { var cw = w * (0.3 + r2() * 0.3), cxx = x0 + r2() * (w - cw), ch = 0.05 * u; c.fillStyle = P.muro[(col.tono + 1) % P.muro.length]; c.fillRect(cxx, y - 0.012 * u - ch, cw, ch); c.fillStyle = '#5a4a3a'; c.fillRect(cxx - 2, y - 0.012 * u - ch, cw + 4, 3); if (r2() < 0.6) { c.fillStyle = P.calida[0]; c.fillRect(cxx + cw * 0.3, y - 0.012 * u - ch * 0.75, cw * 0.25, ch * 0.4); } }
        if (col.tanque) A.tanque(c, P, x0 + r2() * (w - 0.035 * u), y - 0.012 * u - 6, 0.025 * u + r2() * 0.015 * u, 0.018 * u + r2() * 0.012 * u);
        for (var a = 0; a < w / 9; a++) A.antena(c, x0 + 3 + r2() * (w - 6), y - 0.012 * u, 0.04 * u + r2() * 0.08 * u, 2 + Math.floor(r2() * 4), (r2() - 0.5) * 0.14, P.antena);
        if (col.ropa) A.ropa(c, x0 + w * 0.1, x0 + w * 0.9, y - 0.04 * u, r2);
      });
      for (var f = 0; f < col.n; f++) {
        (function (f) {
          var lf = col.top + f * FH;
          pieza('bloque', lf - 0.03, lf + FH + 0.05, 2, function (c, u, cx) {
            var r2 = U.azar(col.semilla + f * 97), x0 = cx + col.x * u, w = col.w * u, y0 = lf * u, h = FH * u;
            var base = P.muro[col.tono]; c.fillStyle = U.mezcla(base, '#000000', 0.08 * (f % 3)); c.fillRect(x0, y0, w, h + 1);
            // manchas de humedad que bajan, la cornisa de cada planta y la bajante de la esquina
            c.fillStyle = P.mancha; for (var m = 0; m < 4; m++) c.fillRect(x0 + r2() * w, y0 + r2() * h * 0.5, 2 + r2() * 3, h * (0.3 + r2() * 0.7));
            c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x0, y0 + h - 4, w, 4); c.fillStyle = P.muroLuz; c.fillRect(x0, y0 + h - 4, w, 1);
            c.fillStyle = P.muroSombra; c.fillRect(x0 + w - 3, y0, 3, h);
            c.fillStyle = P.tuberia; c.fillRect(x0 + 2, y0, 3, h); c.fillRect(x0 + 1, y0 + h * 0.5, 5, 3);
          });
        })(f);
      }
    });
    // las ventanas, cada una su pieza
    VENTANAS.forEach(function (v) {
      pieza('bloque', v.l - 0.03, v.l + v.h + 0.06, 3, function (c, u, cx) { A.ventana(c, P, cx + v.xu * u, v.l * u, v.w * u, v.h * u, v, U.azar(v.semilla)); });
    });
    // los cables que cruzan la fachada
    for (n = 0; n < 9; n++) {
      (function (xa, xb, l, cae) {
        pieza('bloque', l - 0.01, l + cae + 0.02, 4, function (c, u, cx) { c.strokeStyle = P.cable; c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx + xa * u, l * u); c.quadraticCurveTo(cx + (xa + xb) / 2 * u, (l + cae * 2) * u, cx + xb * u, l * u); c.stroke(); });
      })(FX0 + rr() * 0.4, FX1 - rr() * 0.4, TECHO + 0.3 + rr() * 2, 0.01 + rr() * 0.03);
    }
    if (C.ROTULO_AZOTEA) { var RA = C.ROTULO_AZOTEA; pieza('bloque', RA.top - 0.25, RA.top + 0.01, 4.5, function (c, u, cx) {
      var x = cx + RA.xu * u, y = RA.top * u, w = 0.17 * u; c.strokeStyle = '#1e1a28'; c.lineWidth = 3;
      c.beginPath(); for (var k = 0; k < 4; k++) { var px = x - w / 2 + k * w / 3; c.moveTo(px, y - 0.012 * u); c.lineTo(px, y - 0.1 * u); } c.moveTo(x - w / 2, y - 0.03 * u); c.lineTo(x + w / 2, y - 0.09 * u); c.moveTo(x + w / 2, y - 0.03 * u); c.lineTo(x - w / 2, y - 0.09 * u); c.stroke();
    }); }
    // las tablas de los letreros (los tubos apagados); la luz va en vivo
    LETREROS.forEach(function (L) {
      pieza('bloque', L.l - L.s * 3, L.l + L.s * 3, 5, function (c, u, cx) { A.letreroTabla(c, L, A.letreroGeo(L, cx + L.xu * u, L.l * u, L.s * u)); });
    });

    /* ---- la planta baja: la marquesina, las tiendas y el callejón ---- */
    pieza('bloque', PB - 0.02, ACERA + 0.01, 1, function (c, u, cx) {
      c.fillStyle = '#120f1a'; c.fillRect(cx + FX0 * u, PB * u, (FX1 - FX0) * u, (ACERA - PB) * u);
      c.fillStyle = '#2a2433'; c.fillRect(cx + FX0 * u - 6, PB * u - 4, (FX1 - FX0) * u + 12, 10);
      c.fillStyle = '#4a4256'; c.fillRect(cx + FX0 * u - 6, PB * u - 4, (FX1 - FX0) * u + 12, 2);
    });
    var CALLEJON = C.CALLEJON = { xu: -0.03, w: 0.075 };
    for (var x = FX0 + 0.01; x < FX1 - 0.05; x += 0.11) {
      if (x + 0.1 > CALLEJON.xu - CALLEJON.w / 2 && x < CALLEJON.xu + CALLEJON.w / 2) { x = CALLEJON.xu + CALLEJON.w / 2 - 0.1; continue; }
      (function (xu, s) {
        pieza('bloque', PB, ACERA, 2, function (c, u, cx) { var r2 = U.azar(s); A.tienda(c, P, cx + xu * u, (PB + 0.03) * u, 0.1 * u, (ACERA - PB - 0.03) * u, 0.25 + r2() * 0.75, r2() < 0.55, r2); });
      })(x, Math.floor(rr() * 1e6));
    }
    pieza('bloque', PB - 0.05, ACERA, 3, function (c, u, cx) {
      var x0 = cx + (CALLEJON.xu - CALLEJON.w / 2) * u, w = CALLEJON.w * u, y0 = (PB - 0.03) * u, y1 = ACERA * u;
      c.fillStyle = P.callejon; c.fillRect(x0, y0, w, y1 - y0);
      // dentro, el pasillo que se pierde: paredes en perspectiva, tuberías, un fluorescente
      c.fillStyle = '#0d0b14'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + w * 0.3, y0 + (y1 - y0) * 0.3); c.lineTo(x0 + w * 0.3, y1 - (y1 - y0) * 0.15); c.lineTo(x0, y1); c.fill();
      c.beginPath(); c.moveTo(x0 + w, y0); c.lineTo(x0 + w * 0.7, y0 + (y1 - y0) * 0.3); c.lineTo(x0 + w * 0.7, y1 - (y1 - y0) * 0.15); c.lineTo(x0 + w, y1); c.fill();
      c.strokeStyle = '#1e1a28'; c.lineWidth = 1.5; for (var k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x0 + w * 0.3, y0 + (y1 - y0) * (0.3 + k * 0.1)); c.lineTo(x0 + w * 0.7, y0 + (y1 - y0) * (0.32 + k * 0.1)); c.stroke(); }
      c.fillStyle = '#d2fff6'; c.shadowColor = '#7ff8ff'; c.shadowBlur = 14; c.fillRect(x0 + w * 0.36, y0 + (y1 - y0) * 0.36, w * 0.28, 3); c.shadowBlur = 0;
      var g = c.createLinearGradient(0, y0 + (y1 - y0) * 0.36, 0, y1); g.addColorStop(0, 'rgba(168,255,242,.22)'); g.addColorStop(1, 'rgba(168,255,242,0)'); c.fillStyle = g; c.fillRect(x0 + w * 0.2, y0 + (y1 - y0) * 0.36, w * 0.6, (y1 - y0) * 0.64);
      c.strokeStyle = '#2a2433'; c.lineWidth = 3; c.strokeRect(x0, y0, w, y1 - y0);
    });

    /* ---- la calle: acera, bordillo, calzada mojada con su reflejo ---- */
    pieza('bloque', ACERA, E.largo + 0.1, 0, function (c, u, cx) {
      var W = cx * 2;
      c.fillStyle = P.acera; c.fillRect(0, ACERA * u, W, (BORDILLO - ACERA) * u);
      c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; for (var xx = (cx % (0.06 * u)); xx < W; xx += 0.06 * u) { c.beginPath(); c.moveTo(xx, ACERA * u); c.lineTo(xx, BORDILLO * u); c.stroke(); }
      c.fillStyle = P.calle; c.fillRect(0, BORDILLO * u, W, (E.largo + 0.1 - BORDILLO) * u);
      reflejo(c, u, cx);
      c.fillStyle = P.bordillo; c.fillRect(0, BORDILLO * u - 3, W, 5); c.fillStyle = '#4a4256'; c.fillRect(0, BORDILLO * u - 3, W, 1);
      // las marcas de la calzada: la línea doble amarilla de Hong Kong, gastada
      c.fillStyle = 'rgba(230,190,60,.35)'; c.fillRect(0, 3.86 * u, W, 2); c.fillRect(0, 3.866 * u, W, 2);
      c.fillStyle = 'rgba(230,230,230,.22)'; for (xx = 0; xx < W; xx += 0.2 * u) c.fillRect(xx, 4.0 * u, 0.1 * u, 2);
      // una tapa de alcantarilla
      c.fillStyle = '#16131e'; c.beginPath(); c.ellipse(cx + 0.32 * u, 3.94 * u, 0.04 * u, 0.012 * u, 0, 0, TAU); c.fill(); c.strokeStyle = '#2a2433'; c.stroke();
    }, true);
    CAPAS.forEach(function (c) { c.els.sort(function (a, b) { return a.z - b.z; }); });
  }

  // la calzada mojada: lo de encima (tiendas, letreros y las plantas de abajo) invertido, borroso y roto por la lluvia
  var refl = null;
  function reflejo(c, u, cx) {
    var W = cx * 2, alto = BORDILLO * u - (ACERA - 0.75) * u, k = W + 'x' + u;
    if (!refl || refl.k !== k) {
      var o = document.createElement('canvas'); o.width = Math.ceil(W / 2); o.height = Math.ceil(alto / 2);
      var x = o.getContext('2d'); x.scale(0.5, 0.5); x.translate(0, -(ACERA - 0.75) * u);
      CAPA.bloque.els.forEach(function (el) { if (el.sinReflejo || el.l1 < ACERA - 0.75 || el.l0 > BORDILLO) return; x.save(); try { el.f(x, u, cx); } catch (err) { console.error(err); } x.restore(); });
      x.globalCompositeOperation = 'lighter';
      LETREROS.forEach(function (L) { if (L.l < ACERA - 0.8) return; var g = A.letreroGeo(L, cx + L.xu * u, L.l * u, L.s * u), lz = A.letreroLuz(L, g, 1); x.drawImage(lz.c, g.x - lz.w / 2, g.y - lz.h / 2, lz.w, lz.h); });
      var m = document.createElement('canvas'); m.width = o.width; m.height = o.height; var mx = m.getContext('2d'); mx.filter = 'blur(1.5px)'; mx.translate(0, o.height); mx.scale(1, -1); mx.drawImage(o, 0, 0);
      refl = { k: k, c: m };
    }
    var y0 = BORDILLO * u + 2, hR = (E.largo + 0.1 - BORDILLO) * u;
    c.save(); c.beginPath(); c.rect(0, y0, W, hR); c.clip();
    for (var y = 0; y < hR; y += 1.5) {
      var off = Math.sin(y * 0.9) * 1.6 + Math.sin(y * 0.23 + 1) * 2.2, sy = y * 0.5 * 0.85;
      if (sy >= refl.c.height - 1) break;
      c.globalAlpha = 0.62 * Math.pow(1 - y / hR, 1.2);
      c.drawImage(refl.c, 0, sy, refl.c.width, 1, off, y0 + y, W, 2);
    }
    c.restore();
  }

  /* ================================================================== las teselas */
  var cache = {}, pxGuardados = 0;
  var LIMITE = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? 22e6 : 38e6;
  function clave(capa, i) { return capa.id + '|' + i; }
  function pintarTesela(capa, i) {
    var d = Math.min(2, E.dpr * capa.res), W = E.W, u = E.u, cv = document.createElement('canvas');
    cv.width = Math.ceil(W * d); cv.height = Math.ceil(TH * d);
    var c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, -i * TH * d);
    c.beginPath(); c.rect(0, i * TH, W, TH); c.clip();
    var l0 = i * TH / u, l1 = (i + 1) * TH / u;
    for (var k = 0; k < capa.els.length; k++) { var el = capa.els[k]; if (el.l1 < l0 || el.l0 > l1) continue; c.save(); try { el.f(c, u, W / 2); } catch (err) { console.error(err); } c.restore(); }
    var T = { c: cv, px: cv.width * cv.height, usado: E.t };
    var k2 = clave(capa, i); if (cache[k2]) pxGuardados -= cache[k2].px;
    cache[k2] = T; pxGuardados += T.px;
    return T;
  }
  function rango(capa, margen) { var base = (E.H / 2 + E.camY) * capa.p - E.H / 2; return [Math.floor((base - (margen || 0)) / TH), Math.floor((base + E.H + (margen || 0)) / TH)]; }
  function tieneContenido(capa, i) { var l0 = i * TH / E.u, l1 = (i + 1) * TH / E.u; for (var k = 0; k < capa.els.length; k++) if (!(capa.els[k].l1 < l0 || capa.els[k].l0 > l1)) return true; return false; }
  function liberar() {
    if (pxGuardados <= LIMITE) return;
    var lista = []; for (var k in cache) lista.push([k, cache[k]]);
    lista.sort(function (a, b) { return a[1].usado - b[1].usado; });
    for (var j = 0; j < lista.length && pxGuardados > LIMITE * 0.85; j++) { if (E.t - lista[j][1].usado < 400) break; pxGuardados -= lista[j][1].px; delete cache[lista[j][0]]; }
  }
  C.olvidar = function () { cache = {}; pxGuardados = 0; refl = null; luces = {}; };
  var pendientes = 0;
  function tareas() {
    var lista = [], dir = E.velY > 0.05 || (E.camObj != null && E.camObj > E.camY) ? 1 : E.velY < -0.05 || (E.camObj != null && E.camObj < E.camY) ? -1 : 0;
    CAPAS.forEach(function (capa) {
      var vr = rango(capa, 0), cr = rango(capa, E.H * 1.2);
      for (var i = Math.max(0, cr[0]); i <= cr[1]; i++) {
        if (cache[clave(capa, i)] || !tieneContenido(capa, i)) continue;
        var vis = i >= vr[0] && i <= vr[1], dist = vis ? 0 : (i < vr[0] ? vr[0] - i : i - vr[1]);
        lista.push({ capa: capa, i: i, prio: vis ? 0 : 10 + dist * 2 - (dir && (i - vr[0]) * dir > 0 ? 1 : 0) });
      }
    });
    lista.sort(function (a, b) { return a.prio - b.prio; });
    return lista;
  }
  function taller() {
    var presupuesto = E.bloqueado ? 40 : (E.camObj != null || Math.abs(E.velY) > 0.02) ? 4 : 10;
    var t0 = performance.now(), lista = tareas(), j = 0;
    pendientes = lista.length;
    while (j < lista.length && performance.now() - t0 < presupuesto) { var tt = lista[j++]; pintarTesela(tt.capa, tt.i).usado = E.t; E.vaciar(); }
    liberar();
  }
  C.ocupado = function () { return pendientes > 0; };
  C._taller = { tareas: tareas, cache: function () { return cache; }, px: function () { return pxGuardados; }, capas: CAPAS };
  C.preparar = function () { CAPAS.forEach(function (capa) { var vr = rango(capa, 0); for (var i = Math.max(0, vr[0]); i <= vr[1]; i++) if (!cache[clave(capa, i)] && tieneContenido(capa, i)) pintarTesela(capa, i); }); E.vaciar(); };

  /* ================================================================== lo vivo */
  // la luz de cada letrero, en caché por tamaño
  var luces = {};
  function luz(L) {
    var s = Math.round(L.s * E.u), k = L.i + '|' + s + '|' + E.dpr;
    if (!luces[k]) {
      var g = A.letreroGeo(L, 0, 0, L.s * E.u);
      luces[k] = { todo: A.letreroLuz(L, g, E.dpr, L.efecto === 'roto' ? L.roto : null), roto: L.efecto === 'roto' ? A.letreroLuz(L, g, E.dpr, null, L.roto) : null };
    }
    return luces[k];
  }
  // el encendido de la entrada: la ciudad a oscuras y los letreros que se encienden uno a uno
  var enc = { t0: null, hecho: false };
  C.encender = function (ya) {
    enc.t0 = E.t; enc.hecho = !!ya;
    LETREROS.forEach(function (L, i) { L.tOn = ya ? -1e9 : E.t + 500 + i * 150 + L.r * 400; });
  };
  C.encendiendo = function () { return enc.t0 != null && !enc.hecho; };
  function encendido(L, t) {   // 0 apagado … 1 encendido (con el parpadeo de un tubo que arranca)
    if (enc.t0 == null) return 0;
    var d = t - L.tOn; if (d < 0) return 0; if (d > 700) return 1;
    return U._h(Math.floor(t / 55) + L.i * 13) > 0.45 ? 0.3 + d / 1000 : 0.05;
  }
  C.brillo = {};   // los secretos pueden cambiar el brillo de un letrero: C.brillo[i] = 0…1

  // la lluvia: la intensidad cambia sola (llovizna, lluvia, aguacero); los secretos pueden fijarla
  C.lluvia = 0.6; C.lluviaFija = null;
  var GOTAS = []; (function () { var r3 = U.azar(5); for (var i = 0; i < 700; i++) GOTAS.push({ x: r3(), y: r3(), l: 12 + r3() * 26, v: 0.9 + r3() * 0.6, capa: r3() < 0.35 ? 1 : 0 }); })();
  C.nivelLluvia = function (l) { l = l == null ? C.lluvia : l; return l < 0.33 ? 'llovizna' : l < 0.7 ? 'lluvia' : 'aguacero'; };

  // los aviones: uno cada 26 s, de derecha a izquierda, bajando hacia Kai Tak
  C.PERIODO_AVION = 26000; C.avionForzado = null; C.avionEscena = null; C.TELES = TELES;
  C.avion = function (t) {
    t = t == null ? E.t : t;
    var o = C.avionEscena;   // una escena puede pedir su propio avión: { k, s (en u), l0, l1 }
    var k = o ? o.k : C.avionForzado != null ? C.avionForzado : ((t + 9000) % C.PERIODO_AVION) / 9000; if (k < 0 || k > 1) return null;
    var s = (o ? o.s : 0.4) * E.u, x = U.lerp(E.W + s, -s, k), l = U.lerp(o ? o.l0 : 0.16, o ? o.l1 : 0.36, k);
    return { k: k, x: x, y: E.sy(l, 0.45), s: s };
  };
  // los coches y la gente de la calle
  var COCHES = [], GENTE = [], ONDAS = [], VAPOR = [];
  (function () {
    for (var i = 0; i < 4; i++) COCHES.push({ fase: i * 0.27 + 0.1, carril: i % 2, tipo: i % 3 === 1 ? 'minibus' : 'taxi', vel: 0.05 + (i % 2) * 0.012 });
    var COL = ['#ff2bd6', '#33f0ff', '#ffe14d', '#e8e0ff', '#ff3b4f', null, '#4dff88'];
    for (i = 0; i < 9; i++) GENTE.push({ x: U._h(i * 3.1) * 2.4 - 1.2, dir: i % 2 ? 1 : -1, vel: 0.03 + U._h(i) * 0.025, fase: i, color: COL[i % COL.length], alto: 0.08 + U._h(i * 5) * 0.012 });
  })();
  var relampago = { t: -1e9 };

  C.actualizar = function (dt) {
    var t = E.t;
    if (C.lluviaFija != null) C.lluvia += (C.lluviaFija - C.lluvia) * Math.min(1, dt / 600);
    else C.lluvia = 0.18 + 0.82 * U.suave(U.ruido(t / 38000, 3) * 1.25 - 0.1);
    if (enc.t0 != null && !enc.hecho && t - enc.t0 > 600 + LETREROS.length * 150 + 1200) enc.hecho = true;
    // la gente camina y da la vuelta al salir de la pantalla
    var lim = E.W / 2 / E.u + 0.2;
    GENTE.forEach(function (g) { g.x += g.dir * g.vel * dt / 1000; g.fase += dt / 1000 * 5.2; if (g.x > lim) g.x = -lim; if (g.x < -lim) g.x = lim; });
    // relámpago, de vez en cuando con aguacero
    if (C.lluvia > 0.75 && t - relampago.t > 40000 && U._h(Math.floor(t / 1000)) > 0.985) relampago.t = t;
    // ondas en los charcos y el vapor de la alcantarilla
    var nOndas = C.lluvia * dt / 16 * 1.4;
    while (nOndas > 0) { if (Math.random() < nOndas) ONDAS.push({ xu: (Math.random() - 0.5) * E.W / E.u, l: ACERA + 0.01 + Math.random() * (E.largo - ACERA), t: t }); nOndas -= 1; }
    while (ONDAS.length && t - ONDAS[0].t > 900) ONDAS.shift();
    if (Math.random() < dt / 160) VAPOR.push({ t: t, dx: (Math.random() - 0.5) * 0.02 });
    while (VAPOR.length && t - VAPOR[0].t > 3500) VAPOR.shift();
    taller();
  };

  // el sitio en pantalla de cada capa de teselas
  function capaTeselas(ctx, capa) {
    var vr = rango(capa, 0);
    for (var i = Math.max(0, vr[0]); i <= vr[1]; i++) {
      if (!tieneContenido(capa, i)) continue;
      var y = E.H / 2 + i * TH - (E.H / 2 + E.camY) * capa.p, T = cache[clave(capa, i)];
      if (!T) T = pintarTesela(capa, i);
      T.usado = E.t; ctx.drawImage(T.c, 0, y, E.W, TH);
    }
  }
  var nubes = null;
  function spriteNubes() {
    if (nubes) return nubes;
    nubes = []; var r3 = U.azar(31);
    for (var n = 0; n < 6; n++) {
      var w = 420, h = 140, c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d');
      for (var k = 0; k < 9; k++) { var rr = 30 + r3() * 36, cx = rr + 4 + r3() * (w - rr * 2 - 8), cy = h / 2 + (r3() - 0.5) * (h - rr * 2 - 8), g = x.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, P.nube + '0.3)'); g.addColorStop(1, P.nube + '0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
      nubes.push({ c: c, x: r3(), l: 0.05 + r3() * 0.55, s: 1 + r3() * 1.2, v: 0.004 + r3() * 0.006 });
    }
    return nubes;
  }

  C.dibujar = function (ctx, s, t) {
    var W = E.W, H = E.H, u = E.u, ti = E.t;
    /* el cielo */
    var g0 = E.sy(0, 0.2), g1 = E.sy(0.62, 0.3), gc = ctx.createLinearGradient(0, g0, 0, g1);
    P.cielo.forEach(function (q) { gc.addColorStop(q[0], q[1]); });
    ctx.fillStyle = gc; ctx.fillRect(0, 0, W, H);
    if (g1 < H) { ctx.fillStyle = P.cielo[P.cielo.length - 1][1]; ctx.fillRect(0, g1, W, H - g1); }
    spriteNubes().forEach(function (n) {
      var y = E.sy(n.l, 0.2); if (y > H + 100 || y < -200) return;
      var w = 420 * n.s * u / 900, x = ((n.x * (W + w) + ti * n.v * u / 1000) % (W + w)) - w;
      ctx.drawImage(n.c, x, y - w / 6, w, w / 3);
    });
    vivo('cielo', ctx);
    if (s && s.cielo) s.cielo(ctx, t);
    capaTeselas(ctx, CAPA.lejos);
    capaTeselas(ctx, CAPA.vecinos);
    if (s && s.detras) s.detras(ctx, t);
    capaTeselas(ctx, CAPA.bloque);

    /* el velo del apagón (la entrada) */
    if (enc.t0 == null || !enc.hecho) {
      var vel = enc.t0 == null ? 0.82 : 0.82 * (1 - U.suave(U.tramo(ti - enc.t0, 300, 2300)));
      if (vel > 0.003) { ctx.fillStyle = 'rgba(3,2,8,' + vel.toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    }

    vivo('ventanas', ctx);
    /* las teles de las ventanas, que cambian de luz */
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < TELES.length; i++) {
      var v = TELES[i], y = E.sy(v.l); if (y < -60 || y > H + 10) continue;
      var a = 0.12 + 0.3 * U.ruido(ti / 140 + i * 7, i) * (enc.t0 == null ? 0 : 1);
      ctx.fillStyle = i % 3 ? 'rgba(120,160,255,' + a.toFixed(3) + ')' : 'rgba(220,235,255,' + a.toFixed(3) + ')';
      ctx.fillRect(E.sx(v.xu), y, v.w * u, v.h * u);
    }
    /* la luz de los letreros */
    for (i = 0; i < LETREROS.length; i++) {
      var L = LETREROS[i], ly = E.sy(L.l); if (ly < -L.s * u * 8 || ly > H + L.s * u * 8) continue;
      var on = encendido(L, ti) * (C.brillo[i] == null ? 1 : C.brillo[i]);
      if (L.efecto === 'zumba') on *= U._h(Math.floor(ti / 90) + i * 3) > 0.96 ? 0.15 : 0.86 + 0.14 * Math.sin(ti / 37 + i);
      if (on <= 0.01) continue;
      var lz = luz(L);
      ctx.globalAlpha = on; ctx.drawImage(lz.todo.c, E.sx(L.xu) - lz.todo.w / 2, ly - lz.todo.h / 2, lz.todo.w, lz.todo.h);
      if (lz.roto) { var fl = U._h(Math.floor(ti / 120) + i) > 0.55 && U._h(Math.floor(ti / 900) + i * 2) > 0.3; if (fl) ctx.drawImage(lz.roto.c, E.sx(L.xu) - lz.roto.w / 2, ly - lz.roto.h / 2, lz.roto.w, lz.roto.h); }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    /* las gotas de los aires acondicionados */
    ctx.fillStyle = 'rgba(200,215,255,.6)';
    for (i = 0; i < ACS.length; i += 2) {
      var ac = ACS[i], ay = E.sy(ac.l + ac.h) + 0.03 * u, per = 2600 + (i % 7) * 400, k = ((ti + i * 977) % per) / per; if (ay < -40 || ay > H) continue;
      if (k < 0.6) continue; k = (k - 0.6) / 0.4;
      ctx.globalAlpha = 1 - k; ctx.fillRect(E.sx(ac.xu + ac.w * 0.5), ay + k * k * 0.3 * u, 1.5, 4 + k * 6);
    }
    ctx.globalAlpha = 1;

    vivo('fachada', ctx);
    /* el avión */
    var av = C.avion();
    if (av) {
      A.avion(ctx, av.x, av.y, av.s, ti);
      // su luz barre las azoteas al pasar
      var ty = E.sy(TECHO), tx = av.x - av.s * 0.6;
      if (ty > -50 && ty < H + 50) { ctx.globalCompositeOperation = 'lighter'; var gl = ctx.createRadialGradient(tx, ty, 0, tx, ty, av.s * 0.9); gl.addColorStop(0, 'rgba(255,245,220,.14)'); gl.addColorStop(1, 'rgba(255,245,220,0)'); ctx.fillStyle = gl; ctx.fillRect(tx - av.s, ty - av.s, av.s * 2, av.s * 2); ctx.globalCompositeOperation = 'source-over'; }
      av.luzAzotea = true;
    }
    vivo('azotea', ctx);
    if (s && s.ciudad) s.ciudad(ctx, t);

    /* la calle: el vapor, la gente, los coches y las ondas de los charcos */
    var yc = E.sy(ACERA);
    if (yc < H + 50) {
      var vx = E.sx(0.32), vy = E.sy(3.94);
      for (i = 0; i < VAPOR.length; i++) { var q = VAPOR[i], kk = (ti - q.t) / 3500, rr2 = (0.03 + kk * 0.1) * u, px2 = vx + q.dx * u + Math.sin(kk * 5 + i) * 0.03 * u, py2 = vy - kk * 0.45 * u, gv = ctx.createRadialGradient(px2, py2, 0, px2, py2, rr2); gv.addColorStop(0, 'rgba(220,205,245,' + (0.07 * Math.sin(Math.PI * kk)).toFixed(3) + ')'); gv.addColorStop(1, 'rgba(220,205,245,0)'); ctx.fillStyle = gv; ctx.fillRect(px2 - rr2, py2 - rr2, rr2 * 2, rr2 * 2); }
      GENTE.forEach(function (gp, gi) { var px = E.sx(gp.x); if (px < -60 || px > W + 60) return; A.cuerpo(ctx, px, E.sy(ACERA + 0.05), gp.alto * u, { fase: gp.fase, paraguas: gp.color, dir: gp.dir, ropa: A.ROPAS[gi % A.ROPAS.length], borde: gi % 2 ? 'rgba(255,90,220,.9)' : 'rgba(90,240,255,.85)' }); });
      if (!C.sinTrafico) COCHES.forEach(function (co, ci) {
        var k2 = ((ti / 1000 * co.vel) + co.fase) % 1, dir = co.carril ? -1 : 1, lim2 = W / 2 / u + 0.4, xu2 = dir > 0 ? U.lerp(-lim2, lim2, k2) : U.lerp(lim2, -lim2, k2);
        var cy = E.sy(co.carril ? 4.02 : 3.8), sc = u / 900 * (co.carril ? 1.38 : 1.22), cx = E.sx(xu2);
        if (cx < -300 || cx > W + 300) return;
        // el reflejo del coche en el asfalto mojado
        ctx.save(); ctx.globalAlpha = 0.22; ctx.translate(0, cy * 2 + 4); ctx.scale(1, -1); A.coche(ctx, cx, cy, sc, co.tipo, dir); ctx.restore();
        A.coche(ctx, cx, cy, sc, co.tipo, dir);
      });
      ctx.strokeStyle = 'rgba(200,215,255,.4)'; ctx.lineWidth = 1;
      ONDAS.forEach(function (o) { var k3 = (ti - o.t) / 900, rr3 = (0.004 + k3 * 0.018) * u; ctx.globalAlpha = 1 - k3; ctx.beginPath(); ctx.ellipse(E.sx(o.xu), E.sy(o.l), rr3, rr3 * 0.3, 0, 0, TAU); ctx.stroke(); });
      ctx.globalAlpha = 1;
    }
    vivo('calle', ctx);
    if (s && s.calle) s.calle(ctx, t);

    /* los cables de delante (p 1,25) */
    ctx.strokeStyle = '#020105'; ctx.lineWidth = 3;
    [[1.5, 0.05], [2.35, 0.08], [2.95, 0.04], [3.4, 0.07]].forEach(function (k4, j) {
      var y4 = E.sy(k4[0], 1.25); if (y4 < -80 || y4 > H + 40) return;
      ctx.beginPath(); ctx.moveTo(-20, y4 - (j % 2) * 30); ctx.quadraticCurveTo(W * (0.3 + j * 0.12), y4 + k4[1] * u * 2, W + 20, y4 - ((j + 1) % 2) * 40); ctx.stroke();
    });

    vivo('delante', ctx);
    /* la lluvia: dos capas, cada una en un solo trazo */
    var nl = Math.round(GOTAS.length * (0.2 + 0.8 * C.lluvia)), desliz = E.camY * 0.5;
    for (var cap = 0; cap < 2; cap++) {
      ctx.strokeStyle = cap ? 'rgba(210,220,255,.32)' : 'rgba(190,200,255,.16)'; ctx.lineWidth = cap ? 1.4 : 1; ctx.beginPath();
      for (i = 0; i < nl; i++) {
        var gt = GOTAS[i]; if (gt.capa !== cap) continue;
        var len = gt.l * (cap ? 1.4 : 1) * (0.7 + C.lluvia * 0.5), gy = ((gt.y * (H + 80) + ti * gt.v * (cap ? 1.3 : 0.9) - desliz * (cap ? 1.2 : 0.6)) % (H + 80) + H + 80) % (H + 80) - 40, gx = gt.x * (W + 60) - 30 - (gy / H) * 14;
        ctx.moveTo(gx, gy); ctx.lineTo(gx - len * 0.18, gy + len);
      }
      ctx.stroke();
    }
    /* el relámpago */
    var dr = ti - relampago.t;
    if (dr < 500) { var fa = (dr < 90 ? 1 : dr > 180 && dr < 260 ? 0.7 : 0) * 0.22; if (fa) { ctx.fillStyle = 'rgba(220,210,255,' + fa + ')'; ctx.fillRect(0, 0, W, H); } }
  };
  C.dibujarEncendido = function () { /* (reservado: el velo se pinta dentro de dibujar, bajo los letreros) */ };

  /* ---------- la planta en la que estás ---------- */
  C.planta = function (l) {
    if (l < TECHO - 0.02) return { n: 15, txt: '屋頂 · Azotea' };
    if (l < PB) { var k = Math.max(1, Math.min(14, Math.ceil((PB - l) / FH))); return { n: k, txt: 'Planta ' + U.dos(k) }; }
    if (l < ACERA) return { n: 0, txt: 'Planta baja' };
    return { n: -1, txt: 'Calle' };
  };

  E.en('tamano', function () { C.olvidar(); });
  construir();
})();
