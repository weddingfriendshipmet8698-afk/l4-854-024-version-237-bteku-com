(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        var isHidden = mobileMenu.hasAttribute('hidden');
        if (isHidden) {
          mobileMenu.removeAttribute('hidden');
          menuButton.setAttribute('aria-expanded', 'true');
          menuButton.textContent = '×';
        } else {
          mobileMenu.setAttribute('hidden', '');
          menuButton.setAttribute('aria-expanded', 'false');
          menuButton.textContent = '☰';
        }
      });
    }

    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG' && target.classList.contains('movie-cover')) {
        target.classList.add('is-missing');
      }
    }, true);

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var value = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(value);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }
  });
})();
