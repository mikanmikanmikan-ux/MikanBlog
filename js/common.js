const NAV_ITEMS = [
  { href: 'about.html', label: 'このサイトについて', id: 'about' },
  { href: 'blog.html', label: 'Blog', id: 'blog' },
  { href: 'sns.html', label: 'SNSアカウント', id: 'sns' },
  { href: 'contact.html', label: 'Contact', id: 'contact' },
];

function getHeaderHTML(activeId) {
  const navLinks = NAV_ITEMS.map((item) =>
    `<a href="${item.href}" class="header__nav-link${item.id === activeId ? ' header__nav-link--active' : ''}">${item.label}</a>`
  ).join('');

  const footerLinks = NAV_ITEMS.map((item) =>
    `<a href="${item.href}" class="footer__nav-link">${item.id === 'sns' ? 'SNS' : item.label.replace('SNSアカウント', 'SNS')}</a>`
  ).join('');

  return {
    header: `
      <header class="header">
        <div class="header__inner">
          <a href="index.html" class="header__logo">
            <span class="header__logo-icon">B</span>
            My Blog
          </a>
          <nav class="header__nav">${navLinks}</nav>
          <div class="header__actions">
            <button class="header__search-btn" aria-label="検索">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            <button class="header__menu-btn" aria-label="メニュー">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>
      <div class="search-overlay">
        <div class="search-overlay__box">
          <input type="text" class="search-overlay__input" placeholder="キーワードで記事を検索...">
          <p class="search-overlay__hint">Enterキーで検索 / Escキーで閉じる</p>
        </div>
      </div>
    `,
    footer: `
      <footer class="footer">
        <div class="footer__inner">
          <p class="footer__logo">My Blog</p>
          <nav class="footer__nav">${footerLinks}</nav>
          <p class="footer__copy">&copy; 2026 My Blog. All rights reserved.</p>
        </div>
      </footer>
    `,
  };
}

function injectLayout(activeId) {
  const layout = getHeaderHTML(activeId);
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = layout.header;
  if (footerEl) footerEl.innerHTML = layout.footer;
}

function createCard(post) {
  const category = getCategoryName(post);
  const color = getCategoryColor(category);

  const card = document.createElement('a');
  card.className = 'card';
  card.href = `article.html?id=${post.id}`;

  card.innerHTML = `
    <div class="card__image-wrap">
      <img class="card__image" src="${getThumbnailUrl(post)}" alt="${post.title || ''}" loading="lazy">
    </div>
    <div class="card__body">
      <span class="card__tag" style="background: ${color}">${category}</span>
      <h3 class="card__title">${post.title || '無題'}</h3>
      <p class="card__date">${formatDate(post.publishedAt || post.createdAt)}</p>
    </div>
  `;

  return card;
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="loading">
      <div class="loading__spinner"></div>
      <p>読み込み中...</p>
    </div>
  `;
}

function renderError(container, message, onRetry) {
  container.innerHTML = `
    <div class="error-state">
      <div class="error-state__icon">⚠️</div>
      <h3 class="error-state__title">データの取得に失敗しました</h3>
      <p class="error-state__message">${message || 'ネットワーク接続を確認して、再度お試しください。'}</p>
      <p class="error-state__hint">※ ローカル確認時は <code>python server.py</code> で起動してください（file:// では動作しません）</p>
      <button class="error-state__retry" id="retry-btn">再試行</button>
    </div>
  `;
  const retryBtn = container.querySelector('#retry-btn');
  if (retryBtn && onRetry) {
    retryBtn.addEventListener('click', onRetry);
  }
}

function renderEmpty(container, message) {
  container.innerHTML = `
    <div class="empty-state">
      <h3 class="empty-state__title">記事が見つかりません</h3>
      <p>${message || 'まだ記事が投稿されていません。'}</p>
    </div>
  `;
}

function initHeader() {
  const menuBtn = document.querySelector('.header__menu-btn');
  const nav = document.querySelector('.header__nav');
  const searchBtn = document.querySelector('.header__search-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchInput = document.querySelector('.search-overlay__input');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('header__nav--open');
    });
  }

  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('search-overlay--open');
      if (searchInput) searchInput.focus();
    });

    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('search-overlay--open');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `blog.html?q=${encodeURIComponent(query)}`;
        }
      }
      if (e.key === 'Escape') {
        searchOverlay.classList.remove('search-overlay--open');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const activeNav = document.body.dataset.activeNav || '';
  injectLayout(activeNav);
  initHeader();
});
