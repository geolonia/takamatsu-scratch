const SET_SPRITES = 'SET_SPRITES';
const SET_COSTUMES = 'SET_COSTUMES';
const SET_SOUNDS = 'SET_SOUNDS';

const initialState = {
    sprites: [{}],
    costumes: [{}],
    sounds: [{}],
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
        case SET_SOUNDS:
            return Object.assign({}, state, {
                sounds: action.payload,
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

const setSounds = function (sounds) {
    return {
        type: SET_SOUNDS,
        payload: sounds
    };
};

export {
    reducer as default,
    initialState as assetsInitialState,
    setSprites,
    setCostumes,
    setSounds
};
