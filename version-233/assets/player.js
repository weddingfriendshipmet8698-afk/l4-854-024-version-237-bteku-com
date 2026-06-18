(function () {
  function setMessage(shell, text) {
    var message = shell.querySelector('[data-player-message]');
    if (message) {
      message.textContent = text;
    }
  }

  function getAssetUrl(filename) {
    var script = document.currentScript || document.querySelector('script[src$="player.js"]');
    var scriptUrl = script ? script.src : window.location.href;
    return new URL(filename, new URL('.', scriptUrl)).href;
  }

  function initNative(video, src, shell, button) {
    video.src = src;
    video.addEventListener('loadedmetadata', function () {
      setMessage(shell, '播放源已就绪。');
    }, { once: true });
    video.play().then(function () {
      button.classList.add('is-hidden');
    }).catch(function () {
      setMessage(shell, '浏览器阻止自动播放，请再次点击播放器开始。');
    });
  }

  function initHls(video, src, shell, button) {
    setMessage(shell, '正在初始化 HLS 播放源...');
    import(getAssetUrl('hls-vendor-dru42stk.js')).then(function (module) {
      var Hls = module.H || module.default || window.Hls;
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          setMessage(shell, '播放源已就绪。');
          video.play().then(function () {
            button.classList.add('is-hidden');
          }).catch(function () {
            setMessage(shell, '浏览器阻止自动播放，请再次点击播放器开始。');
          });
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage(shell, '播放源暂时无法连接，请稍后重试。');
          }
        });
        shell.__hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        initNative(video, src, shell, button);
      } else {
        setMessage(shell, '当前浏览器不支持 HLS 播放。');
      }
    }).catch(function () {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        initNative(video, src, shell, button);
      } else {
        setMessage(shell, 'HLS 播放模块载入失败。');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var shells = document.querySelectorAll('[data-player-shell]');
    shells.forEach(function (shell) {
      var video = shell.querySelector('[data-hls-player]');
      var button = shell.querySelector('[data-player-start]');
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute('data-src');
      if (!src) {
        setMessage(shell, '没有找到播放源。');
        return;
      }
      button.addEventListener('click', function () {
        if (shell.__playerStarted) {
          video.play();
          button.classList.add('is-hidden');
          return;
        }
        shell.__playerStarted = true;
        initHls(video, src, shell, button);
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });
  });
})();
