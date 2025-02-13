import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Header } from "../components/Header";
import { motion } from "framer-motion";
import { CustomerInfo } from "../types/api";

interface CustomerLayoutProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  customerInfo,
  onGetCustomerInfo,
}) => {
  return (
    <>
      <Header
        customerInfo={customerInfo}
        onGetCustomerInfo={onGetCustomerInfo}
      />
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Container>
    </>
  );
};
