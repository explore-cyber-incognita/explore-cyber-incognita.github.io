/* Secreto 02 · 33.000 vecinos (Distancia)
   Seguir subiendo más allá del cielo. La escena: la ciudad vista desde arriba, su planta (unos 210 × 125 m), que se llena
   de un punto por cada diez vecinos mientras cuenta; al lado, un campo de fútbol a la misma escala. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, S = NI.esc;
  var TAU = Math.PI * 2;
  // la planta aproximada de la ciudad amurallada (en metros, x hacia el este, y hacia el sur)
  var PLANTA = [[0, 8], [62, 0], [140, 4], [210, 14], [206, 70], [198, 122], [120, 126], [40, 120], [6, 96], [2, 50]];
  function dentro(x, y) { var c = false; for (var i = 0, j = PLANTA.length - 1; i < PLANTA.length; j = i++) { var a = PLANTA[i], b = PLANTA[j]; if (((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) c = !c; } return c; }
  var PUNTOS = (function () { var r = U.azar(33000), out = []; while (out.length < 3300) { var x = r() * 210, y = r() * 126; if (dentro(x, y)) out.push([x, y, r()]); } out.sort(function (a, b) { return a[2] - b[2]; }); return out; })();

  NI.registrar({
    id: 'vecinos', n: 2, nombre: '33.000 vecinos', tipo: 'Distancia',
    pista: 'Sube hasta arriba del todo… y sigue subiendo.',
    detectar: function (api) {
      api.en('empujar', function (d) { if (d.lado === 'inicio' && d.total > Math.max(900, E.H)) { E.empujeI = 0; api.disparar(); } });
    },
    escena: function () {
      var D = 13000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 7600, hasta: D - 400, titulo: '33.000 vecinos', pie: '九龍城寨 · 2,6 hectáreas',
          texto: 'En 2,6 hectáreas —unos tres campos y medio de fútbol— vivían a finales de los años ochenta entre 33.000 y 35.000 personas, según la fuente. Más de un millón por kilómetro cuadrado: seguramente el lugar más densamente poblado que ha habido nunca.' },
        inicio: function () { E.irA(0.3, 1000); },
        frente: function (c, t) {
          var a = U.meseta(t, 600, 1600, D - 1400, D - 300); if (a <= 0) return;
          var W = E.W, H = E.H;
          c.fillStyle = 'rgba(5,4,12,' + (0.9 * a).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
          // la escala: cabe la planta y el campo de fútbol (105 × 68 m)
          var ancho = W > 800, m = Math.min(W * (ancho ? 0.36 : 0.82) / 210, H * 0.42 / 126), ox = ancho ? W * 0.36 : W / 2 - 105 * m, oy = H * (ancho ? 0.3 : 0.14);
          c.save(); c.globalAlpha = a;
          // la retícula de fondo cada 10 m
          c.strokeStyle = 'rgba(236,230,255,.06)'; c.lineWidth = 1; c.beginPath(); for (var gx = 0; gx <= 210; gx += 10) { c.moveTo(ox + gx * m, oy - 10 * m); c.lineTo(ox + gx * m, oy + 136 * m); } for (var gy = -10; gy <= 136; gy += 10) { c.moveTo(ox, oy + gy * m); c.lineTo(ox + 210 * m, oy + gy * m); } c.stroke();
          c.beginPath(); PLANTA.forEach(function (p, i) { i ? c.lineTo(ox + p[0] * m, oy + p[1] * m) : c.moveTo(ox + p[0] * m, oy + p[1] * m); }); c.closePath();
          c.fillStyle = 'rgba(255,43,214,.06)'; c.fill(); c.strokeStyle = S.MAG; c.lineWidth = 1.6; c.shadowColor = S.MAG; c.shadowBlur = 10; c.stroke(); c.shadowBlur = 0;
          // los vecinos: un punto por cada diez, que van llegando
          var k = U.inOut(U.tramo(t, 1600, 6600)), n = Math.floor(PUNTOS.length * k);
          c.fillStyle = '#ffd0f4'; for (var i = 0; i < n; i++) { var p = PUNTOS[i]; c.fillRect(ox + p[0] * m - 0.8, oy + p[1] * m - 0.8, 1.6, 1.6); }
          c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,43,214,.5)'; for (i = Math.max(0, n - 60); i < n; i++) { var q = PUNTOS[i]; c.beginPath(); c.arc(ox + q[0] * m, oy + q[1] * m, 2.5, 0, TAU); c.fill(); } c.globalCompositeOperation = 'source-over';
          // el campo de fútbol, a la misma escala
          var fx = ancho ? ox + 230 * m : ox + 52 * m, fy = ancho ? oy + 29 * m : oy + 126 * m + 50, fa = U.tramo(t, 5600, 6600);
          c.globalAlpha = a * fa; c.strokeStyle = S.CIAN; c.lineWidth = 1.4; c.strokeRect(fx, fy, 105 * m, 68 * m); c.beginPath(); c.moveTo(fx + 52.5 * m, fy); c.lineTo(fx + 52.5 * m, fy + 68 * m); c.stroke(); c.beginPath(); c.arc(fx + 52.5 * m, fy + 34 * m, 9.15 * m, 0, TAU); c.stroke();
          c.strokeRect(fx, fy + 13.85 * m, 16.5 * m, 40.3 * m); c.strokeRect(fx + 88.5 * m, fy + 13.85 * m, 16.5 * m, 40.3 * m);
          c.restore();
          S.rotulo(c, 'VECINOS · ' + Math.round(33000 * k).toLocaleString('es-ES'), ox + 105 * m, oy - 34, a, S.MAG);
          S.rotulo(c, '2,6 HA · 1 PUNTO = 10 VECINOS', ox + 105 * m, oy + 126 * m + 30, a * U.tramo(t, 3000, 3600), '#ece6ff');
          S.rotulo(c, 'UN CAMPO DE FÚTBOL', fx + 52.5 * m, fy + 68 * m + 28, a * fa, S.CIAN);
        }
      };
    }
  });
})();
