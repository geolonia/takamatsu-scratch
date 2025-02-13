import { store } from '../lib/app-state-hoc.jsx';

export function getToken() {
    const state = store.getState();
    return state.session.session.token;
}

export function getTokenFromCookie(key) {
    const cookieContent = document.cookie
      .split(";")
      .map((cookie) => cookie.split("="))
      .reduce(
        (accumulator, [key, value]) => ({
          ...accumulator,
          [key.trim()]: decodeURIComponent(value),
        }),
        {},
      );
    return cookieContent[key];
}

export function setTokenInCookie(token) {
    document.cookie = `access_token=${token}`;
}
