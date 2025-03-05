import { store } from '../lib/app-state-hoc.jsx';
import Cookies from 'js-cookie'

export function getToken() {
    const state = store.getState();
    console.log('[👽]', );
    console.log('[getToken]', state.session.session.token);
    return state.session.session.token;
}

export function getRefreshToken() {
    const state = store.getState();
    console.log('[✅]', );
    console.log('[state]', state);
    return state.session.session.refreshToken;
}

export function getTokenFromCookie(key) {
    return Cookies.get(key);
}

export function setTokenInCookie(key, token) {
    Cookies.set(key, token)
}
