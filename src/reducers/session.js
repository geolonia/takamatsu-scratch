import { getUsernameFromToken } from "../lib/session-utils";

const SET_SESSION = 'SET_SESSION';
const GET_SESSION = 'GET_SESSION';

const initialState = {
    session: {
        session: {
            user: {
                username: 'Hello Kitty',
                token: '1234567890',
            },
        }
    },
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case SET_SESSION:
            return Object.assign({}, state, {
                session: {
                    user: {
                        username: action.username,
                        token: action.token,
                    },
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

const setSession = function (token) {
    const username = getUsernameFromToken(token);
    return {
        type: SET_SESSION,
        username: username,
        token: token,
    };
};

export {
    reducer as default,
    initialState as sessionInitialState,
    setSession,
    getSession,
};
