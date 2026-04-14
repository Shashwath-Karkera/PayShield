export function getSessionToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem('ps_session_token') || '';
}

export function withAuthHeaders(headers = {}) {
  const token = getSessionToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`
  };
}

export function authFetch(input, init = {}) {
  return fetch(input, {
    ...init,
    headers: withAuthHeaders(init.headers || {})
  });
}
