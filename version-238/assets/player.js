(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector("[data-play]");
    var stream = player.getAttribute("data-stream");
    var ready = false;
    var hlsInstance = null;

    function prepare() {
      if (ready || !video || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function begin() {
      prepare();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    if (video) {
      video.addEventListener("click", function () {
        prepare();
      });

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
