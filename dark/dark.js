(function () {
  var KEY = '__edge_dark__';
  var el = document.documentElement;
  if (el.dataset[KEY]) {
    el.style.filter = '';
    el.style.background = '';
    delete el.dataset[KEY];
  } else {
    el.style.filter = 'invert(1) hue-rotate(180deg)';
    // Re-invert images and videos so they look natural
    var tag = document.createElement('style');
    tag.id = '__edge_dark_style__';
    tag.textContent = 'img,video,canvas,iframe,svg,picture{filter:invert(1) hue-rotate(180deg)!important}';
    document.head.appendChild(tag);
    el.dataset[KEY] = '1';
    // Track style tag for cleanup on toggle-off
    el.dataset[KEY + '_style'] = tag.id;
  }
  // Remove re-invert style on toggle-off
  if (!el.dataset[KEY]) {
    var s = document.getElementById('__edge_dark_style__');
    if (s) s.remove();
  }
})();
