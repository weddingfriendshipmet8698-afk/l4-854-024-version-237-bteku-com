(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function card(movie) {
    return [
      '<a class="search-result-card" href="detail/' + movie.id + '.html">',
      '  <div class="cover-frame">',
      '    <img class="movie-cover" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  </div>',
      '  <div>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.one_line || '') + '</p>',
      '    <small>' + escapeHtml([movie.year, movie.region, movie.genre].filter(Boolean).join(' · ')) + '</small>',
      '  </div>',
      '</a>'
    ].join('');
  }

  ready(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var genreFilter = document.querySelector('[data-genre-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var movies = [];

    function applySearch() {
      var q = (input.value || '').trim().toLowerCase();
      var genre = genreFilter.value;
      var region = regionFilter.value;
      var type = typeFilter.value;
      var filtered = movies.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line].join(' ').toLowerCase();
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (genre && movie.genre.indexOf(genre) === -1) {
          return false;
        }
        if (region && movie.region !== region) {
          return false;
        }
        if (type && movie.type !== type) {
          return false;
        }
        return true;
      }).slice(0, 80);
      summary.textContent = '找到 ' + filtered.length + ' 条结果（最多显示 80 条）。';
      results.innerHTML = filtered.map(card).join('') || '<p class="text-slate-400">没有找到匹配结果。</p>';
    }

    fetch('assets/movies-search.json').then(function (response) {
      return response.json();
    }).then(function (data) {
      movies = data;
      var q = getQueryParam('q');
      if (q) {
        input.value = q;
      }
      applySearch();
    }).catch(function () {
      summary.textContent = '搜索索引载入失败。';
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applySearch();
    });
    [input, genreFilter, regionFilter, typeFilter].forEach(function (element) {
      element.addEventListener('input', applySearch);
      element.addEventListener('change', applySearch);
    });
  });
})();
