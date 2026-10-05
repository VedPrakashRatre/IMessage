import axios from 'axios';

let tokenGetter = null;

export const axiosInstance = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

export function setAuthToken(token) {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
}

export function setTokenGetter(getter) {
    tokenGetter = getter;
}

// Request interceptor to refresh token if needed
axiosInstance.interceptors.request.use(async (config) => {
    // If we have a token getter and no Authorization header, try to get a fresh token
    if (tokenGetter && !config.headers.Authorization) {
        try {
            const token = await tokenGetter();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Failed to get auth token:', error);
        }
    }
    return config;
});

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && tokenGetter) {
            originalRequest._retry = true;
            try {
                const token = await tokenGetter();
                if (token) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.warn('Failed to refresh token:', refreshError);
            }
        }
        return Promise.reject(error);
    }
);