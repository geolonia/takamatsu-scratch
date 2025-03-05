import { getUsernameFromToken } from "../lib/session-utils";

const SET_SESSION = 'SET_SESSION';
const GET_SESSION = 'GET_SESSION';

const initialState = {
    session: {
        user: '',
        token: '',
        refreshToken: ''
    }
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case SET_SESSION:
            return Object.assign({}, state, {
                session: {
                    user: action.user,
                    token: action.token,
                    refreshToken: action.refreshToken
                },
            });
        case GET_SESSION:
            return state;
        default:
            return state;
    }
};

const getSession = function () {
    return {
        type: GET_SESSION,
    };
};

const setSession = function (token, refreshToken) {
    const user = getUsernameFromToken(token);
    return {
        type: SET_SESSION,
        user: user,
        token: token,
        refreshToken: refreshToken
    };
};

export {
    reducer as default,
    initialState as sessionInitialState,
    setSession,
    getSession,
};
