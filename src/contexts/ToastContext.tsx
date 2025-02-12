import React, { createContext, useContext, useState } from "react";
import { CustomToast } from "../components/CustomToast";
import { ApiError } from "../types/api";

interface ToastContextType {
  showToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => void;
  handleApiError: (error: ApiError) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: string;
  }>({
    show: false,
    type: "info",
    title: "",
    message: "",
    timestamp: new Date().toISOString(),
  });

  const showToast = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    setToast({
      show: true,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  const handleApiError = (error: ApiError) => {
    showToast("error", `Error ${error.errorStatus}`, error.errorMessage);
  };

  return (
    <ToastContext.Provider value={{ showToast, handleApiError }}>
      {children}
      <CustomToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        timestamp={toast.timestamp}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
