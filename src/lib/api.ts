import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to include the auth token if we have one
api.interceptors.request.use((config) => {
    const session = localStorage.getItem('sb-kfrsumgfszyvjjbkoknp-auth-token'); // Supabase token key
    if (session) {
        const parsed = JSON.parse(session);
        if (parsed.access_token) {
            config.headers.Authorization = `Bearer ${parsed.access_token}`;
        }
    }
    return config;
});

export default api;
