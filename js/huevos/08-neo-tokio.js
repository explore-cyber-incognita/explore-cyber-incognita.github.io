/* Secreto 08 · Neo-Tokio (Mirada)
   Cada 37 s una moto roja cruza la calle a toda velocidad dejando una estela; hay que pulsarla al vuelo. La escena:
   la moto vuelve a cámara lenta y hace la frenada de lado, con las luces rojas dejando su estela y chispas en el suelo. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  var TAU = Math.PI * 2, PERIODO = 37000, CRUCE = 2600, CARRIL = 3.91;

  // la moto, de lado, mirando a la derecha; (x, y) es el suelo bajo su centro y s su largo en píxeles
  function moto(c, x, y, s, gira, t) {
    gira = gira || 0;
    c.save(); c.translate(x, y); c.rotate(gira * 0.22); c.scale(1 - gira * 0.42, 1);
    var rr = s * 0.15;
    // las ruedas: goma negra y el aro que brilla en rojo
    [-0.33, 0.34].forEach(function (wx) {
      c.fillStyle = '#07060c'; c.beginPath(); c.arc(wx * s, -rr, rr, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,60,70,.85)'; c.lineWidth = Math.max(1, s * 0.012); c.beginPath(); c.arc(wx * s, -rr, rr * 0.72, 0, TAU); c.stroke();
      c.fillStyle = '#2a2430'; c.beginPath(); c.arc(wx * s, -rr, rr * 0.25, 0, TAU); c.fill();
    });
    // el carenado rojo, largo y bajo, con la panza oscura
    var p = new Path2D();
    p.moveTo(-s * 0.5, -s * 0.2); p.quadraticCurveTo(-s * 0.52, -s * 0.36, -s * 0.36, -s * 0.38); p.lineTo(-s * 0.08, -s * 0.36);
    p.quadraticCurveTo(s * 0.1, -s * 0.47, s * 0.3, -s * 0.42); p.quadraticCurveTo(s * 0.5, -s * 0.36, s * 0.54, -s * 0.2);
    p.quadraticCurveTo(s * 0.45, -s * 0.13, s * 0.2, -s * 0.14); p.lineTo(-s * 0.18, -s * 0.14); p.quadraticCurveTo(-s * 0.42, -s * 0.12, -s * 0.5, -s * 0.2); p.closePath();
    var g = c.createLinearGradient(0, -s * 0.47, 0, -s * 0.13); g.addColorStop(0, '#ff6a5a'); g.addColorStop(0.35, '#e0142c'); g.addColorStop(1, '#5a0612');
    c.fillStyle = g; c.fill(p);
    c.save(); c.clip(p);
    c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(-s * 0.4, -s * 0.27, s * 0.62, s * 0.018);           // la franja blanca
    c.fillStyle = 'rgba(255,220,220,.35)'; c.beginPath(); c.ellipse(s * 0.12, -s * 0.42, s * 0.22, s * 0.025, -0.1, 0, TAU); c.fill();   // el brillo de arriba
    c.restore();
    // el parabrisas, oscuro con un reflejo cian
    c.fillStyle = '#120c1c'; c.beginPath(); c.moveTo(s * 0.26, -s * 0.43); c.quadraticCurveTo(s * 0.36, -s * 0.52, s * 0.44, -s * 0.47); c.lineTo(s * 0.4, -s * 0.38); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(80,240,255,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(s * 0.3, -s * 0.45); c.quadraticCurveTo(s * 0.36, -s * 0.5, s * 0.42, -s * 0.47); c.stroke();
    // el piloto, tumbado sobre la moto: casco, chaqueta roja y la espalda
    c.fillStyle = '#b8142a'; c.beginPath(); c.moveTo(-s * 0.2, -s * 0.38); c.quadraticCurveTo(-s * 0.05, -s * 0.62, s * 0.18, -s * 0.56); c.lineTo(s * 0.22, -s * 0.46); c.quadraticCurveTo(s * 0.02, -s * 0.44, -s * 0.12, -s * 0.36); c.closePath(); c.fill();
    c.fillStyle = '#1a1622'; c.beginPath(); c.moveTo(-s * 0.16, -s * 0.37); c.lineTo(-s * 0.02, -s * 0.2); c.lineTo(s * 0.06, -s * 0.22); c.lineTo(-s * 0.04, -s * 0.38); c.fill();   // la pierna
    c.fillStyle = '#e8e4ee'; c.beginPath(); c.arc(s * 0.22, -s * 0.6, s * 0.075, 0, TAU); c.fill();                                   // el casco
    c.fillStyle = '#1a2a4a'; c.beginPath(); c.arc(s * 0.24, -s * 0.595, s * 0.055, -0.6, 1.0); c.lineTo(s * 0.24, -s * 0.595); c.fill();   // la visera
    // las luces: el faro blanco delante y el piloto rojo detrás
    c.globalCompositeOperation = 'lighter';
    var gf = c.createRadialGradient(s * 0.54, -s * 0.24, 0, s * 0.54, -s * 0.24, s * 0.5); gf.addColorStop(0, 'rgba(255,250,235,.7)'); gf.addColorStop(1, 'rgba(255,250,235,0)'); c.fillStyle = gf; c.fillRect(s * 0.04, -s * 0.74, s, s);
    var gr = c.createRadialGradient(-s * 0.5, -s * 0.25, 0, -s * 0.5, -s * 0.25, s * 0.22); gr.addColorStop(0, 'rgba(255,40,50,.95)'); gr.addColorStop(1, 'rgba(255,40,50,0)'); c.fillStyle = gr; c.fillRect(-s * 0.72, -s * 0.47, s * 0.44, s * 0.44);
    c.restore();
  }
  // la estela de luz roja: el piloto deja un trazo que se desvanece
  function estela(c, pts, ancho, alfa) {
    if (pts.length < 2) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    for (var pasada = 0; pasada < 2; pasada++) {
      for (var i = 1; i < pts.length; i++) {
        var k = i / pts.length; c.strokeStyle = pasada ? 'rgba(255,220,210,' + (alfa * k * 0.7).toFixed(3) + ')' : 'rgba(255,30,50,' + (alfa * k * 0.55).toFixed(3) + ')';
        c.lineWidth = pasada ? ancho * 0.25 : ancho; c.beginPath(); c.moveTo(pts[i - 1][0], pts[i - 1][1]); c.lineTo(pts[i][0], pts[i][1]); c.stroke();
      }
    }
    c.restore();
  }
  // dónde está la moto que cruza (null si no toca): de izquierda a derecha, por el carril de en medio
  S.motoNeo = function (t) {
    t = t == null ? E.t : t;
    var k = ((t + 20000) % PERIODO) / CRUCE; if (k < 0 || k > 1) return null;
    var lim = E.W / 2 / E.u + 0.3;
    return { k: k, xu: U.lerp(-lim, lim, k), l: CARRIL, s: E.u * 0.2 };
  };
  var rastro = [];
  C.VIVO.calle.push(function (c, t) {
    var m = E.escena ? null : S.motoNeo(t); if (!m) { rastro.length = 0; return; }
    var x = E.sx(m.xu), y = E.sy(m.l); if (y < -100 || y > E.H + 100) return;
    rastro.push([x - m.s * 0.5, y - m.s * 0.25]); if (rastro.length > 14) rastro.shift();
    estela(c, rastro, m.s * 0.06, 1);
    // el reflejo en el asfalto mojado
    c.save(); c.globalAlpha = 0.25; c.translate(0, y * 2 + 3); c.scale(1, -1); moto(c, x, y, m.s, 0, t); c.restore();
    moto(c, x, y, m.s, 0, t);
  });

  NI.registrar({
    id: 'neo-tokio', n: 8, nombre: 'Neo-Tokio', tipo: 'Mirada',
    pista: 'De vez en cuando, una moto roja cruza la calle dejando una estela. Atrápala.',
    detectar: function (api) {
      api.en('clic', function (d) {
        var m = S.motoNeo(); if (!m) return;
        if (Math.abs(d.xu - m.xu) < 0.14 && d.l > m.l - 0.15 && d.l < m.l + 0.04) api.disparar();
      });
    },
    escena: function () {
      var D = 12500 + E.lectura, pista = [];
      function pos(t) {   // entra rápido, frena de lado a cámara lenta en el centro y sale disparada
        var W = E.W, x, inc = 0;
        if (t < 1300) x = U.lerp(-W * 0.25, W * 0.36, U.sale(t / 1300));
        else if (t < 5200) { var k = U.tramo(t, 1300, 5200); x = U.lerp(W * 0.36, W * 0.58, U.sale(k)); inc = Math.sin(Math.PI * Math.min(1, k * 1.15)); }
        else x = U.lerp(W * 0.58, W * 1.35, U.entra(U.tramo(t, 5200, 6400)));
        return { x: x, inc: inc };
      }
      return {
        duracion: D,
        tarjeta: { en: 6400, hasta: D - 400, titulo: 'Neo-Tokio', pie: 'Akira · Katsuhiro Otomo · 1988',
          texto: '<i>Akira</i> (1988), la película de Katsuhiro Otomo basada en su manga, pasa en Neo-Tokio en 2019: una ciudad levantada sobre las ruinas de una gran explosión, que se prepara para los Juegos Olímpicos de 2020. La moto roja de Kaneda, y su frenada de lado con las luces dejando estela, es de las imágenes más copiadas del anime.' },
        inicio: function () { E.irA(3.72, 900); C.sinTrafico = true; },
        fin: function () { C.sinTrafico = false; },
        calle: function (c, t) {
          var y = E.sy(CARRIL), s = E.u * 0.26, p = pos(t);
          if (t < 6600) { pista.push([p.x - s * 0.48 * (1 - p.inc * 0.42), y - s * 0.25 + p.inc * s * 0.08]); if (pista.length > 90) pista.shift(); }
          var fa = 1 - U.tramo(t, 6400, 9000);
          estela(c, pista, s * 0.07, fa);
          // las marcas de la frenada en el suelo
          c.strokeStyle = 'rgba(255,60,70,' + (0.25 * fa).toFixed(3) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(E.W * 0.36, y + 1); c.lineTo(Math.min(p.x, E.W * 0.58), y + 1); c.stroke();
          if (t < 6400) {
            if (p.inc > 0.1) { S.chispas(c, p.x - s * 0.25, y - 2, Math.floor(t / 90) * 90, t, 12); S.chispas(c, p.x + s * 0.1, y - 2, Math.floor(t / 130) * 130 + 45, t, 8); }
            c.save(); c.globalAlpha = 0.25; c.translate(0, y * 2 + 3); c.scale(1, -1); moto(c, p.x, y, s, p.inc, t); c.restore();
            moto(c, p.x, y, s, p.inc, t);
          }
        },
        frente: function (c, t) {
          // las franjas de cámara lenta, arriba y abajo, mientras frena
          var b = U.meseta(t, 1100, 1500, 5000, 5600) * E.H * 0.07;
          if (b > 0) { c.fillStyle = '#020105'; c.fillRect(0, 0, E.W, b); c.fillRect(0, E.H - b, E.W, b); }
          S.rotulo(c, 'NEO-TOKIO · 2019', E.W / 2, E.H * 0.16, U.meseta(t, 1500, 2100, D - 1500, D - 400), '#ff3b4f');
        }
      };
    }
  });
})();
