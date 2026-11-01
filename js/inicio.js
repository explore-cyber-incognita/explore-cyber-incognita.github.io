/* Cyber Incognita · arranque
   Con ?prueba en la dirección, el expediente deja probar todos los secretos (sin apuntarlos) y #id-del-secreto lo lanza al
   cargar. NI.debug sirve para probar desde la consola. */
(function () {
  'use strict';
  var NI = window.NI, E = NI.motor, I = NI.interfaz, C = NI.ciudad;
  I.iniciar();
  E.iniciar(document.getElementById('lienzo'));
  // la ciudad empieza a la altura de la azotea, con el cielo y los aviones
  E.camY = Math.max(0, Math.min(E.maxCam(), 0.85 * E.u - E.H / 2));
  // el grano: ruido pintado una vez, compuesto por CSS encima de todo (no cuesta nada al lienzo)
  (function () {
    var s = 220, c = document.createElement('canvas'); c.width = c.height = s;
    var x = c.getContext('2d'), im = x.createImageData(s, s), d = im.data, r = NI.util.azar(3);
    for (var i = 0; i < d.length; i += 4) { var v = 128 + (r() - 0.5) * 120; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    x.putImageData(im, 0, 0);
    document.querySelector('.grano').style.backgroundImage = 'url(' + c.toDataURL() + ')';
  })();
  // los letreros llevan letra china: hay que esperar a la fuente antes de pintar nada (como mucho 2,5 s)
  var fuentes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('700 40px "Noto Sans TC"', '九龍城寨'), document.fonts.load('600 20px "IBM Plex Mono"', 'HOTEL')]) : Promise.resolve();
  Promise.race([fuentes, new Promise(function (ok) { setTimeout(ok, 2500); })]).then(function () {
    var t0 = performance.now();
    C.olvidar(); C.preparar();
    NI.debug.tPreparar = Math.round(performance.now() - t0);
    var c = document.getElementById('cargando');
    if (c) { c.classList.add('fuera'); setTimeout(function () { c.hidden = true; }, 800); }
    if (I.introPendiente) I.mostrarIntro(function () { setTimeout(function () { C.encender(); }, 250); });
    else C.encender(I.prueba);
  });

  function buscar(id) { var h = null; I.huevos().forEach(function (x) { if (x.id === id) h = x; }); return h; }
  NI.debug = {
    disparar: function (id, datos) {
      if (id === 'final') { I.verFinal(); return true; }
      if (id === 'creditos') { I.mostrarCreditos(); return true; }
      var h = buscar(id); return h ? I.disparar(h, datos, { prueba: true }) : false;
    },
    congelar: E.congelar, paso: E.paso,
    ir: function (l) { E.camY = Math.max(0, Math.min(E.maxCam(), l * E.u - E.H / 2)); E.camObj = null; },
    lluvia: function (v) { C.lluviaFija = v; C.lluvia = v; },
    puntero: function (x, y) { E.puntero.x = x; E.puntero.y = y; E.puntero.sobre = true; E.puntero.tipo = 'mouse'; },
    ids: function () { return I.huevos().map(function (h) { return h.id; }); }
  };
  if (location.hash.length > 1) {
    var id = decodeURIComponent(location.hash.slice(1));
    setTimeout(function () { NI.debug.disparar(id); }, 900);
  }
})();
