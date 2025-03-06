import queryString from 'query-string';
import xhr from 'xhr';
import { BASE_API_URL, REFRESH_TOKEN_KEY, TOKEN_KEY } from '../utils/constants';
import { getRefreshToken, getToken, setTokenInCookie } from '../utils/token';
import { store } from '../lib/app-state-hoc.jsx';
import { setSession } from '../reducers/session.js';

/**
 * Save a project JSON to the project server.
 * This should eventually live in scratch-www.
 * @param {number} projectId the ID of the project, null if a new project.
 * @param {object} vmState the JSON project representation.
 * @param {object} params the request params.
 * @property {?number} params.originalId the original project ID if a copy/remix.
 * @property {?boolean} params.isCopy a flag indicating if this save is creating a copy.
 * @property {?boolean} params.isRemix a flag indicating if this save is creating a remix.
 * @property {?string} params.title the title of the project.
 * @return {Promise} A promise that resolves when the network request resolves.
 */
export default function (projectId, vmState, params, projectTitle) {
    const token = getToken();
    const refreshToken = getRefreshToken();
    let opts = {
        body: JSON.stringify({
            data: vmState,
            name: projectTitle
        }),
        // If we set json:true then the body is double-stringified, so don't
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    };
    const creatingProject = projectId === null || typeof projectId === 'undefined' || projectId === '0';
    const queryParams = {};
    if (params.hasOwnProperty('originalId')) queryParams.original_id = params.originalId;
    if (params.hasOwnProperty('isCopy')) queryParams.is_copy = params.isCopy;
    if (params.hasOwnProperty('isRemix')) queryParams.is_remix = params.isRemix;
    if (params.hasOwnProperty('title')) queryParams.title = params.title;
    let qs = queryString.stringify(queryParams);
    if (qs) qs = `?${qs}`;
    if (creatingProject) {
        Object.assign(opts, {
            method: 'post',
            url: `${BASE_API_URL}/md/api/projects`
        });
    } else {
        Object.assign(opts, {
            method: 'post',
            url: `${BASE_API_URL}/md/api/projects/${projectId}`
        });
    }

    const makeRequest = (opts, retryCount = 0) => {
        return new Promise((resolve, reject) => {
            xhr(opts, (err, response) => {
                if (err) return reject(err);
                if(response.statusCode === 401 && retryCount < 1) {
                    refreshTokenFn(refreshToken).then((data) => {
                        const newToken = data[TOKEN_KEY];
                        const newRefreshToken = data[REFRESH_TOKEN_KEY];
                        // update token and refresh token in cookies and Redux
                        setTokenInCookie(TOKEN_KEY, newToken);
                        setTokenInCookie(REFRESH_TOKEN_KEY, newRefreshToken);
                        store.dispatch(setSession(newToken, newRefreshToken));

                        // update authorization header with new token
                        opts.headers['Authorization'] = `Bearer ${newToken}`;

                        // try again with new token
                        makeRequest(opts, retryCount + 1).then(resolve).catch(reject);
                    }).catch(err => {
                        return reject(err);
                    })
                } else if (response.statusCode !== 200 && response.statusCode !== 201) return reject(response.statusCode);
                let body;
                try {
                    // Since we didn't set json: true, we have to parse manually
                    body = JSON.parse(response.body);
                } catch (e) {
                    return reject(e);
                }
                resolve(body);
            });
        });
    }

    return makeRequest(opts);
}

function refreshTokenFn (refreshToken) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: `${BASE_API_URL}/md/api/auth/refresh`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
            }
        }
        xhr(options, (err, response) => {
            if (err) {
                return reject(err);
            }
            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return reject(new Error(`Failed to get new token: ${response.statusCode}`));
            }
            const data = JSON.parse(response.body);
            resolve(data);
        });
    });
};
