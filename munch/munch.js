/* munch pages: draws the hamster (a static port of the app's Mascot.tsx) into every
   element with class "hamster" and a data-mood of happy, cheering, curious or munching. */
(function () {
  'use strict';
  var INK = '#1B1530', FUR = '#EBB687', EAR_FUR = '#E3A977', EAR_INNER = '#F6C2C0';
  var MUZZLE = '#FFF4E8', BROWN = '#7A4532', BLUSH = '#F2A39A';

  function eyes(mood) {
    var big = mood === 'cheering' || mood === 'curious';
    var rx = big ? 6.5 : 5.5, ry = big ? 7.2 : 5.8, hr = big ? 2.4 : 1.9;
    return '<g class="eyes">' +
      '<ellipse cx="44" cy="61" rx="' + rx + '" ry="' + ry + '" fill="' + INK + '"/>' +
      '<ellipse cx="76" cy="61" rx="' + rx + '" ry="' + ry + '" fill="' + INK + '"/>' +
      '<circle cx="45.8" cy="59.2" r="' + hr + '" fill="#fff"/><circle cx="77.8" cy="59.2" r="' + hr + '" fill="#fff"/></g>';
  }

  function mouth(mood) {
    var line = ' stroke="' + BROWN + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    if (mood === 'cheering') {
      return '<path d="M51 75 C53 90 67 90 69 75 Z" fill="#5A2A2A" stroke="' + BROWN + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M54.5 84.5 C57 88.5 63 88.5 65.5 84.5 C62.5 82.5 57.5 82.5 54.5 84.5 Z" fill="#FF8FA3"/>';
    }
    if (mood === 'munching') return '<path d="M55 77 Q57.5 80 60 77 Q62.5 80 65 77"' + line + '/>';
    if (mood === 'curious') return '<ellipse cx="60" cy="78.5" rx="2.6" ry="3.2" fill="' + BROWN + '"/>';
    return '<path d="M54 76 C57 80 63 80 66 76"' + line + '/>';
  }

  function hamster(mood) {
    var stuffed = mood === 'munching';
    var blushX = stuffed ? 27 : 34;
    var cheeks = stuffed
      ? '<ellipse cx="60" cy="81" rx="41" ry="28" fill="' + FUR + '"/><ellipse cx="60" cy="84" rx="33" ry="24" fill="' + MUZZLE + '"/>'
      : '<ellipse cx="60" cy="82" rx="31" ry="25" fill="' + MUZZLE + '"/>';
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      // The sticker's white edge, then ears, head, cheeks and face.
      '<g fill="#fff" stroke="#fff" stroke-width="7" stroke-linejoin="round"><circle cx="32" cy="34" r="14"/><circle cx="88" cy="34" r="14"/>' +
      '<ellipse cx="60" cy="70" rx="45" ry="39"/>' + (stuffed ? '<ellipse cx="60" cy="81" rx="41" ry="28"/>' : '') + '</g>' +
      '<g class="ear ear-l"><circle cx="32" cy="34" r="14" fill="' + EAR_FUR + '"/><circle cx="32" cy="34" r="8" fill="' + EAR_INNER + '"/></g>' +
      '<g class="ear ear-r"><circle cx="88" cy="34" r="14" fill="' + EAR_FUR + '"/><circle cx="88" cy="34" r="8" fill="' + EAR_INNER + '"/></g>' +
      '<ellipse cx="60" cy="70" rx="45" ry="39" fill="' + FUR + '"/>' + cheeks +
      '<ellipse cx="' + blushX + '" cy="75" rx="8" ry="5" fill="' + BLUSH + '" opacity="0.8"/>' +
      '<ellipse cx="' + (120 - blushX) + '" cy="75" rx="8" ry="5" fill="' + BLUSH + '" opacity="0.8"/>' +
      mouth(mood) + eyes(mood) + '<ellipse cx="60" cy="70" rx="3.4" ry="2.5" fill="' + BROWN + '"/></svg>';
  }

  var all = document.querySelectorAll('.hamster');
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    el.innerHTML = hamster(el.getAttribute('data-mood') || 'happy');
    el.addEventListener('click', function () {
      var me = this;
      me.classList.remove('is-hopping');
      void me.offsetWidth;
      me.classList.add('is-hopping');
    });
  }

  var bar = document.querySelector('.topbar');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
