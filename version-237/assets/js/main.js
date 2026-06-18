(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".menu-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
    selectAll(".mobile-nav a", header).forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("menu-open");
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = selectAll(".hero-slide", carousel);
    var dots = selectAll("[data-hero-dot]", carousel);
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
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
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function optionMatches(card, key, value) {
    if (!value) {
      return true;
    }
    var actual = normalize(card.dataset[key]);
    return actual.indexOf(normalize(value)) !== -1;
  }

  function setupFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-text]");
      var selects = selectAll("[data-filter-select]", scope);
      var cards = selectAll(".movie-card, .ranking-item", scope);
      var empty = scope.querySelector("[data-empty]");

      if (scope.hasAttribute("data-use-query") && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
      }

      function apply() {
        var queryText = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.dataset.search || card.textContent);
          var matched = !queryText || text.indexOf(queryText) !== -1;
          selects.forEach(function (select) {
            matched = matched && optionMatches(card, select.getAttribute("data-filter-select"), select.value);
          });
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
