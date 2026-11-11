import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://abhiikhula-backend.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ak_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const shopApi = {
  getShops: (params) => apiClient.get('/api/shops', { params }),
  getShopBySlug: (slug) => apiClient.get(`/api/shops/${slug}`),
  getQueueStatus: (shopId) => apiClient.get(`/api/queue/${shopId}/status`),
};

export const queueApi = {
  joinQueue: (shopId, payload) => apiClient.post(`/api/queue/${shopId}/join`, payload),
  getMyActiveTokens: () => apiClient.get('/api/queue/my-tokens'),
  cancelToken: (tokenId) => apiClient.post(`/api/queue/tokens/${tokenId}/cancel`),
};

export const zoneApi = {
  getCategories: () => apiClient.get('/api/categories'),
  getZones: () => apiClient.get('/api/zones'),
};

