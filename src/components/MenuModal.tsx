import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Alert, Badge } from "react-bootstrap";
import { CustomerDetails, CustomerInfo } from "../types/api";
import { config } from "../config/config";

interface MenuModalProps {
  show: boolean;
  onHide: () => void;
  customerInfo: CustomerInfo;
  cart: any[];
  total: number;
  onSubmit: (orderExtraItem: object) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  const [orderExtraItem, setOrderExtraItem] = useState({
    paymentMethod: "MOMO",
    paymentType: "PREPAID",
    orderNote: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit(orderExtraItem);
      onHide();
    } catch (err) {
      setError("Failed to place order. Please try again.");
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
        <Modal.Title className="h1">Hoàn tất đơn hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        <div className="modal-content-wrapper p-3">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Row>
            <Col md={7}>
              <div className="customer-info p-3 bg-light rounded">
                <h5 className="mb-3">Thông tin khách hàng</h5>
                <hr />
                <dl className="row mb-0">
                  <dt className="col-sm-5">Tên:</dt>
                  <dd className="col-sm-7">{customerInfo.customerName}</dd>

                  <dt className="col-sm-5">Email:</dt>
                  <dd className="col-sm-7">{customerInfo.customerEmail}</dd>

                  <dt className="col-sm-5">Số điện thoại:</dt>
                  <dd className="col-sm-7">{customerInfo.customerPhone}</dd>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Loại hình thanh toán:</strong>
                      </Form.Label>
                      <Form.Select
                        value={orderExtraItem.paymentType}
                        onChange={(e) =>
                          setOrderExtraItem((prev) => ({
                            ...prev,
                            paymentType: e.target.value as
                              | "PREPAID"
                              | "POSTPAID",
                          }))
                        }
                      >
                        <option value="PREPAID">Trả trước</option>
                        <option value="POSTPAID">Trả sau</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Hình thức thanh toán: </strong>
                      </Form.Label>
                      <Form.Select
                        value={orderExtraItem.paymentMethod}
                        onChange={(e) =>
                          setOrderExtraItem((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value as
                              | "CASH"
                              | "MOMO"
                              | "BANK",
                          }))
                        }
                      >
                        <option value="MOMO">Momo</option>
                        <option value="CASH">Tiền mặt</option>
                        <option value="BANK">Chuyển khoản ngân hàng</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Ghi chú:</strong>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Ghi chú..."
                        value={orderExtraItem.orderNote}
                        onChange={(e) => {
                          setOrderExtraItem((prev) => ({
                            ...prev,
                            orderNote: e.target.value,
                          }));
                        }}
                      />
                    </Form.Group>
                  </Form>
                </dl>
              </div>
            </Col>
            <Col lg={5}>
              <div className="order-summary p-3">
                <h5 className="mb-3">Đơn hàng</h5>
                <hr />
                <div className="order-items">
                  {cart.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="d-flex justify-content-between mb-2">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted">
                        <small>
                          <strong>
                            {item.price
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </strong>
                          {" đ"}
                          {"/món"}
                        </small>
                        <Badge>
                          {(item.price * item.quantity)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          {config.currency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Tổng đơn</strong>
                  <h5 className="mb-0">
                    {total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                    {config.currency}
                  </h5>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang đặt đơn..." : "Đặt đơn"}
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
