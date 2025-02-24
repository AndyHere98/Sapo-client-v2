import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Table,
  Card,
} from "react-bootstrap";
import { CustomerInfo, MenuItem, CartItem } from "../types/api";
import { menuService } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";
import { PlusCircle, MinusCircle, Trash2 } from "lucide-react";

interface MenuModalProps {
  show: boolean;
  onHide: () => void;
  customerInfo: CustomerInfo;
  cart: CartItem[];
  total: number;
  onSubmit: (orderData: object) => Promise<void>;
  showMenu?: boolean;
  onUpdateCart?: (cart: CartItem[]) => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  show,
  onHide,
  customerInfo: initialCustomerInfo,
  cart,
  total,
  onSubmit,
  showMenu = false,
  onUpdateCart,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState(initialCustomerInfo);
  const [orderExtraItem, setOrderExtraItem] = useState({
    paymentMethod: "MOMO",
    paymentType: "PREPAID",
    orderNote: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (showMenu) {
      fetchMenu();
    }
  }, [showMenu]);
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

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenu();
      setMenuItems(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showToast("error", `Error Fetching menu`, "Failed to load menu items");
      // setError("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (cart.length === 0) {
        setError("Please select at least one item");
        return;
      }

      const orderData = {
        ...customerInfo,
        ...orderExtraItem,
        orderDetails: cart,
        status: "pending",
      };

      await onSubmit(orderData);
      onHide();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (onUpdateCart) {
      const updatedCart = [...cart];
      const existingItem = updatedCart.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        updatedCart.push({ ...item, quantity: 1 });
      }
      onUpdateCart(updatedCart);
    }
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    if (onUpdateCart) {
      const updatedCart = cart
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      onUpdateCart(updatedCart);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (onUpdateCart) {
      const updatedCart = cart.filter((item) => item.id !== itemId);
      onUpdateCart(updatedCart);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" className="fade menu-modal">
      <Modal.Header closeButton>
        <Modal.Title>Tạo đơn hàng mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <LoadingSpinner centered />
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Customer Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Thông tin khách hàng</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên khách hàng</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        readOnly={
                          `${initialCustomerInfo.customerName}` ? true : false
                        }
                        value={customerInfo.customerName}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        readOnly={
                          `${initialCustomerInfo.customerPhone}` ? true : false
                        }
                        value={customerInfo.customerPhone}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customerPhone: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        required
                        type="email"
                        readOnly={
                          `${initialCustomerInfo.customerEmail}` ? true : false
                        }
                        value={customerInfo.customerEmail}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customerEmail: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Menu Items */}
            {showMenu && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Menu</h5>
                </Card.Header>
                <Card.Body>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {menuItems.map((item) => (
                      <Col key={item.id}>
                        <Card className="h-100 menu-item">
                          <Card.Body>
                            <h6>{item.name}</h6>
                            <p className="text-muted mb-2">
                              {item.price
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                              đ
                            </p>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                              disabled={item.available === 0}
                            >
                              <PlusCircle size={16} className="me-2" />
                              Thêm vào giỏ
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Cart */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Giỏ hàng</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Món ăn</th>
                      <th>Đơn giá</th>
                      <th style={{ width: "150px" }}>Số lượng</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          {item.price
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          đ
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                            >
                              <MinusCircle size={16} />
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                            >
                              <PlusCircle size={16} />
                            </Button>
                          </div>
                        </td>
                        <td>
                          {(item.price * item.quantity)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          đ
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {cart.length > 0 && (
                      <tr>
                        <td colSpan={3} className="text-end">
                          <strong>Tổng cộng:</strong>
                        </td>
                        <td colSpan={2}>
                          <strong>
                            {total
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                            đ
                          </strong>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Order Extra Information */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">Thông tin thanh toán</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Loại hình thanh toán</Form.Label>
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
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hình thức thanh toán</Form.Label>
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
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={orderExtraItem.orderNote}
                    onChange={(e) =>
                      setOrderExtraItem((prev) => ({
                        ...prev,
                        orderNote: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || cart.length === 0}
        >
          {loading ? "Đang xử lý..." : "Tạo đơn hàng"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
