/**
 * EcoTradex — Shared API Configuration
 * Centralized API base URL and helper function
 */

const API_BASE_URL = 'https://ecotradex-qeqc.onrender.com';
const apiUrl = (path) => new URL(path, API_BASE_URL).toString();
