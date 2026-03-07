import axios from 'axios';

/**
 * Axios instance for Lakshmi Home Foods API
 * 
 * Base URL points to the PHP API server.
 * Update this when deploying to production.
 */
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// CSRF token interceptor
let csrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<string> {
    if (!csrfToken) {
        const response = await api.get('/csrf-token');
        csrfToken = response.data.csrf_token;
    }
    return csrfToken!;
}

// Attach CSRF token to mutating requests
api.interceptors.request.use(async (config) => {
    const method = (config.method || '').toLowerCase();
    if (['post', 'put', 'delete'].includes(method)) {
        const token = await fetchCsrfToken();
        config.headers['X-CSRF-Token'] = token;
    }
    return config;
});

// Response error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            if (window.location.pathname.startsWith('/admin') &&
                window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
