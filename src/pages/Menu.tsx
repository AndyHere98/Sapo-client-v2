import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Alert,
  Container,
  Badge,
  Nav,
  Navbar,
} from "react-bootstrap";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CustomToast } from "../components/CustomToast";
import { MenuModal } from "../components/MenuModal";
import { menuService, orderService } from "../services/api";
import {
  MenuItem,
  CartItem,
  ApiError,
  CustomerInfo,
  OrderItem,
} from "../types/api";
import { config } from "../config/config";
import { isBefore, parse } from "date-fns";
import { Cart, CartCheck } from "react-bootstrap-icons";

interface MenuProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}

export const Menu: React.FC<MenuProps> = ({
  customerInfo,
  onGetCustomerInfo,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
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

  useEffect(() => {
    onGetCustomerInfo();
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuService.getMenu();
      if (!response.data) {
        showToast("warning", "Thông tin menu", "Dữ liệu menu đang trống");
      }
      setMenuItems(response.data);
    } catch (error) {
      const apiError = error.errorData as ApiError;
      showToast("error", `Lỗi lấy thông tin menu`, apiError.errorMessage);
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

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(
      "success",
      "Added to Cart",
      `${item.name} has been added to your cart`
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = cart.find((item) => item.id === itemId);
    if (itemToRemove) {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
      showToast(
        "info",
        "Removed from Cart",
        `${itemToRemove.name} has been removed from your cart`
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    showToast(
      "info",
      "Cart Cleared",
      "All items have been removed from your cart"
    );
  };

  const handlePlaceOrder = async (orderExtraItem: object) => {
    try {
      console.log("orderExtraItem", orderExtraItem);

      const order: OrderItem = {
        ...customerInfo,
        paymentMethod: orderExtraItem.paymentMethod,
        paymentType: orderExtraItem.paymentType,
        note: orderExtraItem.orderNote,
        orderDetails: cart,
        status: "pending",
        // total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
      await orderService.placeOrder(order);
      setCart([]);
      setShowModal(false);
      showToast(
        "success",
        "Order Placed",
        "Your order has been successfully placed!"
      );
    } catch (error) {
      const apiError = error as ApiError;
      showToast(
        "error",
        `Error ${apiError.errorStatus}`,
        apiError.errorMessage
      );
      throw error;
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

  const isBeforeCutoff = () => {
    const orderDateTime = new Date();
    const cutoffTime = parse(config.orderCutoffTime, "HH:mm", orderDateTime);
    return isBefore(orderDateTime, cutoffTime);
  };

  const togglePlaceOrderModal = () => {
    if (isBeforeCutoff()) {
      setShowModal(true);
    } else {
      showToast(
        "warning",
        "Lên đơn hàng",
        `Không thể lên đơn sau thời gian ${config.orderCutoffTime}`
      );
    }
  };
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  if (loading) {
    return <LoadingSpinner centered />;
  }

  return (
    <Container fluid className="py-4">
      {menuItems.length === 0 ? (
        <>
          <Alert variant="info" className="text-center">
            <h5>Thông tin Menu</h5>
            <p className="mb-0">Chưa có món ăn mới. Xin hãy đợi!</p>
          </Alert>
        </>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1>Menu</h1>
            </Col>
          </Row>
          <Row>
            <Col md={8}>
              <Row xs={1} md={2} lg={3} className="g-4">
                {menuItems.map((item) => (
                  <Col key={item.id}>
                    <Card
                      className={`menu-card shadow-sm h-100`}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {item.imageUrl && (
                        <Card.Img
                          variant="top"
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      )}
                      <Card.Header
                        className={`hover-header ${
                          isHovered ? "expanded" : ""
                        }`}
                      >
                        <Card.Title>{item.name}</Card.Title>
                      </Card.Header>
                      <Card.Body
                        style={{ backgroundColor: "#fff", color: "black" }}
                        className="d-flex flex-column justify-content-end content-fit"
                      >
                        {/* <br/>s */}
                        <Card.Text
                          className={`justify-content-between d-flex card-text ${
                            isHovered ? "show-full" : ""
                          }`}
                        >
                          <span>Giá món:</span>{" "}
                          <Badge
                            bg="primary"
                            style={{ padding: "0.5rem" }}
                            className="mw-100 d-flex align-items-center justify-content-between"
                          >
                            <div>
                              {item.price
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              {" đ/món"}
                            </div>
                          </Badge>
                        </Card.Text>
                        <div className="d-flex justify-content-end align-items-center">
                          <Button
                            variant="outline-success"
                            onClick={() => addToCart(item)}
                            className="d-flex align-items-center justify-content-center w-100"
                          >
                            <Cart className="me-2" />
                            Thêm
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
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h2>Giỏ hàng</h2>
                  <CartCheck size={26} className="me-2" />
                </Card.Header>
                <Card.Body>
                  {cart.length === 0 ? (
                    <Alert variant="info">Giỏ hàng đang trống</Alert>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="d-flex justify-content-between align-items-center mb-3"
                        >
                          <div>
                            <h6>{item.name}</h6>
                            <small>
                              {item.price
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              {" đ/món "}x {item.quantity}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="ms-2"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Xoá
                            </Button>
                          </div>
                        </div>
                      ))}
                      <hr />
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Tổng:</h5>
                        <h5>
                          {cart
                            .reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          {` ${config.currency}`}
                        </h5>
                      </div>
                      <div className="d-grid gap-2">
                        <Button
                          variant="primary"
                          onClick={togglePlaceOrderModal}
                        >
                          Lên đơn
                        </Button>
                        <Button variant="outline-danger" onClick={clearCart}>
                          Clear
                        </Button>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

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
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <style>
        {`
          .menu-card {
            cursor: pointer;
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .hover-header {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 10px;
            transition: max-height 0.3s ease-in-out, white-space 0.3s ease-in-out;
          }

          .hover-header.expanded {
            white-space: normal;
            text-overflow: unset;
            max-height: 100px; /* Expands smoothly */
          }

          .menu-card:hover {
            transform: translateY(-5px);
            background-color: ${
              mealTitleColors[
                Math.floor(Math.random() * mealTitleColors.length)
              ]
            };
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
        `}
      </style>
    </Container>
  );
};
