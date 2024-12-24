const SET_HAS_MODAL_EXTENSION_ALREADY_BEEN_OPENED = 'modalChooseExtension/SET_HAS_MODAL_EXTENSION_ALREADY_BEEN_OPENED';

const initialState = false;

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_HAS_MODAL_EXTENSION_ALREADY_BEEN_OPENED:
        return action.opened;
    default:
        return state;
    }
};
const setModalExtension = (isOpened) => {
    return {
        type: SET_HAS_MODAL_EXTENSION_ALREADY_BEEN_OPENED,
        opened: isOpened
    }
}

export {
    reducer as default,
    initialState as modalChooseExtensionInitialState,
    setModalExtension
};
