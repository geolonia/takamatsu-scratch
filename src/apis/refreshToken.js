import xhr from 'xhr';
import { BASE_API_URL } from '../utils/constants';

export default function refreshTokenFn (refreshToken) {
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
