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
  quantity: number | 0;
  unitPrice: number | 0;
  sumPrice: number | 0;
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

// Admin Interfaces
export interface AdminOrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  dailyOrderStats: {
    date: string;
    orderCount: number;
    totalAmount: number;
  }[];
  recentOrders: OrderItem[];
  popularDishes: {
    dishName: string;
    orderCount: number;
    totalRevenue: number;
  }[];
}

export interface AdminCustomerSummary {
  totalCustomers: number;
  newCustomersToday: number;
  customerStats: {
    date: string;
    newCustomers: number;
    activeCustomers: number;
  }[];
  topCustomers: TopCustomer[];
  customerActivity: {
    customerName: string;
    lastOrderDate: string;
    totalOrders: number;
    totalSpent: number;
  }[];
}

export interface AdminBillingSummary {
  totalRevenue: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueStats: {
    date: string;
    revenue: number;
    orderCount: number;
  }[];
  paymentMethodStats: {
    method: string;
    count: number;
    amount: number;
  }[];
  unpaidOrders: {
    orderId: string;
    customerName: string;
    amount: number;
    dueDate: string;
  }[];
}