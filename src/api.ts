const configuredApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL || '';

export const apiUrl = configuredApiUrl.replace(/\/$/, '');

export const apiRequest = (path: string, init?: RequestInit) => fetch(`${apiUrl}${path}`, init);
