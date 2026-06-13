const MICROCMS_CONFIG = {
  serviceDomain: 'zrh64qgjux',
  apiKey: 'D5MVefBEnJSxJbEe3KStdf3kOTHw37WZnqwW',
  endpoint: 'blogs',
  fallbackEndpoints: ['blog'],
};

function getApiBaseUrl(endpoint) {
  const ep = endpoint || MICROCMS_CONFIG.endpoint;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `/api/${ep}`;
  }
  return `https://${MICROCMS_CONFIG.serviceDomain}.microcms.io/api/v1/${ep}`;
}

const API_BASE_URL = getApiBaseUrl();
