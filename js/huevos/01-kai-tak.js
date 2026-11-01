/* Secreto 01 · Kai Tak (Espera)
   Quedarse quieto 25 s arriba, con la azotea a la vista: el siguiente 747 pasa rozando los tejados.
   La escena: la cámara en la azotea; el avión enorme, bajísimo, con el tren fuera y los focos; la ciudad tiembla, la ropa
   se agita, los de la azotea se agachan y miran; los focos barren las antenas. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  var ESPERA = 25000, armado = true;

  NI.registrar({
    id: 'kai-tak', n: 1, nombre: 'Kai Tak', tipo: 'Espera',
    pista: 'En la azotea, quédate quieto: el siguiente avión pasará más bajo que nunca.',
    lugar: function () { return C.TECHO - 0.15; }, radio: 0.5,
    detectar: function (api) {
      api.en('cuadro', function (d) {
        var arriba = E.centro() < C.TECHO + 0.35, abierto = document.documentElement.classList.contains('cuaderno-abierto');
        if (!arriba || d.inactivo < 1000) armado = true;
        if (armado && arriba && !abierto && d.inactivo >= ESPERA) { armado = false; api.disparar(); }
      });
    },
    escena: function () {
      var D = 13500 + E.lectura, base = null, T0 = 2200, T1 = 9200;
      return {
        duracion: D,
        tarjeta: { en: 9000, hasta: D - 400, titulo: 'Kai Tak', pie: 'Kai Tak · cerró el 6 de julio de 1998',
          texto: 'El aeropuerto de Hong Kong, Kai Tak, estaba justo al lado. Los aviones bajaban por encima de los tejados de Kowloon, buscaban la colina del tablero de ajedrez y giraban a muy poca altura justo antes de tomar tierra; por eso la ciudad amurallada no podía pasar de unas catorce plantas. Kai Tak cerró el 6 de julio de 1998.' },
        inicio: function () { E.irA(C.TECHO - 0.16, 1400); },
        cuadro: function (t) {
          var k = U.tramo(t, T0, T1);
          C.avionEscena = t > T0 - 200 && t < T1 + 200 ? { k: k, s: 0.95, l0: 0.2, l1: 0.42 } : null;
          if (t > 1450 && base == null) base = E.camY;
          var cerca = Math.max(0, 1 - Math.abs(k - 0.5) * 2.6);
          if (base != null) S.sacudir(base, 6 * cerca * cerca, t);
          C.vientoExtra = cerca;
        },
        fin: function () { C.avionEscena = null; C.vientoExtra = 0; },
        frente: function (c, t) {
          var k = U.tramo(t, T0, T1), cerca = Math.max(0, 1 - Math.abs(k - 0.5) * 2.6);
          // el fogonazo de los focos al pasar por encima
          if (cerca > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,245,220,' + (0.06 * cerca * cerca).toFixed(3) + ')'; c.fillRect(0, 0, E.W, E.H); c.restore(); }
          S.rotulo(c, 'KAI TAK · APROXIMACIÓN A LA PISTA 13', E.W / 2, E.H * 0.12, U.meseta(t, 1600, 2200, T1, T1 + 600), S.CIAN);
          S.rotulo(c, 'KAI TAK · 1998', E.W / 2, E.H * 0.12, U.meseta(t, T1 + 600, T1 + 1200, D - 1500, D - 400), S.MAG);
        }
      };
    }
  });
})();
