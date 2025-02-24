import React from "react";
import CustomerModal from "../components/CustomerModal";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface CustomerRegisterPageProps {
  onHide: () => void;
}

export const CustomerRegisterPage: React.FC<CustomerRegisterPageProps> = ({
  onHide,
}) => {
  return (
    <>
      <CustomerModal
        onHide={() => {
          onHide();
        }}
      />
      <LoadingSpinner centered />
    </>
  );
};
