/**
 * Utility to fix and format URLs for attachments and images.
 * It handles:
 * 1. Replacing hardcoded localhost:5000 with the correct API base URL in production.
 * 2. Prepending the API base URL to relative paths.
 */
export const fixUrl = (url) => {
    if (!url) return '';

    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    
    // 1. If it's a localhost link but we are in production (or using a different API URL)
    if (url.includes('localhost:5000') && !apiBaseUrl.includes('localhost:5000')) {
        return url.replace(/http:\/\/localhost:5000/g, apiBaseUrl);
    }

    // 2. If it's already a full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // 3. If it's a relative path (e.g., uploads/...), prepend API base URL
    // Ensure relative path starts with a single slash if it doesn't already
    const relativePath = url.startsWith('/') ? url : `/${url}`;
    return `${apiBaseUrl}${relativePath}`;
};
