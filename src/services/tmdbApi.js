const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const responseCache = new Map();

export function getTmdbApiKey() {
  const viteEnvKey =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.REACT_APP_TMDB_API_KEY || import.meta.env.VITE_TMDB_API_KEY
      : '';

  const key = (viteEnvKey || '').trim();
  if (
    !key ||
    key === 'MY_TMDB_API_KEY' ||
    key === 'your_api_key' ||
    key === 'your_tmdb_api_key_here'
  ) {
    return '';
  }

  return key;
}

export function hasValidTmdbKey() {
  return Boolean(getTmdbApiKey());
}

export async function fetchFromTmdb(endpoint, params = {}) {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key is not configured.');
  }

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...params,
  });

  const cacheKey = `${endpoint}?${searchParams.toString()}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  const data = await response.json();
  responseCache.set(cacheKey, data);
  return data;
}
