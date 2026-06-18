(function () {
  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupImageFallback() {
    document.addEventListener(
      "error",
      function (event) {
        var target = event.target;

        if (!target || target.tagName !== "IMG" || target.dataset.missing === "true") {
          return;
        }

        target.dataset.missing = "true";
        target.classList.add("image-missing");
        target.removeAttribute("src");
      },
      true
    );
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  function setupFilters() {
    var filterInput = document.querySelector("[data-movie-filter]");
    var categorySelect = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (!cards.length || (!filterInput && !categorySelect)) {
      return;
    }

    function applyFilter() {
      var query = normalize(filterInput ? filterInput.value : "");
      var category = categorySelect ? categorySelect.value : "";

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title"));
        var cardCategory = card.getAttribute("data-category") || "";
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesCategory = !category || cardCategory === category;

        card.classList.toggle("is-hidden", !(matchesText && matchesCategory));
      });
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", applyFilter);
    }
  }

  function setupBackToTop() {
    var button = document.querySelector("[data-back-to-top]");

    if (!button) {
      return;
    }

    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 700);
    });

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupImageFallback();
    setupHero();
    setupFilters();
    setupBackToTop();
  });
})();
