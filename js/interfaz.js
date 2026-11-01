/* Cyber Incognita · interfaz
   El registro de secretos, el progreso (en este navegador), el expediente, la tarjeta de cada escena, los avisos, los
   instrumentos (PLANTA: a qué altura estás; SEÑAL: sube cerca de un secreto de lugar; LLUVIA: cuánto llueve), la
   entrada y los créditos. Para volver o cerrar: la tecla ⌫ (nunca Esc, que saca de la pantalla completa). */
(function () {
  'use strict';
  var NI = window.NI, U = NI.util, E = NI.motor, C = NI.ciudad;
  var CLAVE = 'cyber-incognita.v1';   // no se cambia nunca: borraría el progreso de quien ya juega
  var PRUEBA = /[?&]prueba\b/.test(location.search);
  var I = NI.interfaz = { prueba: PRUEBA };
  var huevos = [], final = null;
  var estado = { hallados: {}, final: false, introVista: false };
  var $ = function (id) { return document.getElementById(id); };
  var raiz = document.documentElement;
  var AUTOR = { nombre: 'Pau Morató Sebastià', linkedin: 'https://www.linkedin.com/in/pau-morat%C3%B3-sebasti%C3%A0-5554a01b2' };

  /* ---------- registro ----------
     Cada secreto: { id, n, nombre, tipo, pista, lugar?: () => λ de la ciudad, radio?, detectar(api), escena(motor, datos) } */
  NI.registrar = function (h) { huevos.push(h); huevos.sort(function (a, b) { return a.n - b.n; }); };
  NI.registrarFinal = function (h) { final = h; };
  I.huevos = function () { return huevos; };
  I.estado = function () { return estado; };

  function cargar() { try { var s = localStorage.getItem(CLAVE); if (s) { var o = JSON.parse(s); for (var k in o) estado[k] = o[k]; } } catch (e) { /* sin almacenamiento */ } }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }
  function cuantos() { return huevos.filter(function (h) { return estado.hallados[h.id]; }).length; }

  /* ---------- disparar un secreto ---------- */
  I.disparar = function (h, datos, op) {
    op = op || {};
    if (!h.escena || E.escena || !$('intro').hidden || !$('creditos').hidden) return false;
    cerrarCuaderno();
    var nuevo = !estado.hallados[h.id] && !op.prueba;
    if (nuevo) { estado.hallados[h.id] = Date.now(); guardar(); }
    h.ultimosDatos = datos || h.ultimosDatos || null;
    var envoltorio = { id: h.id, escena: function (motor) {
      var s = h.escena(motor, datos || h.ultimosDatos || null);
      if (s && s.tarjeta && !s.tarjeta.etiqueta) s.tarjeta.etiqueta = 'Secreto ' + U.dos(h.n) + ' / ' + U.dos(huevos.length) + ' · ' + h.tipo;
      return s;
    } };
    E.reproducir(envoltorio, function () {
      pintarLista(nuevo ? h.id : null);
      if (nuevo) {
        aviso('Secreto encontrado <b>' + U.dos(cuantos()) + '/' + U.dos(huevos.length) + '</b> · ' + h.nombre);
        var b = $('b-cuaderno'); b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso');
        if (cuantos() === huevos.length && !estado.final && final) setTimeout(function () { I.verFinal(); }, 1600);
      }
    });
    return true;
  };
  I.verFinal = function () {
    if (!final || E.escena) return;
    cerrarCuaderno();
    var primero = Infinity, ultimo = 0;
    huevos.forEach(function (h) { var t = estado.hallados[h.id]; if (t) { primero = Math.min(primero, t); ultimo = Math.max(ultimo, t); } });
    raiz.classList.add('final-activo');
    E.reproducir({ id: 'final', escena: function (motor) { return final.escena(motor, { desde: primero, hasta: ultimo, huevos: huevos }); } }, function () {
      raiz.classList.remove('final-activo');
      if (cuantos() === huevos.length) { estado.final = true; guardar(); }
      pintarLista();
      mostrarCreditos();
    });
  };

  /* ---------- créditos ---------- */
  function mostrarCreditos() {
    var c = $('creditos');
    c.hidden = false; c.classList.remove('saliendo'); void c.offsetWidth; c.classList.add('visible');
    E.bloqueado = true;
    setTimeout(function () { var b = $('creditos-enlace'); try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }, 2600);
  }
  function cerrarCreditos() {
    var c = $('creditos'); if (c.hidden) return;
    c.classList.remove('visible'); c.classList.add('saliendo');
    E.bloqueado = false; E.ultimoInput = E.t;
    setTimeout(function () { c.hidden = true; c.classList.remove('saliendo'); }, 650);
  }
  I.mostrarCreditos = mostrarCreditos;

  /* ---------- tarjeta ---------- */
  I.tarjeta = function (t) {
    var el = $('tarjeta');
    if (!t) { el.classList.remove('visible'); return; }
    var v = function (x) { return typeof x === 'function' ? x() : (x || ''); };
    $('t-etq').textContent = v(t.etiqueta);
    $('t-tit').textContent = v(t.titulo);
    $('t-txt').innerHTML = v(t.texto);
    $('t-pie').textContent = v(t.pie);
    void el.offsetWidth; el.classList.add('visible');
  };

  /* ---------- aviso ---------- */
  var tAviso = null;
  function aviso(html, ms) {
    var el = $('aviso'); el.innerHTML = html; el.classList.add('visible');
    clearTimeout(tAviso); tAviso = setTimeout(function () { el.classList.remove('visible'); }, ms || 4200);
  }
  I.aviso = aviso;

  /* ---------- cuaderno ---------- */
  function abrirCuaderno() {
    $('cuaderno').classList.add('abierto'); $('cuaderno').setAttribute('aria-hidden', 'false');
    $('b-cuaderno').setAttribute('aria-expanded', 'true'); raiz.classList.add('cuaderno-abierto');
  }
  function cerrarCuaderno() {
    $('cuaderno').classList.remove('abierto'); $('cuaderno').setAttribute('aria-hidden', 'true');
    $('b-cuaderno').setAttribute('aria-expanded', 'false'); raiz.classList.remove('cuaderno-abierto');
  }
  I.abrirCuaderno = abrirCuaderno; I.cerrarCuaderno = cerrarCuaderno;

  function fecha(ms) {
    var d = new Date(ms);
    return U.dos(d.getDate()) + '.' + U.dos(d.getMonth() + 1) + '.' + d.getFullYear() + ' · ' + U.dos(d.getHours()) + ':' + U.dos(d.getMinutes());
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function pintarLista(recien) {
    var ol = $('lista'); ol.innerHTML = '';
    huevos.forEach(function (h) {
      var ok = !!estado.hallados[h.id];
      var li = el('li', 'entrada' + (ok ? ' hallada' : '') + (recien === h.id ? ' nueva' : ''));
      li.appendChild(el('div', 'e-num', U.dos(h.n)));
      var c = el('div', 'e-cuerpo');
      c.appendChild(el('div', 'e-tipo', h.tipo));
      var nom = el('div', 'e-nombre');
      if (ok) nom.textContent = h.nombre;
      else { var cen = el('span', 'e-censura'); cen.style.width = (h.nombre.length * 0.48 + 0.6) + 'em'; nom.appendChild(cen); nom.setAttribute('aria-label', 'Por descubrir'); }
      c.appendChild(nom);
      c.appendChild(el('p', 'e-pista', h.pista));
      if ((ok || PRUEBA) && h.escena) {
        var meta = el('div', 'e-meta');
        if (ok) meta.appendChild(el('span', '', 'Hallado · ' + fecha(estado.hallados[h.id])));
        var b = el('button', 'e-ver', ok ? 'Volver a ver' : '▶ Probar');
        b.type = 'button';
        b.addEventListener('click', function () { I.disparar(h, null, { prueba: !ok }); });
        meta.appendChild(b); c.appendChild(meta);
      }
      li.appendChild(c); ol.appendChild(li);
    });
    var n = cuantos(), total = huevos.length;
    $('contador').textContent = U.dos(n) + '/' + U.dos(total);
    var seg = $('segmentos'); seg.innerHTML = ''; seg.style.gridTemplateColumns = 'repeat(' + Math.max(1, total) + ', 1fr)';
    for (var i = 0; i < total; i++) seg.appendChild(el('i', i < n ? 'si' : ''));
    $('ver-final').hidden = !(estado.final || (PRUEBA && final));
    $('c-credito-linea').hidden = !estado.final;
    raiz.classList.toggle('cognita', !!estado.final);
  }

  /* ---------- instrumentos ---------- */
  var cuadroHud = 0, ultimos = {}, plantaActual = '';
  function barras(id, valor) {
    var b = Math.ceil(valor * 5 - 0.15); if (ultimos[id] === b) return; ultimos[id] = b;
    var is = $(id).children; for (var i = 0; i < is.length; i++) is[i].classList.toggle('si', i < b);
  }
  function instrumentos() {
    // SEÑAL: sube cuando te acercas a un secreto de lugar que aún no has encontrado
    // (con ratón cuenta el puntero; en pantalla táctil, el centro de la vista)
    var objetivo = 0, p = E.puntero, ref = p.sobre && p.tipo === 'mouse' ? p.y : E.H / 2;
    huevos.forEach(function (h) {
      if (!h.lugar || estado.hallados[h.id]) return;
      var l = h.lugar(); if (l == null) return;
      objetivo = Math.max(objetivo, U.clamp(1 - Math.abs(E.sy(l) - ref) / (h.radio || 0.35) / E.u, 0, 1));
    });
    E.senal += (objetivo - E.senal) * 0.12;
    if (++cuadroHud % 5) return;
    barras('h-senal', 0.12 + E.senal * 0.88);
    $('h-senal').classList.toggle('latiendo', E.senal > 0.12);
    // LLUVIA
    barras('h-lluvia', C.lluvia); $('h-lluvia-txt').textContent = C.nivelLluvia();
    // PLANTA
    if (cuadroHud % 10 === 0) {
      var pl = C.planta(E.centro()).txt;
      if (pl !== plantaActual) { plantaActual = pl; var hp = $('h-planta'); hp.classList.remove('cambia'); void hp.offsetWidth; hp.textContent = pl; hp.classList.add('cambia'); }
    }
  }

  /* ---------- teclas pulsadas (para los secretos de teclado) ---------- */
  var SIMBOLOS = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Backspace: '⌫' };
  function tecla(d) {
    if (E.escena && d.key !== 'Backspace') return;
    var s = SIMBOLOS[d.key] || (d.key.length === 1 && /\S/.test(d.key) ? d.key.toUpperCase() : null);
    if (!s || /^[+\-=_]$/.test(d.key)) return;
    var cont = $('teclas'), k = el('kbd', '', s);
    cont.appendChild(k);
    while (cont.children.length > 10) cont.removeChild(cont.firstChild);
    setTimeout(function () { if (k.parentNode) k.parentNode.removeChild(k); }, 2300);
  }

  /* ---------- la medalla de la entrada: un letrero de neón 九龍 que se enciende ---------- */
  function medalla() {
    var cv = $('intro-medalla'); if (!cv) return;
    var d = Math.min(2, window.devicePixelRatio || 1), s = 168; cv.width = cv.height = s * d;
    var c = cv.getContext('2d'), A = NI.arte; c.scale(d, d);
    var L = { t: '九龍', c: '#ff2bd6', v: true }, g = A.letreroGeo(L, s / 2, s / 2, 46);
    A.letreroTabla(c, L, g);
    var lz = A.letreroLuz(L, g, d), t0 = performance.now();
    (function cuadro() {
      var dt = performance.now() - t0, on = dt > 1400 ? 1 : (U._h(Math.floor(dt / 60)) > 0.5 ? 0.25 + dt / 2000 : 0.05);
      c.clearRect(0, 0, s, s); A.letreroTabla(c, L, g);
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = on; c.drawImage(lz.c, g.x - lz.w / 2, g.y - lz.h / 2, lz.w, lz.h); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (dt < 1500) requestAnimationFrame(cuadro);
    })();
    cv.classList.add('listo');
  }

  /* ---------- arranque ---------- */
  I.iniciar = function () {
    cargar();
    var tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    $('ayuda').textContent = tactil ? 'Desliza para subir y bajar por la ciudad' : 'Arrastra o usa la rueda para subir y bajar por la ciudad';

    huevos.forEach(function (h) {
      h.detectar && h.detectar({
        motor: E,
        en: function (n, fn) { E.en(n, fn); },
        capa: function (fn) { E.capas.push(fn); },
        hallado: function () { return !!estado.hallados[h.id]; },
        disparar: function (datos) { return I.disparar(h, datos); }
      });
    });
    E.en('cuadro', instrumentos);
    E.en('tecla', tecla);
    // ⌫ para volver: salta la escena, cierra el cuaderno o los créditos
    E.en('tecla', function (d) {
      if (d.key !== 'Backspace') return;
      if (E.escena) E.saltar();
      else if ($('cuaderno').classList.contains('abierto')) cerrarCuaderno();
      else if (!$('creditos').hidden) cerrarCreditos();
    });

    $('b-cuaderno').addEventListener('click', function () { $('cuaderno').classList.contains('abierto') ? cerrarCuaderno() : abrirCuaderno(); });
    $('cerrar-cuaderno').addEventListener('click', cerrarCuaderno);
    $('saltar').addEventListener('click', function () { E.saltar(); });
    $('ver-final').addEventListener('click', function () { I.verFinal(); });
    $('borrar').addEventListener('click', function () {
      if (!window.confirm('¿Borrar los secretos encontrados en este navegador?')) return;
      estado = { hallados: {}, final: false, introVista: true }; guardar(); pintarLista();
    });

    $('creditos-nombre').textContent = AUTOR.nombre;
    $('c-credito-nombre').textContent = AUTOR.nombre;
    $('creditos-enlace').href = AUTOR.linkedin; $('c-credito').href = AUTOR.linkedin;
    $('creditos-cerrar').addEventListener('click', cerrarCreditos);

    pintarLista();
    I.introPendiente = !estado.introVista && !PRUEBA;
  };
  // la entrada (solo la primera vez): al pulsar «Entrar en la ciudad» se encienden los neones
  I.mostrarIntro = function (alEmpezar) {
    var intro = $('intro');
    intro.hidden = false; E.bloqueado = true;
    medalla();
    $('empezar').addEventListener('click', function () {
      estado.introVista = true; guardar();
      intro.classList.add('saliendo'); E.bloqueado = false; E.ultimoInput = E.t;
      setTimeout(function () { intro.hidden = true; }, 900);
      alEmpezar && alEmpezar();
    });
    setTimeout(function () { try { $('empezar').focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 50);
  };
})();
