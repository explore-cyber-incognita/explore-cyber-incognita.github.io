/* Secreto 09 · Los neones que se apagan (Lugar)
   Pulsar el letrero de HOTEL, el que tiene letras fundidas. La escena: los letreros se apagan uno tras otro desde el
   HOTEL, con un chisporroteo, hasta que solo queda la lluvia; al final vuelven a encenderse. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, A = NI.arte, C = NI.ciudad, S = NI.esc;
  var HOTEL = null; C.LETREROS.forEach(function (L) { if (L.t === 'HOTEL') HOTEL = L; });

  NI.registrar({
    id: 'neones', n: 9, nombre: 'Los neones que se apagan', tipo: 'Lugar',
    pista: 'Hay un letrero con letras fundidas que ya casi no se tiene en pie. Tócalo.',
    lugar: function () { return HOTEL.l; }, radio: 0.3,
    detectar: function (api) {
      api.en('clic', function (d) {
        var g = A.letreroGeo(HOTEL, E.sx(HOTEL.xu), E.sy(HOTEL.l), HOTEL.s * E.u);
        if (d.x > g.x0 - 8 && d.x < g.x0 + g.w + 8 && d.y > g.y0 - 8 && d.y < g.y0 + g.h + 8) api.disparar();
      });
    },
    escena: function () {
      var D = 14000 + E.lectura, orden = C.LETREROS.slice().sort(function (a, b) { return Math.hypot(a.xu - HOTEL.xu, a.l - HOTEL.l) - Math.hypot(b.xu - HOTEL.xu, b.l - HOTEL.l); });
      var cuando = {}; orden.forEach(function (L, k) { cuando[L.i] = 1400 + k * 330; });
      var vuelven = D - 3200;
      return {
        duracion: D,
        tarjeta: { en: 7600, hasta: D - 400, titulo: 'Los neones que se apagan', pie: 'Hong Kong · del neón al LED',
          texto: 'Se calcula que Hong Kong llegó a tener unos 120.000 letreros de neón (es una cifra sin confirmar). Desde hace años el Gobierno retira miles de letreros abandonados o peligrosos, muchos de neón, y los nuevos se hacen con LED; quedan muy pocos maestros que doblen los tubos a mano.' },
        inicio: function () { E.irA(Math.min(2.2, HOTEL.l + 0.55), 1300); },
        cuadro: function (t) {
          C.LETREROS.forEach(function (L) {
            var t0 = cuando[L.i], t1 = vuelven + (orden.length - orden.indexOf(L)) * 60, b;
            if (t < t0 - 600) b = 1;
            else if (t < t0) b = U._h(Math.floor(t / 60) + L.i * 5) > 0.5 ? 1 : 0.15;   // el tubo que falla antes de apagarse
            else if (t < t1) b = 0;
            else b = U._h(Math.floor(t / 55) + L.i) > 0.4 || t > t1 + 500 ? 1 : 0.1;
            C.brillo[L.i] = b;
          });
        },
        fin: function () { C.brillo = {}; },
        frente: function (c, t) {
          // el chisporroteo de cada letrero al apagarse
          C.LETREROS.forEach(function (L) { var t0 = cuando[L.i]; if (t < t0 || t > t0 + 900) return; S.chispas(c, E.sx(L.xu), E.sy(L.l), t0, t, 16); });
          // la ciudad se queda a oscuras: un velo que acompaña al apagón
          var osc = U.tramo(t, 1400, 1400 + orden.length * 330) * (1 - U.tramo(t, vuelven, vuelven + 1200));
          if (osc > 0) { c.fillStyle = 'rgba(3,2,8,' + (0.35 * osc).toFixed(3) + ')'; c.fillRect(0, 0, E.W, E.H); }
          S.rotulo(c, 'HONG KONG · UNOS 120.000 NEONES', E.W / 2, E.H * 0.12, U.meseta(t, 1200, 1800, 4400, 5000), S.MAG);
          S.rotulo(c, 'HOY QUEDAN MUY POCOS', E.W / 2, E.H * 0.12, U.meseta(t, 5200, 5800, vuelven - 200, vuelven + 300), '#ece6ff');
        }
      };
    }
  });
})();
