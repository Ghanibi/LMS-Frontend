import axios from 'axios';

export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

axios.defaults.baseURL = API_ORIGIN;

export function backendUrl(path: string) {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
