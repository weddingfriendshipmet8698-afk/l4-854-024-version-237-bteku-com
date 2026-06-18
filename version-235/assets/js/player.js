async function loadHlsModule() {
  var module = await import("../vendor/hls-vendor-dru42stk.js");
  return module.H;
}

function setMessage(shell, message) {
  var messageBox = shell.querySelector("[data-player-message]");

  if (messageBox) {
    messageBox.textContent = message;
  }
}

async function initializePlayer(shell) {
  var video = shell.querySelector("video[data-src]");
  var overlay = shell.querySelector("[data-play-button]");

  if (!video) {
    return;
  }

  var source = video.getAttribute("data-src");

  if (!source) {
    setMessage(shell, "当前影片没有可用播放源。");
    return;
  }

  try {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      var Hls = await loadHlsModule();

      if (!Hls || !Hls.isSupported()) {
        setMessage(shell, "当前浏览器暂不支持 HLS 播放。");
        return;
      }

      if (!video._hlsInstance) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      }
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    setMessage(shell, "正在加载播放源...");

    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === "function") {
      await playPromise;
    }

    setMessage(shell, "");
  } catch (error) {
    setMessage(shell, "播放初始化失败，请稍后重试或更换浏览器。");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));

  shells.forEach(function (shell) {
    var button = shell.querySelector("[data-play-button]");

    if (button) {
      button.addEventListener("click", function () {
        initializePlayer(shell);
      });
    }
  });
});
