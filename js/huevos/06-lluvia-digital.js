/* Secreto 06 · La lluvia digital (Gesto)
   Pasar el dedo (o arrastrar) de lado a lado, como un limpiaparabrisas. La escena: el barrido limpia la lluvia y detrás
   aparece la otra lluvia, la verde: columnas de katakana del revés que caen sobre la ciudad. Al final, otro barrido la
   devuelve. Los caracteres van pintados en un atlas (una vez) y cada fotograma solo los copia. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, A = NI.arte, S = NI.esc;
  // katakana de media anchura, números y alguna letra: lo que se ve en la pantalla de Matrix
  var GLIFOS = Array.from('ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123457890Z:.=*+-<>');
  var atlas = null;
  function hacerAtlas(fs) {
    var d = E.dpr, k = atlas && atlas.fs === fs && atlas.d === d ? atlas : null; if (k) return k;
    var n = GLIFOS.length, c = document.createElement('canvas'); c.width = Math.ceil(n * fs * d); c.height = Math.ceil(fs * 3 * d);
    var x = c.getContext('2d'); x.scale(d, d); x.textAlign = 'center'; x.textBaseline = 'middle';
    // tres filas: verde, verde claro y la cabeza blanca; cada glifo del revés, como en un espejo
    [['#1fd65a', 0], ['#8dffb0', 1], ['#f2fff4', 2]].forEach(function (q) {
      x.fillStyle = q[0]; x.shadowColor = q[1] === 2 ? '#9dffbe' : '#00ff66'; x.shadowBlur = fs * 0.35;
      GLIFOS.forEach(function (g, i) {
        x.save(); x.translate((i + 0.5) * fs, (q[1] + 0.5) * fs); x.scale(-1, 1);
        x.font = '700 ' + Math.round(fs * 0.86) + 'px ' + (/[0-9A-Z:.=*+\-<>]/.test(g) ? A.LAT : A.CJK); x.fillText(g, 0, 0); x.restore();
      });
    });
    atlas = { c: c, fs: fs, d: d, n: n };
    return atlas;
  }
  function columnas(n, semilla) { var r = U.azar(semilla), out = []; for (var i = 0; i < n; i++) out.push({ v: 0.35 + r() * 0.9, o: r() * 40, largo: 8 + Math.floor(r() * 18), s: Math.floor(r() * 1e5) }); return out; }
  function lluviaVerde(c, t, cols, fs) {
    var at = hacerAtlas(fs), filas = Math.ceil(E.H / fs) + 1, d = at.d;
    for (var i = 0; i < cols.length; i++) {
      var q = cols[i], cab = (t / 1000 * q.v * 9 + q.o) % (filas + q.largo + 6), x = i * fs;
      for (var j = 0; j < q.largo; j++) {
        var fila = Math.floor(cab) - j; if (fila < 0 || fila > filas) continue;
        // el glifo cambia de vez en cuando, cada uno a su ritmo
        var gi = Math.floor(U._h(q.s + fila * 7.3 + Math.floor(t / (180 + (q.s % 7) * 60))) * at.n), fil = j === 0 ? 2 : j < 3 ? 1 : 0;
        c.globalAlpha = j === 0 ? 1 : Math.max(0, 1 - j / q.largo) * 0.9;
        c.drawImage(at.c, gi * fs * d, fil * fs * d, fs * d, fs * d, x, fila * fs, fs, fs);
      }
    }
    c.globalAlpha = 1;
  }

  NI.registrar({
    id: 'lluvia-digital', n: 6, nombre: 'La lluvia digital', tipo: 'Gesto',
    pista: 'Limpia la lluvia de lado a lado, como un limpiaparabrisas, y mira lo que cae detrás.',
    detectar: function (api) {
      api.en('trazo', function (d) {
        var p = d.pts; if (p.length < 4) return;
        var a = p[0], b = p[p.length - 1], dx = b.x - a.x, alto = 0;
        p.forEach(function (q) { alto = Math.max(alto, Math.abs(q.y - a.y)); });
        if (Math.abs(dx) > E.W * 0.55 && alto < E.H * 0.12 && d.dur < 1600) api.disparar({ dir: dx > 0 ? 1 : -1 });
      });
    },
    escena: function (motor, datos) {
      var D = 12500 + E.lectura, dir = (datos && datos.dir) || 1, fs = Math.max(15, Math.round(Math.min(E.W, 1600) / 52)), cols = columnas(Math.ceil(E.W / fs) + 1, 1999);
      function barrido(c, k, verde) {   // la franja limpia, que avanza en la dirección del gesto
        var x = dir > 0 ? U.lerp(-E.W * 0.1, E.W * 1.1, k) : U.lerp(E.W * 1.1, -E.W * 0.1, k);
        c.beginPath(); if (verde === (dir > 0)) c.rect(0, 0, x, E.H); else c.rect(x, 0, E.W - x, E.H);
        return x;
      }
      return {
        duracion: D,
        tarjeta: { en: 5200, hasta: D - 400, titulo: 'La lluvia digital', pie: 'Matrix · 1999 · Simon Whiteley',
          texto: 'Los caracteres verdes que caen en <i>Matrix</i> (1999) los diseñó Simon Whiteley, que contó que los sacó de los libros de cocina japonesa de su mujer (de recetas de sushi, bromeaba). Son sobre todo katakana y números, puestos del revés, como vistos en un espejo.' },
        frente: function (c, t) {
          var ida = U.inOut(U.tramo(t, 200, 1500)), vuelta = U.inOut(U.tramo(t, D - 1900, D - 500));
          if (ida <= 0) return;
          c.save();
          // la zona verde: lo que ha limpiado la ida y aún no ha devuelto la vuelta
          c.beginPath();
          var x1 = dir > 0 ? U.lerp(-E.W * 0.1, E.W * 1.1, ida) : U.lerp(E.W * 1.1, -E.W * 0.1, ida), x2 = dir > 0 ? U.lerp(-E.W * 0.1, E.W * 1.1, vuelta) : U.lerp(E.W * 1.1, -E.W * 0.1, vuelta);
          if (dir > 0) c.rect(x2, 0, Math.max(0, x1 - x2), E.H); else c.rect(x1, 0, Math.max(0, x2 - x1), E.H);
          c.clip();
          c.fillStyle = 'rgba(0,10,4,.86)'; c.fillRect(0, 0, E.W, E.H);
          lluviaVerde(c, t, cols, fs);
          // un velo verde que deja ver, debajo, la silueta de la ciudad
          c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(0,60,20,.12)'; c.fillRect(0, 0, E.W, E.H);
          c.restore();
          // el filo del barrido, como la goma de un limpiaparabrisas que brilla
          [[x1, ida], [x2, vuelta]].forEach(function (q) {
            if (q[1] <= 0 || q[1] >= 1) return;
            var g = c.createLinearGradient(q[0] - 30, 0, q[0] + 30, 0); g.addColorStop(0, 'rgba(140,255,180,0)'); g.addColorStop(0.5, 'rgba(200,255,220,.5)'); g.addColorStop(1, 'rgba(140,255,180,0)');
            c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(q[0] - 30, 0, 60, E.H); c.restore();
          });
          S.rotulo(c, 'LA LLUVIA DIGITAL · 1999', E.W / 2, E.H * 0.12, U.meseta(t, 1400, 2000, D - 2200, D - 1700), '#8dffb0');
        }
      };
    }
  });
})();
