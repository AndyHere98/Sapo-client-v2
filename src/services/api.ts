import axios from 'axios';
import { config } from '../config/config';
import { ApiError, CustomerInfo, MenuItem, Order, OrderItem, OrderSummaryResponse, SuccessfulResponse } from '../types/api';

const api = axios.create({
  baseURL: config.baseApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = {
      apiPath: error.config.url,
      errorStatus: error.response?.status || 500,
      errorMessage: error.response?.data?.message || 'An unexpected error occurred',
      errorTime: new Date().toISOString(),
      errorData: error.response?.data,
    };
    return Promise.reject(apiError);
  }
);

// Auth Service
export const authService = {
  getUserInformation: async () => {
    const response = await api.get<CustomerInfo>('/user/auth');
    return response;
  },
  registerCustomer: async (customerInfo: CustomerInfo) => {
    console.log('Register Customer', customerInfo);
    
    const response = await api.post<Promise<SuccessfulResponse | ApiError>>('/user/register', customerInfo);
    return response;
  }
};

// Menu Service
export const menuService = {
  getMenu: async () => {
    const response = await api.get<MenuItem[]>('/menu');
    return response;
  },
};

// Order Service
export const orderService = {
  placeOrder: async (order: OrderItem) => {
    console.log('Place order', order);
    
    const response = await api.post<Order>('/orders/place', order);
    return response;
  },

  getOrders: async (params: { customerName?: string; fromDate?: string; toDate?: string }) => {
    const response = await api.get<OrderItem[]>('/orders/search', { params });
    return response;
  },

  updateOrder: async (orderId: string, order: Partial<Order>) => {
    const response = await api.put<Order>(`/orders/${orderId}`, order);
    return response;
  },

  cancelOrder: async (orderId: string) => {
    const response = await api.delete<void>(`/orders/${orderId}`);
    return response;
  },

  getSummary: async () => {
    const response = await api.get<OrderSummaryResponse>('/orders/summary');
    return response;
  },
};