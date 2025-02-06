import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Alert, Container, Badge } from 'react-bootstrap';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CustomToast } from '../components/CustomToast';
import { MenuModal } from '../components/MenuModal';
import { menuService, orderService } from '../services/api';
import { MenuItem, CartItem, CustomerDetails, ApiError, CustomerInfo, OrderItem } from '../types/api';


interface MenuProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}

export const Menu: React.FC<MenuProps> = ({customerInfo, onGetCustomerInfo}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
    onGetCustomerInfo();
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuService.getMenu();
      setMenuItems(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      showToast('error', `Error ${apiError.errorStatus}`, apiError.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast('success', 'Added to Cart', `${item.name} has been added to your cart`);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = cart.find(item => item.id === itemId);
    if (itemToRemove) {
      setCart(prev => prev.filter(item => item.id !== itemId));
      showToast('info', 'Removed from Cart', `${itemToRemove.name} has been removed from your cart`);
    }
  };

  const clearCart = () => {
    setCart([]);
    showToast('info', 'Cart Cleared', 'All items have been removed from your cart');
  };

  const handlePlaceOrder = async (paymentType: string, paymentMethod: string) => {
    try {
      const order: OrderItem = {
        ...customerInfo,
        paymentMethod,
        paymentType,
        orderDetails: cart,
        status: 'pending'
        // total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
      await orderService.placeOrder(order);
      setCart([]);
      setShowModal(false);
      showToast('success', 'Order Placed', 'Your order has been successfully placed!');
    } catch (error) {
      const apiError = error as ApiError;
      showToast('error', `Error ${apiError.errorStatus}`, apiError.errorMessage);
      throw error;
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
    return <LoadingSpinner centered />;
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Menu</h1>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Row xs={1} md={2} lg={3} className="g-4">
            {menuItems.map(item => (
              <Col key={item.id}>
                <Card>
                  {item.imageUrl && <Card.Img variant="top" src={item.imageUrl} alt={item.name} />}
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge bg="primary">${item.price.toFixed(2)}</Badge>
                      <Button variant="outline-success" onClick={() => addToCart(item)}>
                        Add
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h2>Your Cart</h2>
            </Card.Header>
            <Card.Body>
              {cart.length === 0 ? (
                <Alert variant="info">Your cart is empty</Alert>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6>{item.name}</h6>
                        <small>${item.price.toFixed(2)} x {item.quantity}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Total:</h5>
                    <h5>${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</h5>
                  </div>
                  <div className="d-grid gap-2">
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                      Place Order
                    </Button>
                    <Button variant="outline-danger" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <MenuModal
        show={showModal}
        onHide={() => setShowModal(false)}
        customerInfo={customerInfo}
        cart={cart}
        total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        onSubmit={handlePlaceOrder}
      />

      <CustomToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        timestamp={toast.timestamp}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </Container>
  );
};