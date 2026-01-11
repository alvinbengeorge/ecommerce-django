import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    // Call refresh endpoint
                    // Note: We use a separate instance or fetch to avoid infinite loops if this fails
                    const res = await axios.post('http://127.0.0.1:8000/api/auth/refresh/', {
                        refresh: refreshToken
                    });

                    const newAccessToken = res.data.access;

                    // Save new token
                    localStorage.setItem('access_token', newAccessToken);

                    // Update header for original request
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    console.error("Token refresh failed", refreshError);
                    // Clear tokens and redirect
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    // Optional: Redirect to login or just let the error propagate
                    // window.location.href = '/login'; 
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, force login
                localStorage.removeItem('access_token');
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
