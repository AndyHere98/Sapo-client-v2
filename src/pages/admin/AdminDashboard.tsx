import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { ToastProvider } from "../../contexts/ToastContext";

export const AdminDashboard: React.FC = () => {
  return (
    <ToastProvider>
      <div className="admin-dashboard">
        <AdminSidebar />
        <motion.div
          className="content-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Container fluid className="py-4">
            <Outlet />
          </Container>
        </motion.div>
      </div>

      <style>
        {`
          .admin-dashboard {
            min-height: 100vh;
            background-color: #f8f9fa;
          }

          .content-wrapper {
            margin-left: 70px;
            transition: margin-left 0.2s ease;
            min-height: 100vh;
            background-color: #f8f9fa;
          }

          @media (min-width: 768px) {
            .content-wrapper {
              margin-left: 250px;
            }
          }
        `}
      </style>
    </ToastProvider>
  );
};
