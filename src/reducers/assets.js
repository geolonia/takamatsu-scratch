const SET_SPRITES = 'SET_SPRITES';
const SET_COSTUMES = 'GET_COSTUMES';

const initialState = {
    sprites: [{}],
    costumes: [{}],
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case SET_SPRITES:
            return Object.assign({}, state, {
                sprites: action.payload,
            });
        case SET_COSTUMES:
            return Object.assign({}, state, {
                costumes: action.payload,
            });
        default:
            return state;
    }
};

const setSprites = function (sprites) {
    return {
        type: SET_SPRITES,
        payload: sprites
    };
};

const setCostumes = function (costumes) {
    return {
        type: SET_COSTUMES,
        payload: costumes
    };
};

export {
    reducer as default,
    initialState as sessionInitialState,
    setSprites,
    setCostumes
};
