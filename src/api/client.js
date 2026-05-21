import CookieManager from '@react-native-cookies/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');
const JWT_KEY = '@cbook_session_jwt';

function extractJwtFromSetCookie(setCookie) {
  if (!setCookie) return null;
  const match = setCookie.match(/app_session=([^;]+)/);
  return match ? match[1] : null;
}

async function saveJwt(jwt) {
  if (!jwt) return;
  try {
    const domain = BASE_URL.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
    await CookieManager.set(BASE_URL, {
      name: 'app_session',
      value: jwt,
      domain,
      path: '/',
    });
  } catch (e) {
    console.error('Error guardando cookie en CookieManager:', e);
  }
  try {
    await AsyncStorage.setItem(JWT_KEY, jwt);
  } catch (e) {
    console.error('Error guardando JWT en AsyncStorage:', e);
  }
}

async function getJwt() {
  try {
    const cookies = await CookieManager.get(BASE_URL);
    if (cookies && cookies['app_session']) {
      return cookies['app_session'].value;
    }
  } catch (e) {
    // CookieManager fallo, usar AsyncStorage
  }
  try {
    return await AsyncStorage.getItem(JWT_KEY);
  } catch (e) {
    return null;
  }
}

async function clearJwt() {
  try {
    await CookieManager.clearAll();
  } catch (e) {
    console.error('Error limpiando CookieManager:', e);
  }
  try {
    await AsyncStorage.removeItem(JWT_KEY);
  } catch (e) {
    console.error('Error limpiando AsyncStorage:', e);
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}/auth${endpoint}`;
  const jwt = await getJwt();

  const headers = { 'Content-Type': 'application/json' };
  if (jwt) {
    headers['Cookie'] = `app_session=${jwt}`;
  }

  const config = { headers, ...options };
  const res = await fetch(url, config);

  const setCookie = res.headers.get('set-cookie');
  const newJwt = extractJwtFromSetCookie(setCookie);
  if (newJwt) await saveJwt(newJwt);

  if (res.status === 401) {
    await clearJwt();
    const err = new Error('Sesion expirada');
    err.status = 401;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const err = new Error(`El servidor no esta disponible (${res.status})`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();

  if (!res.ok) {
    const msg = data.error || data.message || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  clearJwt,
};

export default api;
