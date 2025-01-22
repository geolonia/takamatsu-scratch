import store from '';
import { setSession } from './reducers/session'
import BASE_API_URL from '../utils/constants';

const customFetch = async (url) => {
    const token = store.getState().session.token;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
        headers
    });

    if (response.status === 401) {
        // Token is expired, try to refresh it
        const refreshResponse = await fetch(`${BASE_API_URL}/md/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                header: `Bearer ${token}`
            },
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            store.dispatch(setSession(data.token));

            // repeat the original request with the new token
            headers['Authorization'] = `Bearer ${data.token}`;
            return fetch(url, {
                headers
            });
        } else {
            // Redirect to login page
            console.error('Failed to refresh token');
            window.location.href = `${BASE_API_URL}/md/api/login`;
        }
    }

    return response;
};

export default customFetch;
