// API configuration - uses environment variable in production, localhost in development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const api = {
  baseUrl: API_URL,
  
  // Auth endpoints
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
  },
  
  // User endpoints
  user: {
    me: `${API_URL}/user/me`,
    balance: `${API_URL}/user/balance`,
    ledger: `${API_URL}/user/ledger`,
  },
  
  // Trade endpoints
  trade: {
    buy: `${API_URL}/trade/buy`,
    sell: `${API_URL}/trade/sell`,
  },
  
  // Admin endpoints
  admin: {
    stats: `${API_URL}/admin/pools/stats`,
    pools: `${API_URL}/admin/pools`,
    price: `${API_URL}/prices/current`,
    createPrice: `${API_URL}/prices`,
    payouts: `${API_URL}/admin/payouts`,
    approvePayout: (id: string) => `${API_URL}/admin/payouts/${id}/approve`,
    rejectPayout: (id: string) => `${API_URL}/admin/payouts/${id}/reject`,
  },
};

// Helper function to make authenticated requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

