import { BASE_API_URL, REFRESH_TOKEN_KEY, TOKEN_KEY } from '../utils/constants';
import refreshTokenFn from './refreshToken';
import xhr from 'xhr';
import { setTokenInCookie } from '../utils/token';

export default function customFetch (url, method, token, refreshToken, onSetSession) {
    const options = {
            method: method,
            url: url,
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }
    return new Promise((resolve, reject) => {
        xhr(options, (err, response) => {
            if (err) {
                return reject(err);
            }
            if (response.statusCode === 401) {
                // token expired, try to refresh it
                try {
                    refreshTokenFn(refreshToken).then((newToken, newRefreshToken) => {
                        onSetSession(newToken, newRefreshToken);
                        setTokenInCookie(TOKEN_KEY, newToken);
                        setTokenInCookie(REFRESH_TOKEN_KEY, newRefreshToken);
                        // repeat request with new token
                        options.headers['Authorization'] = `Bearer ${newToken}`;
                        return xhr(options, (err, response) => {
                            if (err) {
                                return reject(err);
                            }
                            if (response.statusCode !== 200 && response.statusCode !== 201) {
                                // redirect to login page because retry failed
                                window.location.href = `${BASE_API_URL}/login`;
                            }
                            resolve(JSON.parse(response.body));
                        });
                    });

                } catch (tokenError) {
                    return reject(tokenError);
                }
            } else if (response.statusCode !== 200 && response.statusCode !== 201) {
                return reject(new Error(`Request failed: ${response.statusCode}`));
            } else {
                resolve(JSON.parse(response.body));
            }
        });
    });
};
