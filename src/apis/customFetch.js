import refreshToken from './refreshToken';
import xhr from 'xhr';

export default function customFetch (url, method, token, onSetSession) {
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
                    refreshToken(token).then((newToken) => {
                        onSetSession(newToken);
                        // repeat request with new token
                        options.headers['Authorization'] = `Bearer ${newToken}`;
                        return xhr(options, (err, response) => {
                            if (err) {
                                return reject(err);
                            }
                            if (response.statusCode !== 200 && response.statusCode !== 201) {
                                return reject(new Error(`Request to refresh token failed: ${response.statusCode}`));
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
