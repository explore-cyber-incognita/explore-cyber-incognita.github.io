/* Secreto 07 · Cyberpunk (Teclado)
   Escribir CYBERPUNK. La escena: la imagen se rompe (fallo de señal), los letreros de la ciudad parpadean y en el centro
   se monta, tubo a tubo, un letrero de neón enorme con la palabra; al final todo vuelve a su sitio. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  var buffer = '';

  NI.registrar({
    id: 'cyberpunk', n: 7, nombre: 'Cyberpunk', tipo: 'Teclado',
    pista: 'Escribe el nombre de todo esto: nació como título de un relato publicado en 1983.',
    detectar: function (api) {
      api.en('tecla', function (d) { if (!d.key || d.key.length !== 1) return; buffer = (buffer + d.key.toUpperCase()).replace(/[^A-Z]/g, '').slice(-9); if (buffer === 'CYBERPUNK') { buffer = ''; api.disparar(); } });
    },
    escena: function () {
      var D = 12500 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 5600, hasta: D - 400, titulo: 'Cyberpunk', pie: 'Bruce Bethke · Amazing Stories · noviembre de 1983',
          texto: 'La palabra es el título de un relato de Bruce Bethke, escrito en 1980 y publicado en noviembre de 1983 en la revista <i>Amazing Stories</i>, sobre unos adolescentes que dominan los ordenadores. Poco después el editor Gardner Dozois la usó para nombrar a todo el movimiento: Gibson, Sterling y los demás.' },
        inicio: function () { E.irA(2.15, 1200); },
        cuadro: function (t) {
          // los letreros tiemblan con el fallo y vuelven poco a poco
          var f = 1 - U.tramo(t, 300, 2800);
          C.LETREROS.forEach(function (L, i) { C.brillo[i] = f > 0 && U._h(Math.floor(t / 70) + i * 11) < f * 0.6 ? 0.1 : 1; });
          if (t > 2800) C.brillo = {};
        },
        fin: function () { C.brillo = {}; },
        frente: function (c, t) {
          var g = (1 - U.tramo(t, 200, 1600)) + U.meseta(t, D - 1500, D - 1300, D - 1100, D - 800);
          var a = U.meseta(t, 900, 1800, D - 1300, D - 600);
          if (a > 0) { c.fillStyle = 'rgba(4,2,10,' + (0.62 * a).toFixed(3) + ')'; c.fillRect(0, 0, E.W, E.H); }
          // el letrero grande, tubo a tubo
          var txt = 'CYBERPUNK', s = Math.min(120, E.W * 0.78 / 6.2), monta = U.tramo(t, 1500, 4300) * txt.length;
          if (a > 0 && monta > 0) {
            var y = E.H * (E.W > 800 ? 0.4 : 0.34);
            // al encenderse cada letra, un destello y un chasquido de luz
            var zumbido = U._h(Math.floor(t / 60)) > 0.93 && t < 6000 ? 0.55 : 1;
            S.neonGrande(c, txt, E.W / 2, y, s, S.MAG, monta, a * zumbido, true);
            S.rotulo(c, 'BRUCE BETHKE · 1983', E.W / 2, y + s * 1.2, a * U.tramo(t, 4300, 4900), S.CIAN);
          }
          if (g > 0) S.glitch(c, Math.min(1, g), Math.floor(t / 50));
        }
      };
    }
  });
})();
