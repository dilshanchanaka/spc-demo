// Backend base URL. Set VITE_API_URL in your hosting dashboard (no trailing slash).
// Falls back to the local API for development.
export const API_URL = (import.meta.env.VITE_API_URL || "https://localhost:7084").replace(/\/+$/, "");
