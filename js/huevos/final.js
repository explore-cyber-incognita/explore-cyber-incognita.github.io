/* Cyber Incognita · el final
   Con los diez: la cámara sube despacio de la calle a la azotea mientras los letreros laten en una ola que sube con ella;
   en el cielo se monta un 九龍城寨 de neón enorme y el «in» del título se tacha: «Cyber cognita». Después, los créditos. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  function duracion(ms) {
    var m = Math.round(ms / 60000); if (m < 60) return m + ' min';
    var h = Math.floor(m / 60); if (h < 48) return h + ' h ' + U.dos(m % 60) + ' min';
    return Math.round(h / 24) + ' días';
  }
  function fecha(ms) { var d = new Date(ms); return U.dos(d.getDate()) + '.' + U.dos(d.getMonth() + 1) + '.' + d.getFullYear(); }

  NI.registrarFinal({
    escena: function (motor, datos) {
      var D = 14000 + E.lectura, tiene = isFinite(datos.desde) && datos.hasta;
      return {
        duracion: D,
        tarjeta: { en: 8200, hasta: D - 400, titulo: 'Cyber cognita',
          texto: 'Has encontrado los diez secretos de la ciudad amurallada de Kowloon. Ya no queda en pie, pero sigue viva en el neón, en la lluvia y en todas las ciudades del futuro que inspiró. Ya no es incógnita para ti.' + (tiene ? ' Te ha llevado ' + duracion(datos.hasta - datos.desde) + '.' : ''),
          pie: tiene ? fecha(datos.desde) + ' — ' + fecha(datos.hasta) : '九龍城寨 · 10 / 10' },
        inicio: function () { document.documentElement.classList.add('cognita'); E.irA(3.4, 700); },
        cuadro: function (t) {
          if (t > 800 && t < 900 && !this.subiendo) { this.subiendo = true; E.irA(0.55, 7000); }
          // la ola de luz: cada letrero late cuando la cámara pasa por su altura
          var l = E.centro();
          C.LETREROS.forEach(function (L) { var d = Math.abs(L.l - l); C.brillo[L.i] = 0.55 + 0.45 * Math.max(0, 1 - d / 0.5) * (0.7 + 0.3 * Math.sin(t / 120 + L.i)); });
        },
        fin: function () { C.brillo = {}; },
        frente: function (c, t) {
          var a = U.meseta(t, 5600, 6800, D - 1500, D - 300); if (a <= 0) return;
          var s = Math.min(E.W * 0.72 / 4.6, E.H * 0.16), y = E.H * (E.W > 800 ? 0.3 : 0.26);
          S.neonGrande(c, '九龍城寨', E.W / 2, y, s, S.MAG, U.tramo(t, 5800, 7600) * 4, a, false);
          S.rotulo(c, 'CYBER COGNITA · 10 / 10', E.W / 2, y + s * 1.25, a * U.tramo(t, 7600, 8200), S.CIAN);
        }
      };
    }
  });
})();
