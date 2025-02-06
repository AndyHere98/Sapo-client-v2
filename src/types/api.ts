export interface ApiError {
  apiPath: string;
  errorStatus: number;
  errorMessage: string;
  errorTime: string;
  errorData?: any;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: number;
  description?: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface OrderItem extends CustomerInfo {
  totalDishes?: number;
  totalPrice?: number;
  paymentMethod: string;
  paymentType: string;
  id?: string;
  createdAt?: string;
  updateAt?: number;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  address?: string;
  orderDetails: CartItem[];
}

export interface DailyOrderSummary {
  dishName: string;
  quantity: number;
  sumPrice: number;
}

export interface TopCustomer extends CustomerInfo {
  totalOrders: number;
  totalDishes: number;
  totalSpending: number;
}

export interface MonthlyOrderSummary {
  totalSpending: number;
  totalDish: number;
  totalOrders: number;
  month: string;
  orderList: OrderItem[];
  topCustomer: TopCustomer[];
}

export interface YearlyOrderSummary {
  totalSpending: number;
  totalDish: number;
  totalOrders: number;
  year: string;
  monthlyOrderSummary: MonthlyOrderSummary[];
}

export interface OrderSummaryResponse {
  todayOrders: OrderItem[];
  dailyOrders: DailyOrderSummary[];
  yearlyOrders: YearlyOrderSummary[];
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  // paymentType: 'MOMO' | 'CASH' | 'BANK';
  paymentType: 'CASH' | 'CARD';
  paymentMethod: 'POSTPAID' | 'PREPAID';
}

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  paymentType: string;
  paymentRequest: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface SuccessfulResponse {
  status: string;
  message: string;
  data?: object;
}