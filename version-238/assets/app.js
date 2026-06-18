(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
    var list = input.closest("main").querySelector("[data-filter-list]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]")) : [];
    var chips = Array.prototype.slice.call(input.closest(".filter-panel").querySelectorAll("[data-filter-value]"));

    function applyFilter(value) {
      var query = value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter-card") || "").toLowerCase();
        card.hidden = query !== "" && text.indexOf(query) === -1;
      });
    }

    input.addEventListener("input", function () {
      applyFilter(input.value);
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        input.value = chip.getAttribute("data-filter-value") || "";
        applyFilter(input.value);
      });
    });
  });

  var searchInput = document.querySelector("[data-search-input]");
  var searchButton = document.querySelector("[data-search-button]");
  var searchResults = document.getElementById("searchResults");
  var searchEmpty = document.querySelector("[data-search-empty]");
  var searchDefault = document.querySelector("[data-search-default]");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSearchCard(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.href) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-dot">▶</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>',
      '    <em>' + escapeHtml(movie.genre) + '</em>',
      '  </span>',
      '</a>'
    ].join("");
  }

  function performSearch() {
    if (!searchInput || !searchResults || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var query = searchInput.value.trim().toLowerCase();
    var source = window.MOVIE_SEARCH_INDEX;
    var results = query
      ? source.filter(function (movie) {
          return movie.text.indexOf(query) !== -1;
        }).slice(0, 80)
      : [];

    searchResults.innerHTML = results.map(renderSearchCard).join("");

    if (searchDefault) {
      searchDefault.hidden = query !== "";
    }

    if (searchEmpty) {
      searchEmpty.hidden = query === "" || results.length > 0;
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;
    performSearch();
    searchInput.addEventListener("input", performSearch);
  }

  if (searchButton) {
    searchButton.addEventListener("click", performSearch);
  }
})();
