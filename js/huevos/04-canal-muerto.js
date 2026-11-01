/* Secreto 04 · El canal muerto (Lugar)
   Pulsar una ventana con la tele encendida. La escena: la estática de la tele sale de la ventana y se come la pantalla
   entera —el cielo del color de un canal muerto— y al final se apaga como un televisor viejo, en una raya y un punto. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  var TAU = Math.PI * 2;
  function teleCerca(l) { var best = null; C.TELES.forEach(function (v) { if (!best || Math.abs(v.l - l) < Math.abs(best.l - l)) best = v; }); return best; }
  function sobre(v, d) { return d.xu >= v.xu - 0.01 && d.xu <= v.xu + v.w + 0.01 && d.l >= v.l - 0.01 && d.l <= v.l + v.h + 0.01; }

  NI.registrar({
    id: 'canal-muerto', n: 4, nombre: 'El canal muerto', tipo: 'Lugar',
    pista: 'Una tele sin señal tiene el color de un cielo famoso.',
    lugar: function () { var v = teleCerca(2.2); return v ? v.l : null; }, radio: 0.3,
    detectar: function (api) {
      api.en('clic', function (d) { for (var i = 0; i < C.TELES.length; i++) if (sobre(C.TELES[i], d)) { api.disparar({ v: C.TELES[i] }); return; } });
    },
    escena: function (motor, datos) {
      var D = 11500 + E.lectura, v = (datos && datos.v) || teleCerca(E.centro());
      return {
        duracion: D,
        tarjeta: { en: 7000, hasta: D - 400, titulo: 'El canal muerto', pie: 'William Gibson · Neuromante · 1984',
          texto: '«El cielo sobre el puerto tenía el color de una pantalla de televisor sintonizado en un canal muerto». Así empieza <i>Neuromante</i>, la novela de William Gibson publicada en 1984 que fundó el ciberpunk.' },
        inicio: function () { E.irA(v.l + v.h / 2, 900); },
        frente: function (c, t) {
          var x = E.sx(v.xu + v.w / 2), y = E.sy(v.l + v.h / 2), R = Math.hypot(E.W, E.H);
          var k = U.inOut(U.tramo(t, 800, 3600)), off = U.tramo(t, 4600, 5800), r = U.lerp(Math.max(v.w, v.h) * E.u * 0.6, R, k);
          if (off < 1) {
            c.save(); c.beginPath();
            if (off > 0) { var hh = U.lerp(E.H, 2, Math.min(1, off * 1.6)), ww = off > 0.62 ? U.lerp(E.W, 4, (off - 0.62) / 0.38) : E.W; c.rect(E.W / 2 - ww / 2, E.H / 2 - hh / 2, ww, hh); }
            else c.arc(x, y, r, 0, TAU);
            c.clip(); S.estatica(c, 0, 0, E.W, E.H, 0.92);
            c.restore();
            // al apagarse, fuera de la raya la pantalla queda negra, como un televisor viejo
            if (off > 0) { c.save(); c.beginPath(); c.rect(0, 0, E.W, E.H); c.rect(E.W / 2 - ww / 2, E.H / 2 - hh / 2, ww, hh); c.fillStyle = '#020105'; c.fill('evenodd'); c.restore(); }
            if (off > 0.6) { c.save(); c.globalCompositeOperation = 'lighter'; var g = c.createRadialGradient(E.W / 2, E.H / 2, 0, E.W / 2, E.H / 2, 40); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(E.W / 2 - 40, E.H / 2 - 40, 80, 80); c.restore(); }
          }
          else { var neg = 1 - U.tramo(t, 5800, 7000); if (neg > 0) { c.fillStyle = 'rgba(2,1,5,' + neg.toFixed(3) + ')'; c.fillRect(0, 0, E.W, E.H); } }
          S.rotulo(c, 'CANAL MUERTO', E.W / 2, E.H * 0.12, U.meseta(t, 2600, 3200, 4200, 4600), '#ece6ff');
          S.rotulo(c, 'NEUROMANTE · 1984', E.W / 2, E.H * 0.12, U.meseta(t, 6600, 7200, D - 1500, D - 400), S.MAG);
        }
      };
    }
  });
})();
