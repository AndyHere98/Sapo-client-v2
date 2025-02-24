import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Table,
  Badge,
  Alert,
  Card,
} from "react-bootstrap";
import { format } from "date-fns";
import { MenuItem, OrderItem, CustomerInfo } from "../types/api";
import { LoadingSpinner } from "./LoadingSpinner";
import { menuService } from "../services/api";
import { config } from "../config/config";

interface OrderModalProps {
  show: boolean;
  onHide: () => void;
  order?: OrderItem;
  isEditable?: boolean;
  onSubmit: (orderData: OrderItem) => Promise<void>;
  title?: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  show,
  onHide,
  order,
  isEditable = false,
  onSubmit,
  title = "Order Details",
}) => {
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState(order?.orderDetails || []);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: order?.customerName || "",
    customerEmail: order?.customerEmail || "",
    customerPhone: order?.customerPhone || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [orderExtraItem, setOrderExtraItem] = useState({
    paymentMethod: order?.paymentMethod,
    paymentType: order?.paymentType,
    orderNote: order?.note,
  });

  useEffect(() => {
    if (isEditable) {
      fetchMenu();
    }
  }, [isEditable]);

  useEffect(() => {
    if (order) {
      setCart(order.orderDetails);
      setCustomerInfo({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
      });
    }
  }, [order]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenu();

      if (!response.data) {
        isEditable = false;
      }
      setMenuItems(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSuccess(`Added ${item.name} to cart`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (cart.length === 0) {
        setError(
          "Hãy chọn ít nhất 1 món, hoặc bạn có thể xoá đơn ngoài màn hình lịch sử đơn hàng."
        );
        return;
      }

      const orderData: OrderItem = {
        ...customerInfo,
        orderDetails: cart,
        paymentMethod: orderExtraItem.paymentMethod || "",
        paymentType: orderExtraItem.paymentType || "",
        status: "P",
        note: orderExtraItem.orderNote,
        createdAt: 0,
      };

      await onSubmit(orderData);
      setSuccess("Cập nhật đơn hàng thành công");
      setTimeout(() => {
        setSuccess(null);
        onHide();
      }, 1500);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Cập nhật đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const mealTitleColors = [
    "#FF5733", // Reddish for spicy meals
    "#FFD700", // Golden for rich and savory meals
    "#4CAF50", // Green for healthy or vegetarian meals
    "#3498DB", // Blue for seafood dishes
    "#E67E22", // Orange for breakfast or warm meals
    "#9B59B6", // Purple for exotic or special meals
    "#E74C3C", // Red for meat-based meals
    "#2ECC71", // Bright green for fresh salads
    "#F39C12", // Yellow-orange for cheesy or comfort foods
    "#D35400", // Dark orange for grilled meals
  ];
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      className="fade order-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-0 bg-info">
        <Modal.Title className="h5 ">
          {title}
          {isEditable && (
            <Badge bg="warning" className="ms-2">
              Editable
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        {loading ? (
          <LoadingSpinner centered />
        ) : (
          <div className="modal-content-wrapper p-3">
            {(error || success) && (
              <Alert variant={error ? "danger" : "success"} className="mb-4">
                {error || success}
              </Alert>
            )}

            <Row className="mb-4">
              <Col md={6}>
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
                  </dl>
                </div>
              </Col>
              <Col md={6}>
                <div className="customer-info p-3 bg-light rounded">
                  <h5 className="mb-3">Thông tin đơn</h5>
                  <hr />
                  <dl className="row mb-0">
                    <dt className="col-sm-5">Trạng thái đơn:</dt>
                    <dd className="col-sm-7">
                      <Badge
                        bg={
                          order?.status === "S"
                            ? "success"
                            : order?.status === "C"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {order?.status === "S"
                          ? "Hoàn tất"
                          : order?.status === "C"
                          ? "Đã huỷ"
                          : "Đang xử lý"}
                      </Badge>
                    </dd>

                    {order?.createdAt && (
                      <>
                        <dt className="col-sm-5">Ngày đặt đơn:</dt>
                        <dd className="col-sm-7">
                          {format(
                            new Date(order.createdAt),
                            "HH : mm : ss ' (' MMM d, yyyy' )'"
                          )}
                        </dd>
                      </>
                    )}

                    <dt className="col-sm-5">Tổng món:</dt>
                    <dd className="col-sm-7">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </dd>

                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <strong>Loại hình thanh toán:</strong>
                        </Form.Label>
                        <Form.Select
                          disabled={!isEditable}
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
                          disabled={!isEditable}
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
                          disabled={!isEditable}
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
            </Row>

            {isEditable && (
              <div className="menu-section mb-4">
                <h6 className="mb-3">Menu hôm nay</h6>

                {menuItems.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    <h5>Thông tin Menu</h5>
                    <p className="mb-0">
                      Dữ liệu menu hiện tại chưa có, hãy liên hệ admin để biết
                      thêm chi tiết
                    </p>
                  </Alert>
                ) : (
                  <Row xs={1} md={2} lg={3} className="g-3">
                    {menuItems.map((item) => (
                      <Col key={item.id}>
                        <div className="menu-item-card">
                          <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
                            <div>
                              <h6 className="mb-1">{item.name}</h6>
                              <small className="text-muted">
                                {item.price
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                {" đ/món"}
                              </small>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                              disabled={item.available === 0}
                            >
                              Thêm
                            </Button>
                          </div>
                          {item.description && (
                            <small className="text-muted d-block">
                              {item.description}
                            </small>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )}

            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h5 mb-0">Chi tiết đơn</h2>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Món ăn</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            {isEditable ? (
                              <div className="quantity-controls d-flex align-items-center">
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                >
                                  −
                                </Button>
                                <span className="mx-3">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </Button>
                              </div>
                            ) : (
                              item.quantity
                            )}
                          </td>
                          <td>
                            {item.price
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            {" đ/món"}
                          </td>
                          <td>
                            {(item.price * item.quantity)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            {` ${config.currency}`}
                          </td>
                        </tr>
                      ))}
                      <tr className="table-light justify-content-between align-items-center">
                        <td
                          colSpan={3}
                          style={{ padding: "0.5rem" }}
                          className="text-end mh-100"
                        >
                          <div className="mw-100 d-flex align-items-center justify-content-end">
                            <h4>
                              <strong>Tổng:</strong>
                            </h4>
                          </div>
                        </td>
                        <td>
                          <Badge
                            bg="primary"
                            style={{ padding: "0.5rem" }}
                            className="mw-100 d-flex align-items-center justify-content-between"
                          >
                            <div className="h5">
                              {cart
                                .reduce(
                                  (sum, item) =>
                                    sum + item.price * item.quantity,
                                  0
                                )
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              {` ${config.currency}`}
                            </div>
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Đóng
        </Button>
        {isEditable && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
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
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: all 0.2s ease-in-out;
          }

          .menu-item-card:hover {
            transform: translateY(-2px);
            color: white;
            background-color: ${
              mealTitleColors[
                Math.floor(Math.random() * mealTitleColors.length)
              ]
            };
            box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
          }

          .menu-item-card-header {
            background-color: #3498db;
            color: white;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
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
