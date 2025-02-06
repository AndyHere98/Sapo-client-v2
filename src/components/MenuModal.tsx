import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { CustomerDetails, CustomerInfo } from '../types/api';
import { config } from '../config/config';

interface MenuModalProps {
  show: boolean;
  onHide: () => void;
  customerInfo: CustomerInfo;
  cart: any[];
  total: number;
  onSubmit: (paymentType: string, paymentMethod: string) => Promise<void>;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  show,
  onHide,
  customerInfo,
  cart,
  total,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  // const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
  //   name: '',
  //   email: '',
  //   phone: '',
  //   paymentType: 'CASH',
  //   paymentMethod: 'POSTPAID',
  // });
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'POSTPAID'>('PREPAID');
  const [paymentType, setPaymentType] = useState<'CASH' | 'MOMO' | 'BANK'>('MOMO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit(paymentType, paymentMethod);
      onHide();
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      className="fade menu-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5">Complete Your Order</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        <div className="modal-content-wrapper">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Row>
            <Col lg={7}>
              <Form onSubmit={handleSubmit}>
                <h6 className="mb-3">Customer Information</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={customerInfo.customerName}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={customerInfo.customerEmail}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    required
                    value={customerInfo.customerPhone}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Type</Form.Label>
                  <Form.Select
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value as 'CASH' | 'MOMO' | 'BANK')}
                  >
                    <option value="MOMO">Momo</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as 'PREPAID' | 'POSTPAID')}
                  >
                    <option value="POSTPAID">Pay on Delivery</option>
                    <option value="PREPAID">Pay Now</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Col>
            <Col lg={5}>
              <div className="order-summary">
                <h6 className="mb-3">Order Summary</h6>
                <div className="order-items">
                  {cart.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="d-flex justify-content-between mb-2">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted">
                        <small>{config.currency} {item.price.toFixed(2)} each</small>
                        <small>{config.currency} {(item.price * item.quantity).toFixed(2)}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Total Amount</strong>
                  <h5 className="mb-0">{config.currency} {total.toFixed(2)}</h5>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </Modal.Footer>

      <style>
        {`
          .menu-modal .modal-content {
            border-radius: 1rem;
            border: none;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }

          .menu-modal .modal-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .menu-modal .modal-footer {
            padding: 1rem 1.5rem 1.5rem;
          }

          .order-summary {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 0.5rem;
            height: 100%;
          }

          .order-items {
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 1rem;
          }

          .order-item {
            padding: 0.75rem;
            background: white;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .order-item:last-child {
            margin-bottom: 0;
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

          @media (max-width: 992px) {
            .order-summary {
              margin-top: 2rem;
            }
          }
        `}
      </style>
    </Modal>
  );
};