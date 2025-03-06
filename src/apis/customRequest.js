import xhr from 'xhr';

export default function customRequest (url, method, token) {
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
            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return reject(new Error(`Request failed: ${response.statusCode}`));
            } else {
                resolve(JSON.parse(response.body));
            }
        });
    });
};
