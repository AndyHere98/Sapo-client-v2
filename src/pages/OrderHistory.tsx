import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Pagination,
  Container,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { format, parse, isBefore } from "date-fns";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CustomToast } from "../components/CustomToast";
import { OrderModal } from "../components/OrderModal";
import { orderService } from "../services/api";
import { OrderItem, ApiError, CustomerInfo } from "../types/api";
import { config } from "../config/config";
import DeleteOrderModal from "../components/DeleteOrderModal";

interface OrderHistoryProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  customerInfo,
  onGetCustomerInfo,
}) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [showOrderUpdateModal, setShowOrderUpdateModal] = useState(false);
  const [showOrderDeleteModal, setShowOrderDeleteModal] = useState(false);

  const [orderId, setOrderId] = useState("");

  const [searchParams, setSearchParams] = useState({
    customerName: "",
    fromDate: format(new Date(), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });
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
    fetchOrders();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    onGetCustomerInfo();
  }, [selectedOrder, loading]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders(searchParams);
      setOrders(response.data);
      setPagination((prev) => ({
        ...prev,
        totalItems: response.data.length,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      showToast(
        "error",
        `Error ${apiError.errorStatus}`,
        apiError.errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const isBeforeCutoff = (orderDate: string) => {
    const orderDateTime = new Date(orderDate);
    const cutoffTime = parse(config.orderCutoffTime, "HH:mm", orderDateTime);
    return isBefore(orderDateTime, cutoffTime);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setLoading(true);
    fetchOrders();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleOrderUpdate = async (orderData: any) => {
    if (!selectedOrder) return;

    try {
      await orderService.updateOrder(selectedOrder.id!, orderData);
      showToast(
        "success",
        "Order Updated",
        "Order has been successfully updated"
      );
      fetchOrders();
      setShowOrderUpdateModal(false);
    } catch (error) {
      const apiError = error as ApiError;
      showToast(
        "error",
        `Error ${apiError.errorStatus}`,
        apiError.errorMessage
      );
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

  const paginatedOrders = orders
    .filter((order) => order.id?.includes(orderId))
    .slice(
      (pagination.currentPage - 1) * pagination.itemsPerPage,
      pagination.currentPage * pagination.itemsPerPage
    );

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  const toggleUppdateOrderModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setShowOrderUpdateModal(true);
  };

  const toggleDeleteOrderModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setShowOrderDeleteModal(true);
  };

  const handleDeleteOrder = async (order: OrderItem | null) => {
    if (!order || !order.id) return;

    try {
      await orderService.deleteOrder(order.id);
      showToast(
        "success",
        "Order Delete",
        "Order has been successfully deleted!"
      );
      fetchOrders();
    } catch (error) {
      const apiError = error as ApiError;
      showToast(
        "error",
        `Error ${apiError.errorStatus}`,
        apiError.errorMessage
      );
    } finally {
      setShowOrderDeleteModal(false);
    }
  };

  const handleFindOrder = (id: string) => {
    setOrderId(id);
  };

  if (loading) {
    return <LoadingSpinner centered />;
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex align-items-center bg-info text-white">
          <h3>Tìm kiếm đơn hàng</h3>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tên khách hàng</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerInfo.customerName}
                    readOnly
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Từ ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={searchParams.fromDate}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Đến ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={searchParams.toDate}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="submit"
                  variant="info"
                  className="w-100 text-white"
                >
                  Tìm kiếm
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <InputGroup className="mb-3 me-4">
        <InputGroup.Text id="basic-addon1" className="bg-info text-white">
          <strong>Mã đơn</strong>
        </InputGroup.Text>
        <Form.Control
          placeholder="Nhập mã đơn hàng cần tìm..."
          value={orderId}
          onChange={(e) => handleFindOrder(e.target.value.toUpperCase())}
        />
      </InputGroup>
      {orders.filter((order) => order.id?.includes(orderId)).length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>Không có đơn nào</h5>
          <p className="mb-0">
            Không tìm thấy đơn, hãy thử lại với điều kiện tìm kiếm phù hợp.
          </p>
        </Alert>
      ) : (
        <>
          <div className="mb-3 d-flex justify-content-between align-items-end">
            <h4 className="mb-0">Lịch sử đơn hàng</h4>
            <div className="d-flex align-items-end">
              <span className="me-2">Hiển thị:</span>
              <Form.Select
                style={{ width: "auto" }}
                value={pagination.itemsPerPage}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    itemsPerPage: parseInt(e.target.value),
                    currentPage: 1,
                  }))
                }
              >
                <option value="10">10 đơn/trang</option>
                <option value="25">25 đơn/trang</option>
                <option value="50">50 đơn/trang</option>
              </Form.Select>
            </div>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {paginatedOrders.map((order) => {
              const isEditable = isBeforeCutoff(order.createdAt || "");
              return (
                <Col key={order.id}>
                  <Card
                    className={`h-100 shadow-sm order-card ${
                      isEditable ? "editable" : "completed"
                    }`}
                    onDoubleClick={() => toggleUppdateOrderModal(order)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="mb-1">Đơn hàng: {order.id}</h5>
                          <p className="text-muted mb-0">
                            {format(
                              new Date(order.createdAt || ""),
                              "MMM d, yyyy HH:mm"
                            )}
                          </p>
                          <hr />
                        </div>
                        {isEditable && <Badge bg="warning">Editable</Badge>}
                      </div>
                      <div className="mb-3">
                        <strong>Khách hàng:</strong>
                        <p className="mb-1">{order.customerName}</p>
                        {/* <small className="text-muted">
                          {order.customerEmail}
                        </small> */}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge
                          bg={
                            order.status === "completed"
                              ? "success"
                              : order.status === "cancelled"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {order.status}
                        </Badge>
                        <strong>
                          {" Tổng: "}
                          {(order.totalPrice || 0)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          {` ${config.currency}`}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-end align-items-center">
                        {isEditable && (
                          <Button
                            variant="danger"
                            onClick={() => toggleDeleteOrderModal(order)}
                          >
                            {loading ? "Đang huỷ đơn..." : "Huỷ đơn hàng"}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              />
              {[...Array(totalPages)].map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === pagination.currentPage}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={pagination.currentPage === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}

      {selectedOrder && (
        <OrderModal
          show={showOrderUpdateModal}
          onHide={() => {
            setShowOrderUpdateModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          isEditable={isBeforeCutoff(selectedOrder.createdAt || "")}
          onSubmit={handleOrderUpdate}
          title={`Mã đơn hàng: ${selectedOrder.id}`}
        />
      )}

      <CustomToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        timestamp={toast.timestamp}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Confirmation Modal */}
      <DeleteOrderModal
        show={showOrderDeleteModal}
        order={selectedOrder}
        handleClose={() => setShowOrderDeleteModal(false)}
        handleDelete={() => handleDeleteOrder(selectedOrder)}
      />

      <style>
        {`
          .order-card {
            cursor: pointer;
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .order-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
          .order-card.editable {
            border-left: 4px solid var(--bs-warning);
          }
          .order-card.completed {
            border-left: 4px solid var(--bs-success);
          }
        `}
      </style>
    </Container>
  );
};
