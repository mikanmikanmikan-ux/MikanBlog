document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('article-container');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    renderError(container, '記事IDが指定されていません。', () => {
      window.location.href = 'blog.html';
    });
    return;
  }

  try {
    const post = await fetchBlogPostById(id);
    renderArticle(container, post);
    document.title = `${post.title || '記事'} - My Blog`;
  } catch (error) {
    renderError(container, error.message, () => location.reload());
  }
});

function renderArticle(container, post) {
  const category = getCategoryName(post);
  const color = getCategoryColor(category);
  const thumbnail = getThumbnailUrl(post);

  container.innerHTML = `
    <article class="article">
      <a href="blog.html" class="article__back">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        記事一覧に戻る
      </a>
      <span class="article__category" style="background: ${color}">${category}</span>
      <h1 class="article__title">${post.title || '無題'}</h1>
      <p class="article__meta">${formatDate(post.publishedAt)}</p>
      ${thumbnail ? `
        <div class="article__thumbnail">
          <img src="${thumbnail}" alt="${post.title || ''}">
        </div>
      ` : ''}
      <div class="article__body">${getBodyHtml(post) || '<p>本文がありません。</p>'}</div>
    </article>
  `;
}
