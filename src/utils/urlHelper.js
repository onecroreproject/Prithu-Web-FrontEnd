/**
 * Formats a media path from the database into a full URL.
 * Handles cases where path might already be an absolute URL or a relative path.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';

    // Normalize backslashes to forward slashes
    let normalized = path.replace(/\\/g, '/');

    // If it's already an absolute URL (http/https), return as is
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        return normalized;
    }

    // Ensure the path starts with a slash
    const normalizedPath = normalized.startsWith('/') ? normalized : `/${normalized}`;

    // Combine with media base URL from environment, or fallback to live API domain
    const rawBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/web\/?$/, '') : '') || 'https://api.prithu.app';

    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

    return `${cleanBaseUrl}${normalizedPath}`;
};
