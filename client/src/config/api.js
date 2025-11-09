// Get the backend URL dynamically based on the current hostname
const getApiBase = () => {
    // If running locally, use the same hostname as the page but port 3000
    const apiHost = window.location.hostname === 'localhost' 
        ? 'localhost' 
        : window.location.hostname;
    // Always use HTTP for backend
    return `http://${apiHost}:3000`;
};

export const API_BASE = getApiBase();

// Axios configuration
export const getAuthHeaders = () => {
    const token = localStorage.getItem('auth') || localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};