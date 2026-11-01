/* Secreto 03 · Noviembre de 2019 (Teclado)
   Escribir 2019. La escena: en el cielo, coches voladores cruzan en carriles de luz entre los haces de los focos, y en la
   torre de enfrente se enciende una pantalla gigante. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  var TAU = Math.PI * 2, buffer = '';
  var COCHES = [[0.18, 1, 0.9, 0], [0.3, -1, 0.7, 900], [0.42, 1, 1.2, 1700], [0.24, -1, 0.55, 2600], [0.36, 1, 0.8, 3400], [0.5, -1, 1.05, 4300]];
  function spinner(c, x, y, s, dir, t) {
    c.save(); c.translate(x, y); c.scale(dir, 1); c.rotate(-0.04);
    // la estela de luz de los propulsores
    var g = c.createLinearGradient(-s * 2.2, 0, -s * 0.4, 0); g.addColorStop(0, 'rgba(255,90,60,0)'); g.addColorStop(1, 'rgba(255,140,90,.55)'); c.fillStyle = g; c.fillRect(-s * 2.2, -s * 0.06, s * 1.8, s * 0.1);
    c.fillStyle = '#12101c'; c.beginPath(); c.moveTo(-s * 0.5, s * 0.05); c.lineTo(-s * 0.42, -s * 0.12); c.lineTo(-s * 0.1, -s * 0.2); c.lineTo(s * 0.25, -s * 0.18); c.lineTo(s * 0.55, -s * 0.04); c.lineTo(s * 0.5, s * 0.08); c.closePath(); c.fill();
    c.fillStyle = 'rgba(140,200,255,.55)'; c.beginPath(); c.moveTo(-s * 0.08, -s * 0.18); c.lineTo(s * 0.22, -s * 0.17); c.lineTo(s * 0.32, -s * 0.07); c.lineTo(-s * 0.05, -s * 0.08); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-s * 0.42, -s * 0.12); c.lineTo(s * 0.25, -s * 0.18); c.stroke();
    var b = Math.floor(t / 180) % 2; c.fillStyle = b ? '#3a6aff' : '#ff3b4f'; c.shadowColor = c.fillStyle; c.shadowBlur = 14; c.beginPath(); c.arc(-s * 0.1, -s * 0.22, 3, 0, TAU); c.fill();
    c.fillStyle = '#fff6d8'; c.shadowColor = '#fff6d8'; c.beginPath(); c.arc(s * 0.54, s * 0.0, 2.5, 0, TAU); c.fill(); c.shadowBlur = 0;
    var gl = c.createRadialGradient(0, s * 0.12, 0, 0, s * 0.12, s * 0.5); gl.addColorStop(0, 'rgba(255,170,90,.4)'); gl.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = gl; c.fillRect(-s * 0.5, 0, s, s * 0.6);
    c.restore();
  }

  NI.registrar({
    id: 'blade-runner', n: 3, nombre: 'Noviembre de 2019', tipo: 'Teclado',
    pista: 'El año en que una película situó su ciudad lluviosa y llena de neón.',
    detectar: function (api) {
      api.en('tecla', function (d) { if (!d.key || d.key.length !== 1) return; buffer = (buffer + d.key).replace(/[^0-9]/g, '').slice(-4); if (buffer === '2019') { buffer = ''; api.disparar(); } });
    },
    escena: function () {
      var D = 13500 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 7200, hasta: D - 400, titulo: 'Noviembre de 2019', pie: 'Blade Runner · Ridley Scott · 1982',
          texto: '<i>Blade Runner</i> (1982) imaginó Los Ángeles en noviembre de 2019: lluvia sin parar, neón, anuncios gigantes en las fachadas y coches que vuelan entre los rascacielos. Aquel futuro ya es pasado; su ciudad, la de toda la estética cyberpunk.' },
        inicio: function () { E.irA(0.62, 1400); C.lluviaFija = 0.9; },
        fin: function () { C.lluviaFija = null; },
        cielo: function (c, t) {
          var a = U.meseta(t, 600, 1600, D - 1400, D - 300); if (a <= 0) return;
          // los focos que barren el cielo desde abajo
          c.save(); c.globalCompositeOperation = 'lighter';
          [[0.22, 0.0], [0.7, 2.1], [0.9, 4.0]].forEach(function (q) {
            var x = E.W * q[0], y = E.H, ang = -Math.PI / 2 + Math.sin(t / 2400 + q[1]) * 0.45, l = E.H * 1.4;
            var g = c.createLinearGradient(x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l); g.addColorStop(0, 'rgba(200,220,255,' + (0.16 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(200,220,255,0)');
            c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ang - 0.05) * l, y + Math.sin(ang - 0.05) * l); c.lineTo(x + Math.cos(ang + 0.05) * l, y + Math.sin(ang + 0.05) * l); c.fill();
          });
          c.restore();
          // la pantalla gigante en una torre lejana
          var px = E.W * 0.86, py = E.sy(0.04, 0.3), pw = Math.min(E.W * 0.075, E.u * 0.11), ph = pw * 2.3, on = U.tramo(t, 2400, 3200);
          if (on > 0) {
            c.save(); c.globalAlpha = a * on;
            c.fillStyle = '#0c0a18'; c.fillRect(px - pw * 0.6, py - ph * 0.1, pw * 1.2, E.H);
            var g2 = c.createLinearGradient(0, py, 0, py + ph); g2.addColorStop(0, '#ff2bd6'); g2.addColorStop(0.5, '#7a2aff'); g2.addColorStop(1, '#ff8a3d'); c.fillStyle = g2; c.fillRect(px - pw / 2, py, pw, ph);
            c.fillStyle = 'rgba(0,0,0,.25)'; for (var yy = py; yy < py + ph; yy += 3) c.fillRect(px - pw / 2, yy, pw, 1);
            c.font = '600 ' + Math.round(pw * 0.3) + 'px ' + NI.arte.LAT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(255,255,255,' + (0.7 + 0.3 * Math.sin(t / 200)).toFixed(2) + ')'; c.fillText('2019', px, py + ph * 0.5);
            c.globalCompositeOperation = 'lighter'; var gh = c.createRadialGradient(px, py + ph / 2, 0, px, py + ph / 2, pw * 1.4); gh.addColorStop(0, 'rgba(255,43,214,.25)'); gh.addColorStop(1, 'rgba(255,43,214,0)'); c.fillStyle = gh; c.fillRect(px - pw * 1.5, py - pw, pw * 3, ph + pw * 2);
            c.restore();
          }
          // los coches voladores
          COCHES.forEach(function (q) {
            var k = ((t - q[3]) / (6500 / q[2])); if (k < 0 || k > 1) return;
            var x = q[1] > 0 ? U.lerp(-80, E.W + 80, k) : U.lerp(E.W + 80, -80, k), y = E.sy(q[0], 0.4) + Math.sin(t / 700 + q[3]) * 4;
            c.globalAlpha = a; spinner(c, x, y, E.u * 0.1 * q[2], q[1], t); c.globalAlpha = 1;
          });
        },
        frente: function (c, t) { S.rotulo(c, 'LOS ÁNGELES · NOVIEMBRE DE 2019', E.W / 2, E.H * 0.12, U.meseta(t, 1400, 2000, D - 1500, D - 400), S.MAG); }
      };
    }
  });
})();
