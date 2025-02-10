import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Header } from "../components/Header";
import { motion } from "framer-motion";

export const CustomerLayout: React.FC = () => {
  return (
    <>
      <Header />
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
