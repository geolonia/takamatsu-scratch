import PropTypes from 'prop-types';
import React from 'react';
import Box from '../box/box.jsx';
import {FormattedMessage} from 'react-intl';

import styles from './crash-message.css';
import reloadIcon from './reload.svg';
import { BASE_API_URL } from '../../utils/constants.js';

const CrashMessage = props => (
    <div className={styles.crashWrapper}>
        <Box className={styles.body}>
            <img
                className={styles.reloadIcon}
                src={reloadIcon}
            />
            <h2>
                <FormattedMessage
                    defaultMessage="Oops! Something went wrong."
                    description="Crash Message title"
                    id="gui.crashMessage.label"
                />
            </h2>
            {props.eventId && (
                <p>
                    <FormattedMessage
                        defaultMessage="Your error was logged with id {errorId}"
                        description="Message to inform the user that page has crashed."
                        id="gui.crashMessage.errorNumber"
                        values={{
                            errorId: props.eventId
                        }}
                    />
                </p>
            )}
            <a href={`${BASE_API_URL}/app`} className={styles.textLink}>Go back to projects list</a>
        </Box>
    </div>
);

CrashMessage.propTypes = {
    eventId: PropTypes.string,
    onReload: PropTypes.func.isRequired
};

export default CrashMessage;
