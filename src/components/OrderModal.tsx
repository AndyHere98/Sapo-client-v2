import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, Badge, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import { MenuItem, OrderItem, CustomerDetails } from '../types/api';
import { LoadingSpinner } from './LoadingSpinner';
import { menuService } from '../services/api';

interface OrderModalProps {
  show: boolean;
  onHide: () => void;
  order?: OrderItem;
  isEditable?: boolean;
  onSubmit: (orderData: any) => Promise<void>;
  title?: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  show,
  onHide,
  order,
  isEditable = false,
  onSubmit,
  title = 'Order Details'
}) => {
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState(order?.orderDetails || []);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: order?.customerName || '',
    email: order?.customerEmail || '',
    phone: order?.customerPhone || '',
    paymentType: 'CASH',
    paymentMethod: 'POSTPAID',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditable) {
      fetchMenu();
    }
  }, [isEditable]);

  useEffect(() => {
    if (order) {
      setCart(order.orderDetails);
      setCustomerDetails({
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        paymentType: 'CASH',
        paymentMethod: order.paymentMethod as 'POSTPAID' | 'PREPAID',
      });
    }
  }, [order]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenu();
      setMenuItems(response.data);
    } catch (error) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSuccess(`Added ${item.name} to cart`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (cart.length === 0) {
        setError('Please add at least one item to the order');
        return;
      }

      const orderData = {
        customerDetails,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };

      await onSubmit(orderData);
      setSuccess('Order updated successfully');
      setTimeout(() => {
        setSuccess(null);
        onHide();
      }, 1500);
    } catch (err) {
      setError('Failed to update order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      className="fade order-modal content-fit"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5">
          {title}
          {isEditable && (
            <Badge bg="warning" className="ms-2">Editable</Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        {loading ? (
          <LoadingSpinner centered />
        ) : (
          <div className="modal-content-wrapper">
            {(error || success) && (
              <Alert variant={error ? 'danger' : 'success'} className="mb-4">
                {error || success}
              </Alert>
            )}

            <Row className="mb-4">
              <Col md={6}>
                <div className="customer-info p-3 bg-light rounded">
                  <h6 className="mb-3">Customer Information</h6>
                  <dl className="row mb-0">
                    <dt className="col-sm-3">Name:</dt>
                    <dd className="col-sm-9">{customerDetails.name}</dd>
                    
                    <dt className="col-sm-3">Email:</dt>
                    <dd className="col-sm-9">{customerDetails.email}</dd>
                    
                    <dt className="col-sm-3">Phone:</dt>
                    <dd className="col-sm-9">{customerDetails.phone}</dd>
                    
                    <dt className="col-sm-3">Payment:</dt>
                    <dd className="col-sm-9">{customerDetails.paymentMethod === 'POSTPAID' ? 'Pay on Delivery' : 'Pay Now'}</dd>
                  </dl>
                </div>
              </Col>
              <Col md={6}>
                <h6 className="mb-3">Order Summary</h6>
                <div className="order-summary">
                  <div className="mb-3">
                    <strong>Order Status:</strong>{' '}
                    <Badge bg={
                      order?.status === 'completed' ? 'success' :
                      order?.status === 'cancelled' ? 'danger' : 'warning'
                    }>
                      {order?.status || 'New Order'}
                    </Badge>
                  </div>
                  {order?.createdAt && (
                    <div className="mb-3">
                      <strong>Order Date:</strong>{' '}
                      {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
                    </div>
                  )}
                  <div>
                    <strong>Total Items:</strong>{' '}
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                </div>
              </Col>
            </Row>

            {isEditable && (
              <div className="menu-section mb-4">
                <h6 className="mb-3">Available Menu Items</h6>
                <Row xs={1} md={2} lg={3} className="g-3">
                  {menuItems.map(item => (
                    <Col key={item.id}>
                      <div className="menu-item-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">{item.name}</h6>
                            <small className="text-muted">${item.price.toFixed(2)}</small>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            disabled={item.available === 0}
                          >
                            Add
                          </Button>
                        </div>
                        {item.description && (
                          <small className="text-muted d-block">{item.description}</small>
                        )}
                        <small className="text-muted d-block mt-1">
                          {item.available} available
                        </small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <div className="cart-section">
              <h6 className="mb-3">Order Items</h6>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        {isEditable ? (
                          <div className="quantity-controls d-flex align-items-center">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </Button>
                            <span className="mx-3">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="table-light">
                    <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                    <td>
                      <strong>
                        ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        {isEditable && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Updating...' : 'Update Order'}
          </Button>
        )}
      </Modal.Footer>

      <style>
        {`
          .order-modal .modal-content {
            border-radius: 1rem;
            border: none;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }

          .order-modal .modal-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .order-modal .modal-footer {
            padding: 1rem 1.5rem 1.5rem;
          }

          .menu-item-card {
            padding: 1rem;
            border: 1px solid #dee2e6;
            border-radius: 0.5rem;
            transition: all 0.2s ease-in-out;
          }

          .menu-item-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
          }

          .quantity-controls {
            width: fit-content;
          }

          .quantity-controls button {
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .order-summary {
            padding: 1rem;
            background-color: #f8f9fa;
            border-radius: 0.5rem;
          }

          .modal-content-wrapper {
            max-height: calc(100vh - 200px);
            overflow-y: auto;
            padding-right: 0.5rem;
          }

          .modal-content-wrapper::-webkit-scrollbar {
            width: 6px;
          }

          .modal-content-wrapper::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }

          .modal-content-wrapper::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }

          .modal-content-wrapper::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          .customer-info {
            border: 1px solid #dee2e6;
          }

          .customer-info dl {
            margin-bottom: 0;
          }

          .customer-info dt {
            font-weight: 600;
            color: #495057;
          }

          .customer-info dd {
            margin-bottom: 0.5rem;
          }

          .customer-info dd:last-child {
            margin-bottom: 0;
          }

          @media (max-width: 768px) {
            .order-modal .modal-body {
              padding: 1rem;
            }
          }
        `}
      </style>
    </Modal>
  );
};