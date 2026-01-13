import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy handles target
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
