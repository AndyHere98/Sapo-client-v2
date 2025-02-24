import { useRoutes, Navigate } from "react-router-dom";
import { Menu } from "../pages/Menu";
import { OrderHistory } from "../pages/OrderHistory";
import { OrderSummary } from "../pages/OrderSummary";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminOrders } from "../pages/admin/AdminOrders";
import { AdminCustomers } from "../pages/admin/AdminCustomers";
import { AdminBilling } from "../pages/admin/AdminBilling";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { CustomerInfo } from "../types/api";

interface RoutesProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}

export const AppRoutes = ({ customerInfo, onGetCustomerInfo }: RoutesProps) => {
  return useRoutes([
    {
      path: "/",
      element: (
        <CustomerLayout
          customerInfo={customerInfo}
          onGetCustomerInfo={onGetCustomerInfo}
        />
      ),
      children: [
        { index: true, element: <Navigate to="/menu" replace /> },
        {
          path: "menu",
          element: (
            <Menu
              customerInfo={customerInfo}
              onGetCustomerInfo={onGetCustomerInfo}
            />
          ),
        },
        {
          path: "history",
          element: (
            <OrderHistory
              customerInfo={customerInfo}
              onGetCustomerInfo={onGetCustomerInfo}
            />
          ),
        },
        {
          path: "summary",
          element: <OrderSummary onGetCustomerInfo={onGetCustomerInfo} />,
        },
      ],
    },
    {
      path: "/admin",
      element: (
        <AdminDashboard
          customerInfo={customerInfo}
          onGetCustomerInfo={onGetCustomerInfo}
        />
      ),
      children: [
        { index: true, element: <Navigate to="/admin/orders" replace /> },
        { path: "orders", element: <AdminOrders /> },
        { path: "customers", element: <AdminCustomers /> },
        { path: "billing", element: <AdminBilling /> },
      ],
    },
  ]);
};
