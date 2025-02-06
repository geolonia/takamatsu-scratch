const SET_SESSION = 'SET_SESSION';
const GET_SESSION = 'GET_SESSION';

const initialState = {
    session: {
        token: '',
    }
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case SET_SESSION:
            return Object.assign({}, state, {
                session: {
                    token: action.token,
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
    return {
        type: SET_SESSION,
        token: token,
    };
};

export {
    reducer as default,
    initialState as sessionInitialState,
    setSession,
    getSession,
};
