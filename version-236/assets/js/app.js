(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  function attachPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector(".player-layer");

      if (!video || !layer) {
        return;
      }

      var source = video.getAttribute("data-stream");
      var activeHls = null;

      function load() {
        if (!source || video.getAttribute("data-loaded") === "true") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          activeHls = new window.Hls({
            enableWorker: true,
          });
          activeHls.loadSource(source);
          activeHls.attachMedia(video);
          video._hls = activeHls;
        } else {
          video.src = source;
        }

        video.setAttribute("data-loaded", "true");
      }

      function play() {
        load();
        layer.classList.add("is-hidden");
        video.controls = true;
        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {
            layer.classList.remove("is-hidden");
          });
        }
      }

      layer.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        layer.classList.add("is-hidden");
      });
    });
  }

  function attachCardFilters() {
    var inputs = document.querySelectorAll("[data-card-filter]");
    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-card-filter");
      var grid = document.querySelector(selector);

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(
        grid.querySelectorAll("[data-card]"),
      );
      var empty = document.querySelector(
        input.getAttribute("data-empty-target"),
      );

      function apply() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
          ]
            .join(" ")
            .toLowerCase();

          var matched = !value || haystack.indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", apply);
      apply();
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearch() {
    var form = document.querySelector("[data-search-form]");
    var grid = document.querySelector("[data-search-grid]");

    if (!form || !grid || !window.SEARCH_INDEX) {
      return;
    }

    var input = form.querySelector("input[name='q']");
    var category = form.querySelector("select[name='category']");
    var empty = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var initialCategory = params.get("category") || "";

    if (input) {
      input.value = initialQuery;
    }

    if (category && initialCategory) {
      category.value = initialCategory;
    }

    function card(item) {
      return [
        '<a class="movie-card card-hover silver-border" href="' +
          escapeHtml(item.url) +
          '" data-card>',
        '<span class="poster-wrap">',
        '<img src="' +
          escapeHtml(item.cover) +
          '" alt="' +
          escapeHtml(item.title) +
          '" loading="lazy" decoding="async">',
        '<span class="poster-shade"></span>',
        '<span class="poster-badge">' + escapeHtml(item.year) + "</span>",
        '<span class="poster-rating">' + escapeHtml(item.rating) + "</span>",
        "</span>",
        '<span class="movie-card-body">',
        "<strong>" + escapeHtml(item.title) + "</strong>",
        "<span>" + escapeHtml(item.desc) + "</span>",
        "<em><b>" +
          escapeHtml(item.genre) +
          "</b><i>" +
          escapeHtml(item.region) +
          "</i></em>",
        "</span>",
        "</a>",
      ].join("");
    }

    function run() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var cat = category ? category.value : "";
      var items = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.desc,
          item.genre,
          item.region,
          item.tags,
          item.category,
        ]
          .join(" ")
          .toLowerCase();
        var textMatched = !q || haystack.indexOf(q) !== -1;
        var categoryMatched = !cat || item.categorySlug === cat;
        return textMatched && categoryMatched;
      }).slice(0, 96);

      grid.innerHTML = items.map(card).join("");

      if (empty) {
        empty.classList.toggle("is-visible", items.length === 0);
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var next = new URLSearchParams();

      if (input && input.value.trim()) {
        next.set("q", input.value.trim());
      }

      if (category && category.value) {
        next.set("category", category.value);
      }

      var query = next.toString();
      history.replaceState(
        null,
        "",
        query ? "search.html?" + query : "search.html",
      );
      run();
    });

    if (input) {
      input.addEventListener("input", run);
    }

    if (category) {
      category.addEventListener("change", run);
    }

    run();
  }

  document.addEventListener("DOMContentLoaded", function () {
    attachPlayers();
    attachCardFilters();
    renderSearch();
  });
})();
