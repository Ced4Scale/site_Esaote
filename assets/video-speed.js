(function () {
  function slowDown(iframe) {
    if (!window.Vimeo || !window.Vimeo.Player) return;
    var rate = parseFloat(iframe.getAttribute("data-vimeo-slow-rate")) || 0.5;
    var player = new window.Vimeo.Player(iframe);
    function apply() {
      player.setPlaybackRate(rate).catch(function () {});
    }
    player.on("play", apply);
    apply();
  }

  function init() {
    var iframes = document.querySelectorAll("iframe[data-vimeo-slow-rate]");
    Array.prototype.forEach.call(iframes, slowDown);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
