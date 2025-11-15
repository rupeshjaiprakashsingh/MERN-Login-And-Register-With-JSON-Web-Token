// Get the backend URL dynamically. Prefer VITE_API_BASE when provided.
const getApiBase = () => {
    // Vite injects environment variables prefixed with VITE_
    // e.g. VITE_API_BASE can be set in hosting to point to the API.
    const envBase = import.meta.env.VITE_API_BASE;
    if (envBase) return envBase.replace(/\/$/, '');

    // In production we'll serve frontend and backend from the same origin, so
    // use relative paths (empty base) to avoid CORS/mixed-content issues.
    if (import.meta.env.MODE === 'production') return '';

    // Development: call the backend on the port specified in VITE_API_PORT or default to 3000
    const apiPort = import.meta.env.VITE_API_PORT || 3000;
    const apiHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    return `http://${apiHost}:${apiPort}`;
};

export const API_BASE = getApiBase();

// Axios configuration helper
export const getAuthHeaders = () => {
    const token = localStorage.getItem('auth') || localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};