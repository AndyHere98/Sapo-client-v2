import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ApiError, CustomerInfo } from "./types/api";
import { authService } from "./services/api";
import { CustomerRegisterPage } from "./pages/CustomerRegisterPage";
import { SplashScreen } from "./components/SplashScreen";
import { AppRoutes } from "./routes";
import { AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });
  const [, setLoading] = useState(true);
  const [showCustomerRegisterPage, setShowCustomerRegisterPage] =
    useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [, setToast] = useState<{
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

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    authUser();
  }, []);

  const authUser = async () => {
    try {
      const response = await authService.getUserInformation();
      setShowCustomerRegisterPage(false);
      setCustomerInfo(response.data);
      setLoading(false);
    } catch (error) {
      const apiError = error as ApiError;
      showToast(
        "error",
        `Error ${apiError.errorStatus}`,
        apiError.errorMessage
      );
      setShowCustomerRegisterPage(true);
    }
  };

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

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      {showCustomerRegisterPage ? (
        <CustomerRegisterPage
          onHide={() => setShowCustomerRegisterPage(false)}
        />
      ) : (
        <BrowserRouter>
          <AppRoutes customerInfo={customerInfo} onGetCustomerInfo={authUser} />
        </BrowserRouter>
      )}
    </AnimatePresence>
  );
}

export default App;
