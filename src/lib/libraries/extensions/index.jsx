import React from 'react';
import {FormattedMessage} from 'react-intl';

import geoloniaIconURL from './geolonia/geolonia.png';
import geoloniaInsetIconURL from './geolonia/geolonia-small.png';

export default [
    {
        name: (
            <FormattedMessage
                defaultMessage="高松市スマートマップ"
                description="Name for the 'geolonia' extension"
                id="gui.extension.geolonia.name"
            />
        ),
        extensionId: 'geolonia',
        iconURL: geoloniaIconURL,
        insetIconURL: geoloniaInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="高松市について知りながらプログラミングも学ぼう！"
                description="Description for the 'geolonia' extension"
                id="gui.extension.geolonia.description"
            />
        ),
        featured: true
    }
];
