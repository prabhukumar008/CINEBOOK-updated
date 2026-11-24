const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const FALLBACK_POSTER =
  '/src/assets/images/poster_crimson_horizon_1795435470742.jpg';
export const FALLBACK_BACKDROP =
  '/src/assets/images/hero_crimson_horizon_1795435466299.jpg';

export function getPosterUrl(path, size = 'w500') {
  if (!path) {
    return FALLBACK_POSTER;
  }
  if (path.startsWith('http') || path.startsWith('/src/') || path.startsWith('data:')) {
    return path;
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path, size = 'w1280') {
  if (!path) {
    return FALLBACK_BACKDROP;
  }
  if (path.startsWith('http') || path.startsWith('/src/') || path.startsWith('data:')) {
    return path;
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getProfileUrl(path, size = 'w185') {
  if (!path) {
    return null;
  }
  if (path.startsWith('http') || path.startsWith('/src/') || path.startsWith('data:')) {
    return path;
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
