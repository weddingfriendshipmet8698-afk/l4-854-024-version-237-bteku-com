const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(current + 1), 5200);
  }
}

const searchInput = document.querySelector('[data-search-input]');

if (searchInput) {
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();

    cards.forEach((card) => {
      const content = card.getAttribute('data-search') || '';
      card.hidden = query !== '' && !content.includes(query);
    });
  });
}

const prepareVideo = async (video, source) => {
  if (!video || !source || video.dataset.ready === 'true') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = 'true';
    return;
  }

  try {
    const module = await import('./hls.js');
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = 'true';
      return;
    }
  } catch (error) {
    video.dataset.ready = 'fallback';
  }

  video.src = source;
};

const playerBlocks = document.querySelectorAll('[data-player]');

playerBlocks.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const source = video ? video.getAttribute('data-video-url') : '';

  const startPlayback = async () => {
    await prepareVideo(video, source);

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video) {
      const playAttempt = video.play();

      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }
  };

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', () => {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }
});
