
(function () {
    var doc = document;

    function all(selector, root) {
        return Array.prototype.slice.call((root || doc).querySelectorAll(selector));
    }

    function text(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function initImages() {
        all('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            });
        });
    }

    function initMobileNav() {
        var toggle = doc.querySelector('[data-mobile-toggle]');
        var panel = doc.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = doc.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function setSlide(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        var lists = all('.filter-list');
        if (!lists.length) {
            return;
        }
        var input = doc.querySelector('.filter-input');
        var year = doc.querySelector('.filter-year');
        var category = doc.querySelector('.filter-category');
        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function run() {
            var keyword = text(input && input.value);
            var selectedYear = text(year && year.value);
            var selectedCategory = text(category && category.value);
            var cards = all('.movie-card, .ranking-card');
            cards.forEach(function (card) {
                var haystack = text([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-category')
                ].join(' '));
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedYear && text(card.getAttribute('data-year')) !== selectedYear) {
                    ok = false;
                }
                if (selectedCategory && text(card.getAttribute('data-category')) !== selectedCategory) {
                    ok = false;
                }
                card.classList.toggle('is-filtered-out', !ok);
            });
        }

        [input, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', run);
                control.addEventListener('change', run);
            }
        });
        run();
    }

    function initPlayers() {
        all('[data-player]').forEach(function (box) {
            var video = box.querySelector('video');
            var playButton = box.querySelector('[data-play]');
            var stream = box.getAttribute('data-stream');
            var ready = false;
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function prepare() {
                if (ready) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                ready = true;
            }

            function play() {
                prepare();
                video.controls = true;
                box.classList.add('is-playing');
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            }

            function toggle() {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            if (playButton) {
                playButton.addEventListener('click', play);
            }
            video.addEventListener('click', toggle);
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    doc.addEventListener('DOMContentLoaded', function () {
        initImages();
        initMobileNav();
        initHero();
        initFilters();
        initPlayers();
    });
})();
