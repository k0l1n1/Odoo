import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brightloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('brightloop_token');
      localStorage.removeItem('brightloop_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Subscription Plans endpoints
export const plansApi = {
  getAll: () => api.get('/plans'),
  getActive: () => api.get('/plans/active'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  toggleStatus: (id, status) => api.patch(`/plans/${id}/status`, { status }),
  delete: (id) => api.delete(`/plans/${id}`)
};

// Subscriptions endpoints
export const subscriptionsApi = {
  getAll: () => api.get('/subscriptions'),
  getMy: () => api.get('/subscriptions/my'),
  getById: (id) => api.get(`/subscriptions/${id}`),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
  cancel: (id, reason) => api.post(`/subscriptions/${id}/cancel`, { reason })
};

// Invoices endpoints
export const invoicesApi = {
  getAll: (params) => api.get('/invoices', { params }),
  getMy: () => api.get('/invoices/my'),
  getById: (id) => api.get(`/invoices/${id}`),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  downloadPdf: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' })
};

// Payments endpoints
export const paymentsApi = {
  getAll: (params) => api.get('/payments', { params }),
  getMy: () => api.get('/payments/my'),
  getById: (id) => api.get(`/payments/${id}`),
  processPayment: (data) => api.post('/payments/process', data)
};

// Renewals endpoints
export const renewalsApi = {
  getUpcoming: (days = 14) => api.get('/renewals/upcoming', { params: { days } }),
  getHistory: () => api.get('/renewals/history'),
  triggerCheck: (days = 7) => api.post('/renewals/trigger-check', { days })
};

// Customers endpoints
export const customersApi = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  toggleStatus: (id, status) => api.patch(`/customers/${id}/status`, { status })
};

// Dashboard endpoints
export const dashboardApi = {
  getAdmin: () => api.get('/dashboard/admin'),
  getCustomer: () => api.get('/dashboard/customer')
};

// Staff endpoints
export const staffApi = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  remove: (id) => api.delete(`/staff/${id}`)
};

// AI Copilot & Navigation Help endpoints
export const aiApi = {
  getHelp: (data) => api.post('/ai/help', data)
};

export default api;
