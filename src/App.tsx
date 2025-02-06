import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Header } from './components/Header';
import { Menu } from './pages/Menu';
import { OrderHistory } from './pages/OrderHistory';
import { OrderSummary } from './pages/OrderSummary';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerModal from './components/CustomerModal';
import { ApiError, CustomerInfo } from './types/api';
import { authService } from './services/api';
import { CustomToast } from './components/CustomToast';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    authUser();
  }, []);

  const authUser = async () => {
    try {
      const response = await authService.getUserInformation();
      console.log('authUser', response.data);
      
      setCustomerInfo(response.data);
      setLoading(false);
    } catch (error) {
      const apiError = error as ApiError;
      showToast('error', `Error ${apiError.errorStatus}`, apiError.errorMessage);
    }
  };
    
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setToast({
      show: true,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  if (loading) {
    return (
      <>
        <CustomerModal onHide={() => {
            setIsRegistered(true);
            setLoading(false);
          }}/>
        <LoadingSpinner centered />
      </>
    );
  }

  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route path="/" element={<Menu customerInfo={customerInfo} onGetCustomerInfo={authUser}/>} />
          <Route path="/menu" element={<Menu customerInfo={customerInfo} onGetCustomerInfo={authUser} />} />
          <Route path="/history" element={<OrderHistory customerInfo={customerInfo} onGetCustomerInfo={authUser} />} />
          <Route path="/summary" element={<OrderSummary customerInfo={customerInfo} onGetCustomerInfo={authUser} />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;