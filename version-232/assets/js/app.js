(function () {
  const ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        const opened = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(opened));
      });
    }

    const spotlight = document.querySelector(".spotlight");

    if (spotlight) {
      const slides = Array.from(spotlight.querySelectorAll(".spotlight-slide"));
      const dots = Array.from(spotlight.querySelectorAll(".spotlight-dots button"));
      const previous = spotlight.querySelector(".spotlight-control.prev");
      const next = spotlight.querySelector(".spotlight-control.next");
      let index = 0;
      let timer = null;

      const show = function (nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
          dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
        });
      };

      const start = function () {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 6200);
      };

      if (previous) {
        previous.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    }

    const filterForms = Array.from(document.querySelectorAll("[data-filter-form]"));

    filterForms.forEach(function (form) {
      const scope = document.querySelector(form.getAttribute("data-filter-form"));

      if (!scope) {
        return;
      }

      const cards = Array.from(scope.querySelectorAll("[data-title]"));
      const empty = document.querySelector(form.getAttribute("data-empty-target") || "");
      const inputs = Array.from(form.querySelectorAll("input, select"));

      const apply = function () {
        const keywordInput = form.querySelector("[name='keyword']");
        const regionInput = form.querySelector("[name='region']");
        const typeInput = form.querySelector("[name='type']");
        const yearInput = form.querySelector("[name='year']");
        const categoryInput = form.querySelector("[name='category']");
        const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        const region = regionInput ? regionInput.value : "";
        const type = typeInput ? typeInput.value : "";
        const year = yearInput ? yearInput.value : "";
        const category = categoryInput ? categoryInput.value : "";
        let visible = 0;

        cards.forEach(function (card) {
          const text = [
            card.dataset.title || "",
            card.dataset.region || "",
            card.dataset.type || "",
            card.dataset.year || "",
            card.dataset.genre || ""
          ].join(" ").toLowerCase();
          const matched = (!keyword || text.includes(keyword)) &&
            (!region || (card.dataset.region || "").includes(region)) &&
            (!type || (card.dataset.type || "").includes(type)) &&
            (!year || (card.dataset.year || "") === year) &&
            (!category || (card.dataset.category || "") === category);

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };

      inputs.forEach(function (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      });

      const reset = form.querySelector("[data-reset-filter]");

      if (reset) {
        reset.addEventListener("click", function () {
          inputs.forEach(function (input) {
            input.value = "";
          });
          apply();
        });
      }

      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");

      if (q) {
        const keywordInput = form.querySelector("[name='keyword']");

        if (keywordInput) {
          keywordInput.value = q;
        }
      }

      apply();
    });

    const players = Array.from(document.querySelectorAll(".player-card[data-video-url]"));

    players.forEach(function (player) {
      const video = player.querySelector("video");
      const cover = player.querySelector(".player-cover");
      const source = player.getAttribute("data-video-url");
      let hls = null;
      let started = false;

      const begin = function () {
        if (!video || !source) {
          return;
        }

        if (!started) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }

          started = true;
        }

        if (cover) {
          cover.classList.add("is-hidden");
        }

        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      };

      if (cover) {
        cover.addEventListener("click", begin);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started || video.paused) {
            begin();
          } else {
            video.pause();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
