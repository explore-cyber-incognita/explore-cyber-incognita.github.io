/* Secreto 05 · Ciberespacio (Teclado)
   Escribir CIBERESPACIO (o CYBERSPACE). La escena: la ciudad se apaga y se vuelve su propio esqueleto de luz —columnas,
   ventanas y letreros en líneas— con paquetes de datos que corren por los cables y una rejilla que se pierde abajo. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  var TAU = Math.PI * 2, buffer = '';

  NI.registrar({
    id: 'ciberespacio', n: 5, nombre: 'Ciberespacio', tipo: 'Teclado',
    pista: 'Escribe la palabra que inventó un escritor que tecleaba en una máquina de escribir.',
    detectar: function (api) {
      api.en('tecla', function (d) { if (!d.key || d.key.length !== 1) return; buffer = (buffer + d.key.toUpperCase()).replace(/[^A-Z]/g, '').slice(-14); if (/CIBERESPACIO$|CYBERSPACE$/.test(buffer)) { buffer = ''; api.disparar(); } });
    },
    escena: function () {
      var D = 13000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 6800, hasta: D - 400, titulo: 'Ciberespacio', pie: 'William Gibson · «Quemando cromo» · 1982',
          texto: 'La palabra la inventó William Gibson en el relato «Quemando cromo» (1982) y la hizo famosa en <i>Neuromante</i> (1984), donde el ciberespacio es «una alucinación consensual». Escribió la novela en una vieja máquina de escribir portátil; dicen que ni siquiera tenía ordenador.' },
        frente: function (c, t) {
          var a = U.meseta(t, 400, 1800, D - 1600, D - 300); if (a <= 0) return;
          var u = E.u, W = E.W, H = E.H;
          c.fillStyle = 'rgba(2,3,10,' + (0.9 * a).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
          var dib = U.tramo(t, 1000, 4200);   // el esqueleto se dibuja de abajo arriba
          c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round';
          // las columnas del bloque
          var esq = new Path2D();
          C.COLS.forEach(function (col) { var y0 = E.sy(col.top), y1 = E.sy(C.PB), yv = U.lerp(y1, y0, dib); esq.moveTo(E.sx(col.x), y1); esq.lineTo(E.sx(col.x), yv); esq.lineTo(E.sx(col.x + col.w), yv); esq.lineTo(E.sx(col.x + col.w), y1); });
          c.strokeStyle = 'rgba(51,240,255,.16)'; c.lineWidth = 6; c.stroke(esq); c.strokeStyle = 'rgba(51,240,255,.8)'; c.lineWidth = 1.4; c.stroke(esq);
          // las ventanas, como celdas
          c.strokeStyle = 'rgba(51,240,255,.3)'; c.lineWidth = 1; c.beginPath();
          C.VENTANAS.forEach(function (v) { var y = E.sy(v.l); if (y < -40 || y > H || y < U.lerp(H, -50, dib)) return; c.rect(E.sx(v.xu), y, v.w * u, v.h * u); });
          c.stroke();
          // los letreros, en magenta
          c.strokeStyle = 'rgba(255,43,214,.85)'; c.lineWidth = 1.5;
          C.LETREROS.forEach(function (L) { var y = E.sy(L.l); if (y < -60 || y > H + 60 || y < U.lerp(H, -50, dib)) return; var g = NI.arte.letreroGeo(L, E.sx(L.xu), y, L.s * u); c.strokeRect(g.x0, g.y0, g.w, g.h); });
          // la rejilla del suelo, en perspectiva
          c.strokeStyle = 'rgba(160,110,255,.45)'; var hy = H * 0.86;
          for (var k = 0; k < 9; k++) { var y = hy + Math.pow(k / 9, 1.8) * (H - hy); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
          for (var x = -W; x <= W * 2; x += 70) { c.beginPath(); c.moveTo(W / 2 + (x - W / 2) * 0.2, hy); c.lineTo(x, H); c.stroke(); }
          // paquetes de datos que corren por las aristas, hacia arriba
          c.fillStyle = '#e8fbff';
          C.COLS.forEach(function (col, i) { for (var p = 0; p < 3; p++) { var kk = ((t / 2200) + p / 3 + i * 0.17) % 1, y = U.lerp(E.sy(C.PB), E.sy(col.top), kk); if (y < 0 || y > H) continue; c.fillRect(E.sx(i % 2 ? col.x : col.x + col.w) - 2, y - 2, 4, 4); } });
          c.restore();
          // el texto que se escribe solo, como en una máquina de escribir
          var frase = 'UNA ALUCINACIÓN CONSENSUAL', n = Math.floor(frase.length * U.tramo(t, 4000, 6200));
          S.rotulo(c, frase.slice(0, n) + (n < frase.length && Math.floor(t / 300) % 2 ? '▌' : ''), W / 2, H * 0.12, a * U.tramo(t, 3800, 4100), S.CIAN);
        }
      };
    }
  });
})();
