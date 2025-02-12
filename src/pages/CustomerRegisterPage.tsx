import React, { Component, useState } from "react";
import CustomerModal from "../components/CustomerModal";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface CustomerRegisterPageProps {
  show: boolean;
  onHide: () => void;
}

export const CustomerRegisterPage: React.FC<CustomerRegisterPageProps> = ({
  show,
  onHide,
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <CustomerModal
        onHide={() => {
          onHide();
          setLoading(false);
        }}
      />
      <LoadingSpinner centered />
    </>
  );
};
