/* Cyber Incognita · sonido
   Todo sintetizado con Web Audio, sin archivos (como en Iaponia y Pascua):
   - la lluvia (sube y baja con la de la ciudad), el zumbido grave de la ciudad, el de los neones, los truenos después de
     cada relámpago y los 747 que pasan (más fuerte cuanto más cerca y más arriba estás);
   - abajo, el tráfico: cada taxi, minibús y el autobús de dos pisos suena donde está (motor, ruedas en el agua, a la
     izquierda o a la derecha) y de vez en cuando pita un claxon; y la gente: voces que charlan, ríen y pregonan, con la
     melodía de una lengua tonal como el cantonés (más fuerte en la calle, flojas desde las ventanas);
   - una banda de sintetizador lenta, a lo Vangelis: cuatro voces de sierras desafinadas por un filtro que respira, con
     notas sueltas de campana encima (la menor pentatónica);
   - al descubrir un secreto, un chispazo de neón y un acorde; cada escena con lo suyo (la estática, la moto, el derribo…).
   Empieza apagado: el botón ♪ lo enciende y se recuerda. Los navegadores solo dejan sonar después de un gesto.
   Las escenas suenan por su propio canal: si se salta la escena, su sonido se apaga con ella. */
(function () {
  'use strict';
  var NI = window.NI, E = NI.motor, U = NI.util, C = NI.ciudad, CLAVE = 'cyber-incognita.sonido';
  var S = NI.sonido = { activo: false };
  var ac = null, master, salaEnv, ruido, musica, AMB = null, bus = null, escBus = null;
  var lluvia, ciudad, neon, jet, silbido, voces = [], filtroPad, trafico = [], bus2 = null, gente = null, murmullo = null, hablantes = [];
  // la menor pentatónica, para las notas sueltas
  var PENTA = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  // los acordes de la banda (graves a agudos): la m9, fa maj7, do maj7 / sol, mi m7
  var ACORDES = [[110, 164.81, 246.94, 261.63], [87.31, 130.81, 164.81, 220], [98, 164.81, 246.94, 261.63], [82.41, 123.47, 146.83, 196]];

  function crear() {
    var Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    ac = new Ctx();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    var conv = ac.createConvolver(); conv.buffer = impulso(3.6, 2.2);
    salaEnv = ac.createGain(); salaEnv.gain.value = 0.5; salaEnv.connect(conv); var rv = ac.createGain(); rv.gain.value = 0.45; conv.connect(rv); rv.connect(master);
    musica = ac.createGain(); musica.gain.value = 1; musica.connect(master); var ms = ac.createGain(); ms.gain.value = 0.7; musica.connect(ms); ms.connect(salaEnv);
    AMB = { seco: master, sala: salaEnv }; bus = AMB;
    ruido = bufferRuido(4);
    lluvia = bucle('highpass', 1400, 0.4, 0); var l2 = ac.createBiquadFilter(); l2.type = 'peaking'; l2.frequency.value = 5200; l2.gain.value = 6; lluvia.f.disconnect(); lluvia.f.connect(l2); l2.connect(lluvia.g);
    ciudad = bucle('lowpass', 150, 0.6, 1.1);
    jet = bucle('lowpass', 400, 0.8, 2.2);
    // el zumbido de los neones (la red de Hong Kong va a 50 Hz: el tubo zumba a 100)
    var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 100; var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 300; f.Q.value = 1.2;
    neon = ac.createGain(); neon.gain.value = 0; o.connect(f); f.connect(neon); neon.connect(master); o.start();
    // el silbido de las turbinas, que baja de tono al pasar (Doppler)
    silbido = ac.createOscillator(); silbido.type = 'sine'; silbido.frequency.value = 2100; var sg = ac.createGain(); sg.gain.value = 0; silbido.connect(sg); sg.connect(master); silbido.start(); silbido.g = sg;
    // el tráfico: una voz por coche (motor + ruedas en el asfalto mojado), cada una con su sitio en el estéreo
    C.COCHES.forEach(function (co) { trafico.push(vozCoche(co.tipo === 'minibus' ? 62 : 74, 0.5)); });
    bus2 = vozCoche(44, 0.8);
    // la gente: un canal con eco de calle, el murmullo de fondo y seis personas que hablan a ratos
    gente = ac.createGain(); gente.gain.value = 0; var gf = ac.createBiquadFilter(); gf.type = 'lowpass'; gf.frequency.value = 2800;
    gente.connect(gf); gf.connect(master); var gs = ac.createGain(); gs.gain.value = 0.5; gf.connect(gs); gs.connect(salaEnv);
    murmullo = bucle('bandpass', 520, 0.9, 3.1); murmullo.g.disconnect(); murmullo.g.connect(gente);
    for (var h = 0; h < 6; h++) hablantes.push({ prox: 1 + Math.random() * 4, f0: h % 2 ? 105 + Math.random() * 25 : 185 + Math.random() * 40, pan: -0.8 + h * 0.32 });
    // la banda: cuatro voces, cada una dos sierras desafinadas, por un filtro que respira
    filtroPad = ac.createBiquadFilter(); filtroPad.type = 'lowpass'; filtroPad.frequency.value = 700; filtroPad.Q.value = 0.8;
    var pad = ac.createGain(); pad.gain.value = 0.022; filtroPad.connect(pad); pad.connect(musica);
    var lfo = ac.createOscillator(); lfo.frequency.value = 0.07; var lg = ac.createGain(); lg.gain.value = 380; lfo.connect(lg); lg.connect(filtroPad.frequency); lfo.start();
    ACORDES[0].forEach(function (fr) {
      var v = [-6, 6].map(function (cents) { var x = ac.createOscillator(); x.type = 'sawtooth'; x.frequency.value = fr; x.detune.value = cents; x.connect(filtroPad); x.start(); return x; });
      voces.push(v);
    });
    return true;
  }
  function bucle(tipo, frec, q, desde) {
    var s = ac.createBufferSource(); s.buffer = ruido; s.loop = true;
    var f = ac.createBiquadFilter(); f.type = tipo; f.frequency.value = frec; f.Q.value = q;
    var g = ac.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(0, desde || 0);
    return { f: f, g: g };
  }
  function bufferRuido(seg) {
    var n = Math.floor(ac.sampleRate * seg), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < n; i++) { var w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
    return b;
  }
  function impulso(seg, caida) {
    var n = Math.floor(ac.sampleRate * seg), b = ac.createBuffer(2, n, ac.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida); }
    return b;
  }
  // por dónde sale un sonido: seco y a la sala, por el canal de ahora (el ambiente o el de la escena)
  function salida(nodo, sala) { nodo.connect(bus.seco); if (sala) { var g = ac.createGain(); g.gain.value = sala; nodo.connect(g); g.connect(bus.sala); } }
  function env(g, t, ataque, vol, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + ataque); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  // una meseta: sube de t0 a t1, aguanta hasta t2 y se va hasta t3
  function meseta(g, t0, t1, t2, t3, vol) { g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t1); g.gain.setValueAtTime(vol, t2); g.gain.linearRampToValueAtTime(0, t3); }
  function tono(tipo, f, t, dur, vol, op) {
    op = op || {};
    var o = ac.createOscillator(), g = ac.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (op.f2) o.frequency.exponentialRampToValueAtTime(op.f2, t + (op.glide || dur));
    env(g, t, op.ataque || 0.01, vol, dur);
    if (op.filtro) { var fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = op.filtro; fl.Q.value = op.q || 0.7; o.connect(fl); fl.connect(g); } else o.connect(g);
    salida(g, op.sala == null ? 0.4 : op.sala); o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function golpe(t, dur, frec, vol, tipo, op) {
    op = op || {};
    var s = ac.createBufferSource(); s.buffer = ruido; s.loop = true; var f = ac.createBiquadFilter(); f.type = tipo || 'lowpass'; f.frequency.setValueAtTime(frec, t); f.Q.value = op.q || (tipo === 'bandpass' ? 2 : 0.7);
    if (op.f2) f.frequency.exponentialRampToValueAtTime(op.f2, t + (op.barre || dur));
    var g = ac.createGain(); env(g, t, op.ataque || Math.min(0.02, dur * 0.2), vol, dur);
    s.connect(f); f.connect(g); salida(g, op.sala == null ? 0.3 : op.sala); s.start(t, Math.random() * 2); s.stop(t + dur + 0.05);
  }
  // ruido sostenido con meseta (estática, chirridos, el derrumbe)
  function ruidoLargo(t0, t1, t2, t3, frec, vol, tipo, q) {
    var s = ac.createBufferSource(); s.buffer = ruido; s.loop = true; var f = ac.createBiquadFilter(); f.type = tipo || 'lowpass'; f.frequency.value = frec; f.Q.value = q || 0.7;
    var g = ac.createGain(); meseta(g, t0, t1, t2, t3, vol); s.connect(f); f.connect(g); salida(g, 0.25); s.start(t0, Math.random() * 2); s.stop(t3 + 0.05);
    return f;
  }
  function campana(f, t, vol) { [1, 2.0, 3.01, 4.2].forEach(function (k, i) { tono('sine', f * k, t, 3.2 / (i + 1), vol / (i * 1.5 + 1), { ataque: 0.006, sala: 0.9 }); }); }
  function campanaMusica(f, t, vol) { var b = bus; bus = { seco: musica, sala: salaEnv }; campana(f, t, vol); bus = b; }
  // el chispazo de un neón al encenderse o fundirse: un clic y el zumbido que arranca
  function chispazo(t, vol) { golpe(t, 0.05, 3500, vol, 'bandpass', { q: 1 }); tono('sawtooth', 100, t + 0.01, 0.35, vol * 0.35, { filtro: 600, sala: 0.2 }); }
  function acorde(t, notas, dur, vol, filtro) { notas.forEach(function (f) { [-7, 7].forEach(function (c) { var o = tono('sawtooth', f, t, dur, vol, { ataque: dur * 0.3, filtro: filtro || 1100, sala: 0.9 }); o.detune.value = c; }); }); }
  function trueno(t, vol) { golpe(t, 3.4, 140, vol, 'lowpass', { ataque: 0.08 }); golpe(t + 0.2, 2.2, 80, vol * 0.8, 'lowpass', { ataque: 0.3 }); golpe(t, 0.5, 1200, vol * 0.3, 'lowpass'); }

  /* --- el tráfico de la calle --- */
  function panner(v) { if (ac.createStereoPanner) { var p = ac.createStereoPanner(); p.pan.value = v || 0; return p; } var g = ac.createGain(); g.pan = { setTargetAtTime: function () {} }; return g; }
  // una voz de coche: el motor (dos sierras graves por un pasa-bajos) y el siseo de las ruedas en el agua
  function vozCoche(f, cuerpo) {
    var p = panner(0); p.connect(master);
    var o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), gm = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.5; o2.detune.value = 9; fl.type = 'lowpass'; fl.frequency.value = 260; fl.Q.value = 1.2; gm.gain.value = 0;
    o.connect(fl); o2.connect(fl); fl.connect(gm); gm.connect(p); o.start(); o2.start();
    var s = ac.createBufferSource(); s.buffer = ruido; s.loop = true; var fr = ac.createBiquadFilter(); fr.type = 'bandpass'; fr.frequency.value = 1100; fr.Q.value = 0.6; var gr = ac.createGain(); gr.gain.value = 0;
    s.connect(fr); fr.connect(gr); gr.connect(p); s.start(0, Math.random() * 3);
    return { o: o, o2: o2, f: f, gm: gm, gr: gr, fr: fr, p: p, cuerpo: cuerpo };
  }
  function moverCoche(v, sx, dir, fuerza, t) {
    var dx = (sx - E.W / 2) / (E.W / 2), prox = U.clamp(1 - Math.abs(dx) / 1.25, 0, 1), g = prox * prox * fuerza;
    var acerca = (dx < 0 && dir > 0) || (dx > 0 && dir < 0) ? 1.05 : 0.95;   // el Doppler: más agudo al venir
    v.gm.gain.setTargetAtTime(g * 0.09 * v.cuerpo, t, 0.08); v.gr.gain.setTargetAtTime(g * (0.08 + C.lluvia * 0.06), t, 0.08);
    v.o.frequency.setTargetAtTime(v.f * acerca, t, 0.2); v.o2.frequency.setTargetAtTime(v.f * 1.5 * acerca, t, 0.2);
    v.fr.frequency.setTargetAtTime(900 + prox * 900, t, 0.1);
    if (v.p.pan) v.p.pan.setTargetAtTime(U.clamp(dx, -1, 1), t, 0.08);
  }
  // el claxon de un taxi de Hong Kong: dos tonos cortos
  function claxon(t, vol, pan) {
    var p = panner(pan); p.connect(master); var g2 = ac.createGain(); g2.gain.value = 0.3; p.connect(g2); g2.connect(salaEnv);
    [[0, 0.16], [0.24, 0.32]].forEach(function (q) {
      [415, 523].forEach(function (f) { var o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'square'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 1600; meseta(g, t + q[0], t + q[0] + 0.01, t + q[1] - 0.02, t + q[1], vol); o.connect(fl); fl.connect(g); g.connect(p); o.start(t + q[0]); o.stop(t + q[1] + 0.02); });
    });
  }

  /* --- la gente: frases inventadas con la melodía de una lengua tonal --- */
  var VOCALES = [[800, 1250], [500, 1850], [320, 2250], [520, 920], [350, 800], [650, 1500]];
  var TONOS = [[1.25, 1.25], [1, 1], [0.85, 0.85], [0.92, 1.2], [1.22, 0.86], [1.05, 0.95]];   // alto, medio, bajo, sube, baja, cae un poco
  function frase(h, t, vol, n) {
    var o = ac.createOscillator(), f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), g = ac.createGain(), p = panner(h.pan + (Math.random() - 0.5) * 0.3);
    o.type = 'sawtooth'; f1.type = 'bandpass'; f2.type = 'bandpass'; f1.Q.value = 7; f2.Q.value = 9;
    var g2 = ac.createGain(); g2.gain.value = 0.55; o.connect(f1); o.connect(f2); f2.connect(g2); f1.connect(g); g2.connect(g); g.connect(p); p.connect(gente);
    g.gain.setValueAtTime(0, t); var s = t, f0 = h.f0 * (0.95 + Math.random() * 0.1);
    for (var k = 0; k < n; k++) {
      var d = 0.11 + Math.random() * 0.12, v = VOCALES[Math.floor(Math.random() * VOCALES.length)], tn = TONOS[Math.floor(Math.random() * TONOS.length)], caida = 1 - k / n * 0.12;
      o.frequency.setValueAtTime(f0 * tn[0] * caida, s); o.frequency.linearRampToValueAtTime(f0 * tn[1] * caida, s + d);
      f1.frequency.setValueAtTime(v[0], s); f2.frequency.setValueAtTime(v[1], s);
      // cada sílaba: una consonante breve (silencio) y la vocal que entra y se va
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(vol, s + 0.025); g.gain.setValueAtTime(vol, s + d * 0.7); g.gain.linearRampToValueAtTime(0, s + d);
      s += d + (Math.random() < 0.15 ? 0.18 : 0.02);
    }
    o.start(t); o.stop(s + 0.05);
    return s;
  }
  function risa(h, t, vol) { var s = t; for (var k = 0; k < 5; k++) { var o = ac.createOscillator(), f1 = ac.createBiquadFilter(), g = ac.createGain(), p = panner(h.pan); o.type = 'sawtooth'; o.frequency.setValueAtTime(h.f0 * (1.5 - k * 0.08), s); f1.type = 'bandpass'; f1.frequency.value = 900; f1.Q.value = 4; env(g, s, 0.02, vol, 0.14); o.connect(f1); f1.connect(g); g.connect(p); p.connect(gente); o.start(s); o.stop(s + 0.16); golpe(s, 0.08, 1500, vol * 0.3, 'bandpass'); s += 0.17; } }

  /* --- lo que suena solo --- */
  var proxCoche = 3, proxClaxon = 6, proxPregon = 10, proxNota = 5, proxAcorde = 0, acordeN = 0, ultimoRayo = -1e9, proxChisporroteo = 4;
  function actualizar() {
    if (!ac || !S.activo) return;
    var t = ac.currentTime, l = E.centro(), esc = !!E.escena, enCalle = U.clamp((l - 2.9) / 0.6, 0, 1), enFachada = U.clamp(1 - Math.abs(l - 2.2) / 1.2, 0, 1);
    lluvia.g.gain.setTargetAtTime(0.02 + C.lluvia * 0.075, t, 0.6);
    ciudad.g.gain.setTargetAtTime(0.05 + enCalle * 0.05, t, 0.8);
    // (con los neones apagados por el secreto 09, tampoco zumban)
    var es = E.escena, apagados = es && es.h.id === 'neones' && es.t > 1400 && es.t < 10800 + E.lectura;
    neon.gain.setTargetAtTime(apagados ? 0 : 0.0025 + enFachada * 0.006, t, apagados ? 1.2 : 0.5);
    // el avión: cuanto más cerca del centro de la pantalla, más grande y más arriba estés, más fuerte
    var av = C.avion(), j = 0, prox = 0;
    if (av) { prox = U.clamp(1 - Math.abs(av.x - E.W / 2) / (E.W * 0.75), 0, 1); var alto = U.clamp(1 - (l - 0.6) / 2.6, 0.15, 1); j = prox * prox * (av.s / E.u) * alto; }
    jet.g.gain.setTargetAtTime(Math.min(0.5, j * 0.7), t, 0.15);
    jet.f.frequency.setTargetAtTime(250 + prox * 1100, t, 0.2);
    silbido.g.gain.setTargetAtTime(Math.min(0.02, j * 0.03), t, 0.15);
    if (av) silbido.frequency.setTargetAtTime(av.x > E.W / 2 ? 2300 : 1900, t, 0.4);
    // los truenos, un poco después de cada relámpago
    if (C.relampago.t !== ultimoRayo) { if (ultimoRayo > -1e9 && E.t - C.relampago.t < 1000) trueno(t + 1.2 + Math.random() * 1.5, 0.5); ultimoRayo = C.relampago.t; }
    // el tráfico: cada coche suena donde está (los mismos cálculos que los dibuja ciudad.js), y el autobús (vida.js)
    var parado = !!C.sinTrafico, u = E.u, ti = E.t, lim2 = E.W / 2 / u + 0.4;
    C.COCHES.forEach(function (co, i) {
      var k2 = ((ti / 1000 * co.vel) + co.fase) % 1, dir = co.carril ? -1 : 1, xu2 = dir > 0 ? U.lerp(-lim2, lim2, k2) : U.lerp(lim2, -lim2, k2);
      moverCoche(trafico[i], E.sx(xu2), dir, parado ? 0 : enCalle * (co.carril ? 1 : 0.85), t);
    });
    var kb = ((ti + 12000) % 40000) / 11000;
    moverCoche(bus2, kb < 1 ? E.sx(U.lerp(-E.W / 2 / u - 0.4, E.W / 2 / u + 0.4, kb)) : -1e5, 1, parado ? 0 : enCalle * 1.3, t);
    // más lejos, el tráfico de Kowloon que no se ve: pasadas suaves de vez en cuando
    if (t > proxCoche) { golpe(t, 2.6, 450, (0.015 + 0.03 * enCalle), 'bandpass', { ataque: 1.2, f2: 1300, barre: 1.3, q: 0.8 }); proxCoche = t + 2 + Math.random() * 3.5; }
    if (t > proxClaxon) { if (enCalle > 0.4 && !esc && !parado) claxon(t, 0.035 * enCalle, (Math.random() - 0.5) * 1.4); proxClaxon = t + 9 + Math.random() * 16; }
    // la gente: fuerte en la calle y las tiendas, flojita desde las ventanas; casi nada en la azotea
    var cerca = U.clamp(Math.max(enCalle, enFachada * 0.3, l < 1.1 ? 0.15 : 0), 0, 1);
    gente.gain.setTargetAtTime(cerca * (esc ? 0.25 : 1), t, 0.6);
    murmullo.g.gain.setTargetAtTime(0.03 + enCalle * 0.05 + 0.015 * Math.sin(t * 0.5), t, 0.5);
    murmullo.f.frequency.setTargetAtTime(480 + 160 * Math.sin(t * 1.7), t, 0.15);
    hablantes.forEach(function (h) {
      if (t < h.prox) return;
      var r = Math.random(), fin;
      if (r < 0.1) { risa(h, t, 0.07); fin = t + 0.9; }
      else fin = frase(h, t, 0.05 + Math.random() * 0.035, 3 + Math.floor(Math.random() * 8));
      h.prox = fin + 0.6 + Math.random() * 3.5;
    });
    // el del carrito de bolas de pescado pregona de vez en cuando (una frase larga, más alta)
    if (t > proxPregon) { if (enCalle > 0.5 && !esc) frase({ f0: 150, pan: 0.2 }, t, 0.1, 6); proxPregon = t + 18 + Math.random() * 20; }
    // un neón que chisporrotea de vez en cuando
    if (t > proxChisporroteo) { if (enFachada > 0.3 && !esc) for (var k = 0; k < 3; k++) golpe(t + k * 0.06, 0.04, 4000, 0.02 * enFachada, 'bandpass'); proxChisporroteo = t + 5 + Math.random() * 9; }
    // la banda: cambia de acorde cada nueve segundos, y de vez en cuando una campana
    musica.gain.setTargetAtTime(esc ? 0.25 : 1 - enCalle * 0.45, t, 0.6);   // en la calle manda el tráfico
    if (t > proxAcorde) {
      var A = ACORDES[acordeN++ % ACORDES.length];
      voces.forEach(function (v, i) { v.forEach(function (o) { o.frequency.setTargetAtTime(A[i], t, 0.8); }); });
      proxAcorde = t + 9;
    }
    if (t > proxNota && !esc) { campanaMusica(PENTA[Math.floor(Math.random() * PENTA.length)], t, 0.03); if (Math.random() < 0.4) campanaMusica(PENTA[Math.floor(Math.random() * 4)], t + 0.6, 0.022); proxNota = t + 5 + Math.random() * 7; }
  }
  setInterval(actualizar, 100);

  /* --- cada escena con lo suyo (tiempos en segundos desde que empieza, los mismos que en cada secreto) --- */
  var L = E.lectura / 1000;
  var ESCENAS = {
    'kai-tak': function (t) { golpe(t + 3.4, 4.8, 90, 0.45, 'lowpass', { ataque: 2.3 }); for (var i = 0; i < 26; i++) golpe(t + 4.8 + i * 0.07, 0.05, 1800 + Math.random() * 1500, 0.05, 'bandpass'); },
    vecinos: function (t) { for (var i = 0; i < 46; i++) tono('square', 900 + i * 25, t + 1.6 + 5 * Math.pow(i / 46, 0.75), 0.04, 0.025, { filtro: 3000, sala: 0.2 }); [440, 554.37, 659.25].forEach(function (f, k) { campana(f, t + 5.6 + k * 0.15, 0.04); }); },
    'blade-runner': function (t) { acorde(t + 0.4, [110, 164.81, 220, 261.63, 329.63], 7.5, 0.018, 1500); [1.2, 2.4, 3.6, 5, 6.2].forEach(function (s) { golpe(t + s, 1.5, 400, 0.12, 'bandpass', { ataque: 0.7, f2: 1900, barre: 0.8, q: 1.2 }); }); campana(659.25, t + 2.4, 0.04); },
    'canal-muerto': function (t) { ruidoLargo(t + 0.8, t + 3.6, t + 5.6, t + 5.75, 1200, 0.22, 'highpass', 0.3); tono('sine', 7800, t + 4.6, 1.4, 0.012, { ataque: 0.05, sala: 0.1 }); tono('sine', 70, t + 5.6, 0.4, 0.3, { f2: 35, ataque: 0.005, sala: 0.2 }); golpe(t + 5.6, 0.12, 2000, 0.2, 'bandpass'); },
    ciberespacio: function (t) { for (var i = 0; i < 34; i++) tono('square', 600 + Math.random() * 1800, t + 1 + Math.random() * 3.2, 0.06, 0.018, { filtro: 3500, sala: 0.3 }); tono('sawtooth', 300, t + 1, 3.2, 0.012, { f2: 2400, filtro: 2000 }); for (i = 0; i < 26; i++) { golpe(t + 4 + i * 0.085, 0.03, 2600, 0.16, 'bandpass', { q: 1.5, sala: 0.1 }); golpe(t + 4 + i * 0.085, 0.05, 300, 0.08); } campana(1975.5, t + 6.3, 0.05); },
    'lluvia-digital': function (t) { golpe(t + 0.2, 1.4, 500, 0.15, 'bandpass', { ataque: 0.6, f2: 4200, barre: 1.3 }); for (var i = 0; i < 70; i++) tono('sine', PENTA[Math.floor(Math.random() * PENTA.length)] * 2, t + 1.5 + Math.random() * (10.6 + L - 1.5 - 1.5), 0.25, 0.018, { ataque: 0.004, sala: 0.8 }); golpe(t + 10.6 + L, 1.3, 4200, 0.13, 'bandpass', { ataque: 0.5, f2: 500, barre: 1.2 }); },
    cyberpunk: function (t) { for (var i = 0; i < 12; i++) { var s = 0.2 + Math.random() * 1.4; golpe(s + t, 0.06 + Math.random() * 0.08, 600 + Math.random() * 4000, 0.15, 'bandpass', { sala: 0.1 }); tono('square', 80 + Math.random() * 300, t + s, 0.07, 0.04, { sala: 0.1 }); } for (i = 0; i < 9; i++) chispazo(t + 1.5 + i * 0.311, 0.18); var o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 100; fl.type = 'lowpass'; fl.frequency.value = 450; meseta(g, t + 4.3, t + 4.6, t + 10.6 + L, t + 11.2 + L, 0.02); o.connect(fl); fl.connect(g); salida(g, 0.2); o.start(t + 4.3); o.stop(t + 11.3 + L); acorde(t + 4.4, [110, 164.81, 220, 329.63], 5, 0.016, 1400); },
    'neo-tokio': function (t) {
      // el motor: llega, frena a cámara lenta y se va
      var o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
      o.type = 'sawtooth'; o2.type = 'square'; fl.type = 'lowpass'; fl.frequency.value = 1100;
      [o, o2].forEach(function (x, i) { var k = i ? 0.5 : 1; x.frequency.setValueAtTime(120 * k, t); x.frequency.linearRampToValueAtTime(190 * k, t + 1.3); x.frequency.linearRampToValueAtTime(80 * k, t + 2.2); x.frequency.setValueAtTime(80 * k, t + 5.2); x.frequency.exponentialRampToValueAtTime(260 * k, t + 6.4); x.connect(fl); x.start(t); x.stop(t + 7); });
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 1.2); g.gain.linearRampToValueAtTime(0.05, t + 2); g.gain.setValueAtTime(0.05, t + 5.2); g.gain.linearRampToValueAtTime(0.1, t + 5.8); g.gain.linearRampToValueAtTime(0, t + 6.9);
      fl.connect(g); salida(g, 0.3);
      var f = ruidoLargo(t + 1.35, t + 1.6, t + 4.6, t + 5.2, 2600, 0.14, 'bandpass', 6); f.frequency.setValueAtTime(3000, t + 1.35); f.frequency.linearRampToValueAtTime(2000, t + 5.2);
      for (var i = 0; i < 30; i++) golpe(t + 1.5 + Math.random() * 3.4, 0.03, 4500, 0.06, 'bandpass');
    },
    neones: function (t) { var n = C.LETREROS.length, vuelven = 10.8 + L; for (var k = 0; k < n; k++) { var s = 1.4 + k * 0.33; golpe(t + s - 0.3, 0.04, 4000, 0.06, 'bandpass'); golpe(t + s, 0.05, 3500, 0.14, 'bandpass'); tono('sawtooth', 100, t + s - 0.25, 0.25, 0.03, { filtro: 500, sala: 0.2 }); chispazo(t + vuelven + (n - k) * 0.06, 0.07); } },
    derribo: function (t) { ruidoLargo(t + 1.2, t + 1.8, t + 4.2, t + 5.2, 70, 0.55, 'lowpass'); tono('sine', 38, t + 1.3, 3.6, 0.35, { ataque: 0.4, sala: 0.2 }); for (var i = 0; i < 16; i++) golpe(t + 1.5 + Math.random() * 2.9, 0.45, 500, 0.25, 'lowpass', { sala: 0.2 }); for (i = 0; i < 10; i++) golpe(t + 1.8 + Math.random() * 2.4, 0.15, 5000, 0.05, 'highpass'); golpe(t + 0.9, 3.8, 900, 0.12, 'bandpass', { ataque: 2.5, q: 0.5 }); acorde(t + 5.4, [130.81, 196, 261.63, 329.63], 6, 0.012, 900); for (i = 0; i < 6; i++) campana(PENTA[(i * 2) % PENTA.length] * 2, t + 6.2 + i * 1.3, 0.025); golpe(t + 12 + L - 0.6, 1.6, 900, 0.14, 'bandpass', { ataque: 0.6, q: 0.5 }); },
    final: function (t) { for (var i = 0; i < 14; i++) campana(PENTA[i % PENTA.length] * (i >= PENTA.length ? 2 : 1), t + 0.9 + i * 0.5, 0.035); for (i = 0; i < 4; i++) chispazo(t + 5.8 + i * 0.45, 0.16); acorde(t + 7.6, [110, 164.81, 277.18, 329.63, 493.88], 6.5, 0.02, 1600); }
  };
  E.en('escena', function (d) {
    if (!ac || !S.activo) return;
    var t = ac.currentTime;
    if (d.fase === 'fin') { if (escBus) { escBus.seco.gain.setTargetAtTime(0, t, 0.25); escBus.sala.gain.setTargetAtTime(0, t, 0.25); escBus = null; } return; }
    if (d.fase !== 'inicio') return;
    escBus = { seco: ac.createGain(), sala: ac.createGain() }; escBus.seco.connect(master); escBus.sala.connect(salaEnv);
    bus = escBus;
    try { chispazo(t + 0.02, 0.18); acorde(t + 0.05, [220, 329.63, 440], 2.4, 0.012, 2000); var f = ESCENAS[d.huevo && d.huevo.id]; if (f) f(t); }
    finally { bus = AMB; }
  });

  /* --- encender y apagar --- */
  S.encender = function () {
    if (!ac && !crear()) return;
    if (ac.state === 'suspended') ac.resume();
    S.activo = true; master.gain.setTargetAtTime(0.9, ac.currentTime, 0.6);
    try { localStorage.setItem(CLAVE, '1'); } catch (e) { /* nada */ }
    pintarBoton();
  };
  S.apagar = function () {
    S.activo = false; if (ac) master.gain.setTargetAtTime(0, ac.currentTime, 0.25);
    try { localStorage.setItem(CLAVE, '0'); } catch (e) { /* nada */ }
    pintarBoton();
  };
  S.alternar = function () { if (S.activo) S.apagar(); else S.encender(); };
  S.medidor = function () { if (!ac) return null; var an = ac.createAnalyser(); an.fftSize = 2048; master.connect(an); return function () { var d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); var q = 0; for (var i = 0; i < d.length; i++) q += d[i] * d[i]; return Math.sqrt(q / d.length); }; };   // (para las pruebas)
  function pintarBoton() { var b = document.getElementById('b-sonido'); if (b) { b.setAttribute('aria-pressed', S.activo ? 'true' : 'false'); b.classList.toggle('activo', S.activo); } }
  // el botón va a la izquierda del expediente (en el móvil, debajo)
  function colocar() {
    var b = document.getElementById('b-sonido'), c = document.getElementById('b-cuaderno'); if (!b || !c) return;
    var r = c.getBoundingClientRect(), movil = innerWidth < 640;
    b.style.top = (movil ? r.bottom + 8 : r.top) + 'px'; b.style.height = (movil ? 44 : r.height) + 'px';
    b.style.right = (movil ? innerWidth - r.right : innerWidth - r.left + 8) + 'px';
  }
  // si la última vez estaba encendido, se enciende en el primer gesto (los navegadores no dejan antes)
  var quiere = false; try { quiere = localStorage.getItem(CLAVE) === '1'; } catch (e) { /* nada */ }
  function primerGesto() { if (quiere && !S.activo) S.encender(); window.removeEventListener('pointerdown', primerGesto, true); window.removeEventListener('keydown', primerGesto, true); }
  window.addEventListener('pointerdown', primerGesto, true); window.addEventListener('keydown', primerGesto, true);
  var b = document.getElementById('b-sonido');
  if (b) b.addEventListener('click', function (ev) { ev.stopPropagation(); quiere = false; S.alternar(); });
  window.addEventListener('resize', colocar); colocar(); setTimeout(colocar, 600);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(colocar);
  pintarBoton();
})();
