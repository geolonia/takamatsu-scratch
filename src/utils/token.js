import { store } from '../lib/app-state-hoc.jsx';
import Cookies from 'js-cookie'

export function getToken() {
    const state = store.getState();
    return state.session.session.token;
}

export function getTokenFromCookie(key) {
    return Cookies.get(key);
}

export function setTokenInCookie(key, token) {
    Cookies.set(key, token)
}
