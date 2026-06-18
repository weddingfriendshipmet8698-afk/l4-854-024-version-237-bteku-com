(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatViews(value) {
    var number = Number(value) || 0;

    if (number >= 10000) {
      return (number / 10000).toFixed(1).replace(".0", "") + "万";
    }

    return String(number);
  }

  function movieToCard(movie) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.tags,
      movie.category
    ].join(" ");

    var tags = String(movie.tags || "")
      .split(/[,，/、；;\s]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");

    return [
      '<article class="movie-card compact" data-movie-card data-title="' + escapeHtml(text.toLowerCase()) + '" data-category="' + escapeHtml(movie.categorySlug) + '">',
      '  <a class="poster-frame" href="' + escapeHtml(movie.url) + '">',
      '    <img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="play-float">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · 热度 ' + formatViews(movie.views) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(movie.description) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join("\n");
  }

  function render() {
    var input = document.getElementById("search-input");
    var title = document.getElementById("search-title");
    var resultsBox = document.getElementById("search-results");
    var data = window.MOVIE_SEARCH_INDEX || [];
    var query = getQuery();
    var normalized = query.toLowerCase();

    if (input) {
      input.value = query;
    }

    if (!resultsBox || !title) {
      return;
    }

    if (!query) {
      title.textContent = "热门影片";
      return;
    }

    var results = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags,
        movie.category,
        movie.description
      ].join(" ").toLowerCase();

      return haystack.indexOf(normalized) !== -1;
    });

    title.textContent = "搜索结果：" + query + "（" + results.length + "）";

    if (!results.length) {
      resultsBox.innerHTML = '<div class="glass-effect sitemap-card"><h2>没有找到匹配影片</h2><p>可以尝试更短的关键词、年份、地区或类型。</p></div>';
      return;
    }

    resultsBox.innerHTML = results.slice(0, 240).map(movieToCard).join("\n");
  }

  document.addEventListener("DOMContentLoaded", render);
})();
