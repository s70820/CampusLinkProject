/**
 * Runtime paths for local development vs CURSOR production (/s70820 context).
 */
const normalize = (value) => (value || '').replace(/\/$/, '');

export const appBasename = normalize(process.env.PUBLIC_URL);

export const apiBaseUrl = process.env.REACT_APP_API_URL
  || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');

export function appPath(path = '/') {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${appBasename}${suffix}` || suffix;
}

export function normalizeUploadPath(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const normalized = String(path).replace(/\\/g, '/').trim();
  const uploadsIndex = normalized.toLowerCase().indexOf('/uploads/');
  if (uploadsIndex >= 0) {
    return normalized.substring(uploadsIndex);
  }

  const bareUploadsIndex = normalized.toLowerCase().indexOf('uploads/');
  if (bareUploadsIndex >= 0) {
    return `/${normalized.substring(bareUploadsIndex)}`;
  }

  if (!/^[A-Za-z]:\//.test(normalized)) {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

export function resolveAssetUrl(path) {
  const normalizedPath = normalizeUploadPath(path);
  if (!normalizedPath) return '';
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;

  const webPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  const encodedPath = webPath
    .split('/')
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(decodeURIComponent(segment))))
    .join('/');

  if (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')) {
    return `${normalize(apiBaseUrl)}${encodedPath}`;
  }
  return `${window.location.origin}${normalize(apiBaseUrl)}${encodedPath}`;
}
