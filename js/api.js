async function fetchWithEndpoint(endpoint, path, options = {}) {
  const baseUrl = getApiBaseUrl(endpoint);
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': MICROCMS_CONFIG.apiKey,
    },
    ...options,
  });

  if (!response.ok) {
    const error = new Error(getErrorMessage(response.status, endpoint));
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function getErrorMessage(status, endpoint) {
  switch (status) {
    case 404:
      return `API「${endpoint}」が見つかりません。microCMS管理画面でAPI名が「${endpoint}」になっているか確認してください。`;
    case 401:
    case 403:
      return 'APIキーが無効です。microCMSのAPIキー設定を確認してください。';
    case 400:
      return 'APIリクエストに問題があります。フィールド名や並び順の設定を確認してください。';
    default:
      return `API Error: ${status}`;
  }
}

async function fetchBlogPosts(options = {}) {
  const { limit = 100, offset = 0, filters, orders } = options;
  const endpoints = [MICROCMS_CONFIG.endpoint, ...(MICROCMS_CONFIG.fallbackEndpoints || [])];
  const orderOptions = orders ? [orders] : ['-publishedAt', '-createdAt', null];

  let lastError;

  for (const endpoint of endpoints) {
    for (const order of orderOptions) {
      try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('offset', String(offset));
        if (order) params.set('orders', order);
        if (filters) params.set('filters', filters);

        const data = await fetchWithEndpoint(endpoint, `?${params.toString()}`);
        if (endpoint !== MICROCMS_CONFIG.endpoint) {
          MICROCMS_CONFIG.endpoint = endpoint;
        }
        return data;
      } catch (e) {
        lastError = e;
        if (e.status !== 404 && e.status !== 400) throw e;
      }
    }
  }

  throw lastError || new Error('記事データを取得できませんでした。');
}

async function fetchBlogPostById(id) {
  const endpoints = [MICROCMS_CONFIG.endpoint, ...(MICROCMS_CONFIG.fallbackEndpoints || [])];
  let lastError;

  for (const endpoint of endpoints) {
    try {
      return await fetchWithEndpoint(endpoint, `/${id}`);
    } catch (e) {
      lastError = e;
      if (e.status !== 404) throw e;
    }
  }

  throw lastError || new Error('記事が見つかりませんでした。');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getThumbnailUrl(post) {
  const thumb = post.thumbnail || post.eyecatch || post.image || post.cover;
  if (!thumb) return 'https://placehold.co/800x500/f0f0f0/999?text=No+Image';
  if (typeof thumb === 'string') return thumb;
  return thumb.url || 'https://placehold.co/800x500/f0f0f0/999?text=No+Image';
}

function getCategoryName(post) {
  const cat = post.category || post.categories || post.tag;
  if (!cat) return '未分類';
  if (typeof cat === 'string') return cat;
  if (Array.isArray(cat)) {
    const first = cat[0];
    if (!first) return '未分類';
    if (typeof first === 'string') return first;
    return first.name || first.title || '未分類';
  }
  return cat.name || cat.title || cat.label || '未分類';
}

function getBodyHtml(post) {
  return post.body || post.content || post.richEditor || '';
}

function getCategoryColor(category) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C94',
  ];
  let hash = 0;
  const str = category || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

function getAllCategories(posts) {
  const categories = new Set();
  posts.forEach((post) => categories.add(getCategoryName(post)));
  return Array.from(categories).sort();
}
