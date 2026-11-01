/* Secreto 10 · El derribo (Espera)
   Quedarse 40 s quieto en la calle. La escena: la ciudad tiembla, el polvo sube desde abajo hasta taparlo todo y, cuando
   se posa, en su lugar está el parque de 1995: el pabellón, los árboles, los faroles y el viejo yamen, bajo la misma lluvia.
   Al final el polvo vuelve y devuelve la ciudad. */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad, S = NI.esc;
  var TAU = Math.PI * 2, ESPERA = 40000, armado = true;
  var NUBES = (function () { var r = U.azar(1994), o = []; for (var i = 0; i < 26; i++) o.push({ x: r(), r: 0.12 + r() * 0.2, v: 0.6 + r() * 0.8, d: r() * 900 }); return o; })();
  var ESCOMBRO = (function () { var r = U.azar(93), o = []; for (var i = 0; i < 60; i++) o.push({ x: r(), y: r() * 0.6, v: 0.5 + r(), s: 2 + r() * 4, t: r() * 2500 }); return o; })();

  // el parque, en píxeles de pantalla: lo pinta entero en un lienzo aparte una sola vez por tamaño
  var parque = null;
  function pintarParque() {
    var W = E.W, H = E.H, d = E.dpr; if (parque && parque.W === W && parque.H === H && parque.d === d) return parque;
    var cv = document.createElement('canvas'); cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    var c = cv.getContext('2d'); c.scale(d, d);
    var r = U.azar(1995), hor = H * (W > 800 ? 0.62 : 0.44), u = Math.min(H, W * 0.9);
    // el cielo de Kowloon, con el resplandor de la ciudad de hoy
    var g = c.createLinearGradient(0, 0, 0, hor); g.addColorStop(0, '#0b0820'); g.addColorStop(0.7, '#2a1640'); g.addColorStop(1, '#5a2a5a'); c.fillStyle = g; c.fillRect(0, 0, W, hor);
    // las torres de alrededor, lejos, con sus ventanas
    for (var x = -20; x < W + 20;) {
      var w = 30 + r() * 70, h = H * (0.12 + r() * 0.22); c.fillStyle = r() < 0.5 ? '#160f26' : '#1c1430'; c.fillRect(x, hor - h, w, h);
      c.fillStyle = 'rgba(255,214,150,.5)'; for (var wy = hor - h + 6; wy < hor - 6; wy += 9) for (var wx = x + 4; wx < x + w - 4; wx += 7) if (r() < 0.18) c.fillRect(wx, wy, 3, 4);
      x += w + r() * 10;
    }
    // el césped y el camino
    var gc = c.createLinearGradient(0, hor, 0, H); gc.addColorStop(0, '#0f2a24'); gc.addColorStop(1, '#06120f'); c.fillStyle = gc; c.fillRect(0, hor, W, H - hor);
    c.fillStyle = 'rgba(170,150,190,.18)'; c.beginPath(); c.moveTo(W * 0.42, hor); c.lineTo(W * 0.5, hor); c.lineTo(W * 0.7, H); c.lineTo(W * 0.28, H); c.fill();
    // los árboles: copas redondas, oscuras, iluminadas desde abajo por los faroles
    function arbol(ax, ay, ar) {
      c.fillStyle = '#0a1a16'; c.fillRect(ax - ar * 0.06, ay - ar * 0.6, ar * 0.12, ar * 0.6);
      for (var k = 0; k < 7; k++) { var px = ax + (r() - 0.5) * ar * 1.2, py = ay - ar * 0.9 - r() * ar * 0.7, pr = ar * (0.35 + r() * 0.3); var gg = c.createRadialGradient(px, py + pr * 0.4, 0, px, py, pr); gg.addColorStop(0, '#1e4a3a'); gg.addColorStop(1, '#0a1e18'); c.fillStyle = gg; c.beginPath(); c.arc(px, py, pr, 0, TAU); c.fill(); }
    }
    [[0.06, 0.12], [0.18, 0.09], [0.86, 0.13], [0.96, 0.1], [0.34, 0.07]].forEach(function (q) { arbol(W * q[0], hor + u * 0.04, u * q[1]); });
    // el yamen: la vieja oficina de la dinastía Qing, baja, de ladrillo gris y tejado de teja
    var yx = W * (W > 800 ? 0.2 : 0.06), yw = Math.min(W * 0.32, u * 0.6), yh = u * 0.09, yy = hor + u * 0.02;
    var gm = c.createLinearGradient(0, yy - yh, 0, yy); gm.addColorStop(0, '#4a4452'); gm.addColorStop(1, '#2c2834'); c.fillStyle = gm; c.fillRect(yx, yy - yh, yw, yh);
    c.fillStyle = 'rgba(0,0,0,.18)'; for (var by = yy - yh + 4; by < yy; by += 5) c.fillRect(yx, by, yw, 1);
    c.fillStyle = 'rgba(255,255,255,.05)'; for (by = yy - yh; by < yy; by += 10) for (var bx = yx + (by % 20 ? 0 : 6); bx < yx + yw; bx += 12) c.fillRect(bx, by, 1, 5);
    c.fillStyle = '#26202c'; c.fillRect(yx - 3, yy - 4, yw + 6, 4);
    var tj = new Path2D(), ty = yy - yh, ta = u * 0.05;
    tj.moveTo(yx - u * 0.03, ty + 2); tj.quadraticCurveTo(yx - u * 0.01, ty - ta * 0.25, yx + yw * 0.12, ty - ta * 0.75); tj.lineTo(yx + yw * 0.88, ty - ta * 0.75); tj.quadraticCurveTo(yx + yw + u * 0.01, ty - ta * 0.25, yx + yw + u * 0.03, ty + 2); tj.closePath();
    c.fillStyle = '#17131c'; c.fill(tj);
    c.save(); c.clip(tj); c.strokeStyle = 'rgba(150,130,170,.22)'; c.lineWidth = 1; for (var tx = yx - u * 0.03; tx < yx + yw + u * 0.03; tx += 5) { c.beginPath(); c.moveTo(tx, ty + 2); c.lineTo(tx + (tx - yx - yw / 2) * 0.04, ty - ta); c.stroke(); } c.restore();
    c.fillStyle = '#100c14'; c.fillRect(yx + yw * 0.1, ty - ta * 0.85, yw * 0.8, ta * 0.14);   // la cumbrera
    c.strokeStyle = 'rgba(255,170,190,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(yx + yw * 0.1, ty - ta * 0.85); c.lineTo(yx + yw * 0.9, ty - ta * 0.85); c.stroke();
    [[yx + yw * 0.1, -1], [yx + yw * 0.9, 1]].forEach(function (q) { c.fillStyle = '#100c14'; c.beginPath(); c.moveTo(q[0], ty - ta * 0.71); c.quadraticCurveTo(q[0] + q[1] * ta * 0.3, ty - ta * 0.8, q[0] + q[1] * ta * 0.4, ty - ta * 1.15); c.lineTo(q[0] + q[1] * ta * 0.1, ty - ta * 0.85); c.fill(); });
    c.fillStyle = '#2a1a10'; c.fillRect(yx + yw * 0.43, ty + yh * 0.06, yw * 0.14, yh * 0.16); c.strokeStyle = '#c89a4a'; c.lineWidth = 1; c.strokeRect(yx + yw * 0.43 + 1.5, ty + yh * 0.06 + 1.5, yw * 0.14 - 3, yh * 0.16 - 3);   // la placa
    [0.15, 0.3, 0.7, 0.85].forEach(function (k) { c.fillStyle = '#ffcf8a'; c.globalAlpha = 0.55; c.fillRect(yx + yw * k - 4, yy - yh * 0.6, 8, yh * 0.32); c.globalAlpha = 1; c.fillStyle = '#2c2834'; c.fillRect(yx + yw * k - 0.5, yy - yh * 0.6, 1, yh * 0.32); });   // las ventanas
    c.fillStyle = '#ffcf8a'; c.fillRect(yx + yw * 0.45, yy - yh * 0.62, yw * 0.1, yh * 0.62);   // la puerta, abierta y con luz
    c.fillStyle = 'rgba(255,200,130,.16)'; c.beginPath(); c.moveTo(yx + yw * 0.45, yy); c.lineTo(yx + yw * 0.55, yy); c.lineTo(yx + yw * 0.62, yy + u * 0.06); c.lineTo(yx + yw * 0.38, yy + u * 0.06); c.fill();
    // el pabellón, con su tejado de puntas levantadas, en el centro
    var px = W * (W > 800 ? 0.62 : 0.66), pw = u * 0.2, py = hor + u * 0.05, ph = u * 0.1;
    c.fillStyle = '#2a0e14'; [-0.42, -0.14, 0.14, 0.42].forEach(function (k) { c.fillRect(px + k * pw - 3, py - ph, 6, ph); });
    c.fillStyle = '#5a1a20'; c.fillRect(px - pw * 0.48, py - ph - 4, pw * 0.96, 6);
    c.fillStyle = '#141018'; c.beginPath(); c.moveTo(px - pw * 0.7, py - ph - u * 0.005); c.quadraticCurveTo(px - pw * 0.55, py - ph - u * 0.012, px - pw * 0.35, py - ph - u * 0.05); c.lineTo(px, py - ph - u * 0.095); c.lineTo(px + pw * 0.35, py - ph - u * 0.05); c.quadraticCurveTo(px + pw * 0.55, py - ph - u * 0.012, px + pw * 0.7, py - ph - u * 0.005); c.lineTo(px + pw * 0.5, py - ph); c.lineTo(px - pw * 0.5, py - ph); c.closePath(); c.fill();
    c.fillStyle = '#c89a4a'; c.beginPath(); c.arc(px, py - ph - u * 0.1, 3, 0, TAU); c.fill();
    c.fillStyle = '#1e1a22'; c.fillRect(px - pw * 0.6, py, pw * 1.2, u * 0.012);
    // el estanque delante del pabellón, que refleja el cielo
    c.fillStyle = 'rgba(90,50,110,.45)'; c.beginPath(); c.ellipse(px, py + u * 0.07, pw * 0.8, u * 0.022, 0, 0, TAU); c.fill();
    parque = { c: cv, W: W, H: H, d: d, faroles: [[0.12, 0.08], [0.3, 0.14], [0.5, 0.06], [0.78, 0.12], [0.93, 0.08]].map(function (q) { return [W * q[0], hor + H * q[1]]; }), hor: hor, pav: [px, py - ph * 0.5] };
    return parque;
  }

  NI.registrar({
    id: 'derribo', n: 10, nombre: 'El derribo', tipo: 'Espera',
    pista: 'Quédate en la calle, quieto, hasta que la ciudad desaparezca.',
    detectar: function (api) {
      api.en('cuadro', function (d) {
        var abajo = E.centro() > 3.35, abierto = document.documentElement.classList.contains('cuaderno-abierto');
        if (!abajo || d.inactivo < 1000) armado = true;
        if (armado && abajo && !abierto && d.inactivo >= ESPERA) { armado = false; api.disparar(); }
      });
    },
    escena: function () {
      var D = 15000 + E.lectura, base = null, T_POLVO = 900, T_PARQUE = 4600, T_VUELVE = D - 2400;
      return {
        duracion: D,
        tarjeta: { en: 7400, hasta: D - 2600, titulo: 'El derribo', pie: 'Marzo de 1993 – abril de 1994 · el parque, 22 de diciembre de 1995',
          texto: 'La ciudad amurallada se derribó entre marzo de 1993 y abril de 1994, después de desalojar a sus vecinos. En su lugar se abrió el 22 de diciembre de 1995 el Parque de la Ciudad Amurallada de Kowloon, un jardín al estilo de los jardines clásicos chinos que conserva el antiguo yamen, la oficina de la época Qing, y los cimientos de la puerta sur.' },
        inicio: function () { E.irA(2.85, 1200); },
        cuadro: function (t) {
          if (t > 1250 && base == null) base = E.camY;
          if (base != null) S.sacudir(base, 7 * U.meseta(t, 1300, 1700, 3600, 4600), t);
        },
        frente: function (c, t) {
          var W = E.W, H = E.H;
          // el polvo: sube desde la calle, lo tapa todo y luego se posa (y vuelve al final)
          var sube = U.tramo(t, T_POLVO, T_PARQUE), posa = U.tramo(t, T_PARQUE, T_PARQUE + 1800), vuelve = U.tramo(t, T_VUELVE - 600, T_VUELVE + 600), sale = U.tramo(t, T_VUELVE + 600, D - 200);
          var parqueA = U.suave(posa) * (1 - U.suave(vuelve));
          if (parqueA > 0) {
            var P = pintarParque(); c.save(); c.globalAlpha = parqueA; c.drawImage(P.c, 0, 0, W, H);
            // los faroles, que respiran, y su luz en el césped
            c.globalCompositeOperation = 'lighter';
            P.faroles.forEach(function (f, i) {
              var b = 0.8 + 0.2 * Math.sin(t / 700 + i * 1.7), gl = c.createRadialGradient(f[0], f[1], 0, f[0], f[1], 70); gl.addColorStop(0, 'rgba(255,90,60,' + (0.45 * b).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,90,60,0)');
              c.fillStyle = gl; c.fillRect(f[0] - 70, f[1] - 70, 140, 140);
              c.globalCompositeOperation = 'source-over'; c.fillStyle = '#120e16'; c.fillRect(f[0] - 1.5, f[1] + 8, 3, E.H * 0.09); c.fillRect(f[0] - 5, f[1] - 11, 10, 3);
              c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,120,80,' + b.toFixed(3) + ')'; c.beginPath(); c.ellipse(f[0], f[1], 6, 8, 0, 0, TAU); c.fill();
            });
            c.globalCompositeOperation = 'source-over';
            // la misma lluvia, encima del parque
            c.strokeStyle = 'rgba(200,210,255,.22)'; c.lineWidth = 1; c.beginPath();
            for (var i = 0; i < 160; i++) { var gx = U._h(i * 1.3) * (W + 40), gy = (U._h(i * 2.7) * (H + 60) + t * (0.9 + U._h(i) * 0.5)) % (H + 60) - 30; c.moveTo(gx, gy); c.lineTo(gx - 4, gy + 20); }
            c.stroke(); c.restore();
          }
          // las nubes de polvo
          var masa = U.suave(sube) * (1 - U.suave(posa)) + U.suave(vuelve) * (1 - U.suave(sale));
          if (masa > 0) {
            c.fillStyle = 'rgba(60,54,64,' + (0.85 * masa).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
            NUBES.forEach(function (n) {
              var k = U.tramo(t - n.d, T_POLVO, T_PARQUE + 600), y = H * (1.15 - k * n.v * 0.9), rr = Math.min(W, H) * n.r * (0.6 + k);
              S.polvo(c, n.x * W, y, rr, 0.55 * masa);
            });
          }
          // los cascotes que caen mientras tiembla
          var cae = U.meseta(t, 1300, 1700, 3600, 4400);
          if (cae > 0) { c.fillStyle = 'rgba(30,26,34,' + (0.9 * cae).toFixed(3) + ')'; ESCOMBRO.forEach(function (e) { var k = ((t + e.t) % 1400) / 1400; c.fillRect(e.x * W, (e.y + k * k * 1.2 * e.v) * H, e.s, e.s); }); }
          S.rotulo(c, 'EL DERRIBO · 1993 – 1994', W / 2, H * 0.12, U.meseta(t, 1400, 2000, T_PARQUE - 200, T_PARQUE + 300), '#ece6ff');
          S.rotulo(c, 'EL PARQUE · 1995', W / 2, H * 0.12, U.meseta(t, T_PARQUE + 1600, T_PARQUE + 2200, T_VUELVE - 900, T_VUELVE - 400), S.MAG);
        }
      };
    }
  });
})();
