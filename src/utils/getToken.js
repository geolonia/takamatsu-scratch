import { store } from '../lib/app-state-hoc.jsx';

function getToken() {
    const state = store.getState();
    return state.session.session.token;
}

export default getToken;
