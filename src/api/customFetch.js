import store from '';
import { setSession } from './reducers/session'
import BASE_API_URL from '../utils/constants';

const customFetch = async (url) => {
    const token = store.getState().session.token;
    console.log('[token]', token);
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

            // Repetir a requisição original com o novo token
            headers['Authorization'] = `Bearer ${data.token}`;
            return fetch(url, {
                headers
            });
        } else {
            // Redirect to login page
            console.error('Failed to refresh token');
        }
    }

    return response;
};

export default customFetch;
