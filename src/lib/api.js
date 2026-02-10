import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const callApi = async (endpoint, options = {}) => {
    try {
        const user = auth.currentUser;
        if (!user && !options.noAuth) {
            throw new Error("User must be authenticated to call this API");
        }

        const token = user ? await user.getIdToken() : null;

        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (options.data) {
            config.body = JSON.stringify(options.data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "API request failed");
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};
