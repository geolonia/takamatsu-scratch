const SET_SESSION = 'SET_SESSION';
const GET_SESSION = 'GET_SESSION';

const initialState = {
    session: {
        user: {
            username: 'Hello Kitty',
        },
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

const setSession = function (username) {
    return {
        type: SET_SESSION,
        username: username,
    };
};

export {
    reducer as default,
    initialState as sessionInitialState,
    setSession,
    getSession,
};
