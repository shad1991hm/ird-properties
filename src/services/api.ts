import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ird-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ird-token');
      localStorage.removeItem('ird-user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
};

// Define interfaces for API data payloads
interface UserCreationData {
  username: string;
  name: string;
  role: 'admin' | 'user' | 'store_manager';
  department?: string;
  email?: string;
  password?: string; // Password might be required for creation
}

interface UserUpdateData {
  username?: string;
  name?: string;
  role?: 'admin' | 'user' | 'store_manager';
  department?: string;
  email?: string;
}

interface ChangePasswordData {
  currentPassword?: string; // Optional if admin is changing, or if it's part of a reset flow
  newPassword: string;
}

interface PropertyCreationData {
  number: string;
  name: string;
  model_number: string;
  serial_number: string;
  date: string; // Or Date
  company_name: string;
  measurement: string;
  quantity: number;
  unit_price: number;
  property_type: 'permanent' | 'temporary' | 'permanent-temporary';
  // available_quantity is usually calculated or managed by backend
}

interface PropertyUpdateData {
  number?: string;
  name?: string;
  model_number?: string;
  serial_number?: string;
  date?: string; // Or Date
  company_name?: string;
  measurement?: string;
  quantity?: number;
  unit_price?: number;
  property_type?: 'permanent' | 'temporary' | 'permanent-temporary';
  available_quantity?: number; // If updatable
}

interface RequestCreationData {
  property_id: string;
  property_number: string;
  property_name: string;
  quantity_type: string;
  requested_quantity: number;
  // userId, userName, userDepartment are usually set by backend based on authenticated user
}

interface RequestUpdateData {
  status?: 'pending' | 'approved' | 'rejected' | 'adjusted' | 'issued';
  approved_quantity?: number;
  reason?: string;
  admin_id?: string;
  store_manager_id?: string;
  issued_at?: string;
}


export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data: UserCreationData) => api.post('/users', data),
  update: (id: string, data: UserUpdateData) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (id: string, data: ChangePasswordData) => api.put(`/users/${id}/password`, data),
  getProfile: () => api.get('/profile'),
};

export const propertiesAPI = {
  getAll: () => api.get('/properties'),
  create: (data: PropertyCreationData) => api.post('/properties', data),
  update: (id: string, data: PropertyUpdateData) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
};

export const requestsAPI = {
  getAll: () => api.get('/requests'),
  create: (data: RequestCreationData) => api.post('/requests', data),
  update: (id: string, data: RequestUpdateData) => api.put(`/requests/${id}`, data),
};

export const issuanceAPI = {
  issueProperty: (requestId: string) =>
    api.post('/issue-property', { request_id: requestId }),
  getIssuedProperties: () => api.get('/issued-properties'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;