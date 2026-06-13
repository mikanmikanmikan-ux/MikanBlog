document.addEventListener('DOMContentLoaded', async () => {
  const blogCards = document.getElementById('blog-cards');
  const categoryFilters = document.getElementById('category-filters');
  const searchInput = document.getElementById('search-input');
  const resultCount = document.getElementById('result-count');

  let allPosts = [];
  let activeCategory = 'all';
  let searchQuery = '';

  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) {
    searchQuery = params.get('q');
    searchInput.value = searchQuery;
  }

  renderLoading(blogCards);

  async function loadPosts() {
    try {
      const data = await fetchBlogPosts({ limit: 100 });
      allPosts = data.contents || [];
      renderCategoryFilters();
      filterAndRender();
    } catch (error) {
      renderError(blogCards, error.message, loadPosts);
    }
  }

  function renderCategoryFilters() {
    const categories = getAllCategories(allPosts);

    categoryFilters.innerHTML = `
      <button class="filter-bar__category-btn filter-bar__category-btn--active" data-category="all">すべて</button>
      ${categories.map((cat) => `
        <button class="filter-bar__category-btn" data-category="${cat}">${cat}</button>
      `).join('')}
    `;

    categoryFilters.querySelectorAll('.filter-bar__category-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        categoryFilters.querySelectorAll('.filter-bar__category-btn').forEach((b) => {
          b.classList.remove('filter-bar__category-btn--active');
        });
        btn.classList.add('filter-bar__category-btn--active');
        activeCategory = btn.dataset.category;
        filterAndRender();
      });
    });
  }

  function filterAndRender() {
    let filtered = [...allPosts];

    if (activeCategory !== 'all') {
      filtered = filtered.filter((post) => getCategoryName(post) === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        const title = (post.title || '').toLowerCase();
        const body = stripHtml(getBodyHtml(post)).toLowerCase();
        return title.includes(q) || body.includes(q);
      });
    }

    blogCards.innerHTML = '';

    if (filtered.length === 0) {
      renderEmpty(blogCards, searchQuery || activeCategory !== 'all'
        ? '条件に一致する記事が見つかりませんでした。'
        : 'まだ記事が投稿されていません。');
      resultCount.textContent = '0件の記事';
      return;
    }

    filtered.forEach((post) => {
      blogCards.appendChild(createCard(post));
    });

    resultCount.textContent = `${filtered.length}件の記事`;
  }

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      filterAndRender();
    }, 300);
  });

  loadPosts();
});
