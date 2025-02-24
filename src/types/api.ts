// API Response Types
export interface ApiError {
  apiPath: string;
  errorStatus: number;
  errorMessage: string;
  errorTime: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorData?: any;
}

export interface SuccessfulResponse {
  message: string;
  timestamp: string;
}

// Customer Types
export interface CustomerInfo {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  ipAddress?: string;
  isAdmin?: boolean | false;
  pcHostName?: string;
  balance?: number;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  available: number;
}

// Order Types
export interface OrderItem {
  id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderDetails: CartItem[];
  status?: 'P' | 'S' | 'C';
  totalPrice?: number | 0;
  createdAt: number | 0;
  note?: string;
  paymentMethod?: string;
  paymentType?: string;
  isPaid?: boolean;
}

export interface YearlyOrderSummary {
  totalSpending: number;
  totalDish: number;
  totalOrders: number;
  year: string;
  monthlyOrderSummary: MonthlyOrderSummary[];
}

export interface MonthlyOrderSummary {
  totalSpending: number;
  totalDish: number;
  totalOrders: number;
  month: string;
  orderList: OrderItem[];
  topCustomer: TopCustomer[];
}

export interface OrderSummaryResponse {
  todayOrders: OrderItem[];
  dailyOrders: DailyOrderSummary[];
  yearlyOrders: YearlyOrderSummary[];
}
export interface DailyOrderSummary {
  dishName: string;
  quantity: number;
  sumPrice: number;
  unitPrice: number;
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

export interface CartItem extends MenuItem {
  quantity: number;
}

// Admin Summary Types
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
}

export interface AdminCustomerSummary {
  topCustomers: TopCustomer[];
  customerInfos: CustomerInfo[];
}

export interface TopCustomer {
  customerName: string;
  customerEmail: string;
  totalOrders: number;
  totalDishes: number;
  totalSpending: number;
}

// export interface CustomerActivity {
//   customerName: string;
//   lastOrderDate: string;
//   totalOrders: number;
//   totalSpent: number;
// }

export interface AdminBillingSummary {
  totalRevenue: number | 0;
  dailyRevenue: number | 0;
  monthlyRevenue: number | 0;
  yearlyRevenue: number | 0;
  revenueStats: {
    date: string;
    revenue: number;
    orderCount: number;
  }[];
  // paymentMethodStats: {
  //   method: string;
  //   count: number;
  //   amount: number;
  // }[];
  unpaidOrders: OrderItem[];
}