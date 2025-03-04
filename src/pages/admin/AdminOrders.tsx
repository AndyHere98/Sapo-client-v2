import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Form,
  Pagination,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { adminService, orderService } from "../../services/api";
import { AdminOrderSummary, CartItem, OrderItem } from "../../types/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { MenuModal } from "../../components/MenuModal";
import { OrderModal } from "../../components/OrderModal";
import {
  PlusCircle,
  Edit2,
  Trash2,
  LayoutDashboard,
  DollarSign,
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { EmptyState } from "../../components/EmptyState";
import { parse, isBefore } from "date-fns";
import { config } from "../../config/config";
import {
  MdOutlineCancel,
  MdOutlinePaid,
  MdOutlinePendingActions,
  MdPaid,
} from "react-icons/md";
import { AiOutlineFileDone } from "react-icons/ai";
import { BsFillBagCheckFill } from "react-icons/bs";
import CustomInformationModal from "../../components/CustomInformationModal";

// type TimeRange = "week" | "month" | "year";

export const AdminOrders: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmPaidModal, setShowConfirmPaidModal] = useState(false);
  const [showCompleteOrderModal, setShowCompleteOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [orderTimeRange, setOrderTimeRange] = useState("month");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { showToast, handleApiError } = useToast();

  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customModal, setCustomModal] = useState({
    title: "",
    titleBg: "",
    information: "",
    action: "",
  });

  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
  });

  useEffect(() => {
    fetchOrderSummary();
  }, []);

  // useEffect(() => {
  //     fetchOrderSummary();
  //   }, [pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    handleShowCustomModal();
  }, [
    showCompleteOrderModal === true,
    showConfirmPaidModal === true,
    showDeleteModal === true,
  ]);

  const handleShowCustomModal = () => {
    if (!showCompleteOrderModal && !showConfirmPaidModal && !showDeleteModal)
      return;
    if (showCompleteOrderModal) {
      setCustomModal(() => ({
        title: "Hoàn tất đơn hàng",
        titleBg: "success",
        action: "Hoàn tất",
        information: `Xác nhận đơn hàng ${selectedOrder?.id} đã hoàn tất?`,
      }));
    } else if (showConfirmPaidModal) {
      setCustomModal(() => ({
        title: "Xác nhận thanh toán",
        titleBg: "success",
        action: "Hoàn tất",
        information: `Xác nhận đơn hàng ${selectedOrder?.id} đã thanh toán?`,
      }));
    } else if (showDeleteModal) {
      setCustomModal(() => ({
        title: "Huỷ đơn hàng",
        titleBg: "danger",
        action: "Xác nhận huỷ",
        information: `Đơn hàng ${selectedOrder?.id} sẽ được huỷ, bạn chắc chứ?`,
      }));
    }
    setShowCustomModal(true);
  };

  const handleCustomModalAction = async () => {
    if (!selectedOrder?.id) return;
    if (showCompleteOrderModal) {
      try {
        await adminService.completeOrder(selectedOrder.id);
        showToast("success", "Xác nhận đơn hàng", "Đơn hàng đã hoàn tất");
        setShowCompleteOrderModal(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        handleApiError(error);
      }
    } else if (showConfirmPaidModal) {
      try {
        await adminService.confirmPaymentOrder(selectedOrder.id);
        showToast("success", "Xác nhận đơn hàng", "Đơn hàng đã thanh toán");
        setShowConfirmPaidModal(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        handleApiError(error);
      }
    } else if (showDeleteModal) {
      try {
        await orderService.cancelOrder(selectedOrder.id);
        showToast("success", "Xác nhận đơn hàng", "Đơn hàng đã huỷ thành công");
        setShowDeleteModal(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        handleApiError(error);
      }
    }
    setCustomModal(() => ({
      title: "",
      titleBg: "",
      information: "",
      action: "",
    }));
    fetchOrderSummary();
    setShowCustomModal(false);
  };

  const fetchOrderSummary = async () => {
    try {
      const response = await adminService.getAdminOrderSummary();
      setSummary(response.data);
      setRecentOrders(response.data.recentOrders);
      setPagination((prev) => ({
        ...prev,
        totalItems: response.data.recentOrders.length,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const paginatedOrders = recentOrders
    .filter((order) =>
      orderStatusFilter ? order.status === orderStatusFilter : order
    )
    .sort((a: OrderItem, b: OrderItem) => b.createdAt - a.createdAt)
    .slice(
      (pagination.currentPage - 1) * pagination.itemsPerPage,
      pagination.currentPage * pagination.itemsPerPage
    );

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePlaceOrder = async (orderData: any) => {
    try {
      await orderService.placeOrder(orderData);
      showToast("success", "Đặt đơn hàng", "Đơn hàng đã được tạo thành công");
      setShowPlaceOrder(false);
      fetchOrderSummary();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const isBeforeCutoff = (orderDate: number) => {
    const orderDateTime = new Date(orderDate);
    const cutoffTime = parse(config.orderCutoffTime, "HH:mm", orderDateTime);
    return isBefore(orderDateTime, cutoffTime);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOrderUpdate = async (orderData: any) => {
    if (!selectedOrder?.id) return;
    try {
      await orderService.updateOrder(selectedOrder.id, orderData);
      showToast(
        "success",
        "Cập nhật đơn hàng",
        "Đơn hàng đã được cập nhật thành công"
      );
      fetchOrderSummary();
      setShowOrderModal(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleApiError(error);
    }
  };

  // const handleDeleteOrder = async () => {
  //   if (!selectedOrder?.id) return;
  //   try {
  //     await orderService.deleteOrder(selectedOrder.id);
  //     showToast("success", "Xoá đơn hàng", "Đơn hàng đã được xoá thành công");
  //     fetchOrderSummary();
  //     setShowDeleteModal(false);
  //   } catch (error) {
  //     handleApiError(error);
  //   }
  // };

  // const handleConfirmOrder = async () => {
  //   if (!selectedOrder?.id) return;
  //   try {
  //     await adminService.confirmPaymentOrder(selectedOrder.id);
  //     showToast(
  //       "success",
  //       "Thanh toán đơn hàng",
  //       "Đơn hàng đã được thanh toán thành công"
  //     );
  //     fetchOrderSummary();
  //     setShowConfirmPaidModal(false);
  //   } catch (error) {
  //     handleApiError(error);
  //   }
  // };

  if (loading) return <LoadingSpinner centered />;

  if (!summary) {
    return (
      <EmptyState
        title="Không có dữ liệu"
        message="Hiện tại chưa có thông tin đơn hàng nào."
        icon={<LayoutDashboard size={48} />}
      />
    );
  }

  return (
    <div className="admin-orders">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản lý đơn hàng</h1>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="text-muted">Tổng đơn</h6>
              <h3>{summary.totalOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card pending">
            <Card.Body>
              <h6 className="text-muted">Đơn chờ xử lý</h6>
              <h3>{summary.pendingOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card completed">
            <Card.Body>
              <h6 className="text-muted">Đơn hoàn thành</h6>
              <h3>{summary.completedOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card cancelled">
            <Card.Body>
              <h6 className="text-muted">Đơn huỷ</h6>
              <h3>{summary.cancelledOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Order Chart */}
      {/* <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Thống kê đơn hàng</h5>
          <div className="d-flex gap-3 align-items-center">
            <Form.Select
              style={{ width: "auto" }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={
                  timeRange === "week"
                    ? "weekday"
                    : timeRange === "month"
                    ? "week"
                    : "month"
                }
                label={{
                  value: "Thời gian",
                  position: "insideBottom",
                  offset: -5,
                }}
                tickFormatter={(value) => {
                  if (timeRange === "week")
                    return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][value];
                  if (timeRange === "month") return `Tuần ${value}`;
                  return [
                    "Tháng 1",
                    "Tháng 2",
                    "Tháng 3",
                    "Tháng 4",
                    "Tháng 5",
                    "Tháng 6",
                    "Tháng 7",
                    "Tháng 8",
                    "Tháng 9",
                    "Tháng 10",
                    "Tháng 11",
                    "Tháng 12",
                  ][value - 1];
                }}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                label={{
                  value: "Doanh thu (VND)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Số lượng",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip />
              <Bar
                yAxisId="left"
                dataKey="totalAmount"
                fill="#0d6efd"
                name="Doanh thu"
              />
              <Bar
                yAxisId="right"
                dataKey="orderCount"
                fill="#198754"
                name="Số đơn"
              />
              <Bar
                yAxisId="right"
                dataKey="totalDishes"
                fill="#ffc107"
                name="Số món"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card> */}

      {/* Recent Orders */}
      <Card>
        <Card.Header>
          <div className="d-flex flex-column gap-3 align-items-center">
            <div className="w-100 d-flex flex-row justify-content-between align-items-center">
              <h3 className="mb-0">Đơn hàng gần đây</h3>
              <div className="d-flex align-items-center">
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
                  <option value="5">5 đơn/trang</option>
                  <option value="10">10 đơn/trang</option>
                  <option value="15">15 đơn/trang</option>
                </Form.Select>
              </div>
            </div>
            <div className="w-100 d-flex gap-3 justify-content-between align-items-center">
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2"
                onClick={() => setShowPlaceOrder(true)}
              >
                <PlusCircle size={20} />
                Tạo đơn hàng
              </Button>
              <div className="d-flex gap-3 align-items-center">
                {"Lọc đơn: "}
                <Form.Select
                  style={{ width: "auto" }}
                  value={orderTimeRange}
                  onChange={(e) => setOrderTimeRange(e.target.value)}
                >
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                  <option value="all">Tất cả</option>
                </Form.Select>
                <Form.Select
                  style={{
                    width: "auto",
                    backgroundColor:
                      orderStatusFilter === config.orderPending
                        ? "#F5D311FF"
                        : orderStatusFilter === config.orderCompleted
                        ? "#00BD19FF"
                        : orderStatusFilter === config.orderCancelled
                        ? "#F01923FF"
                        : "",
                  }}
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option
                    style={{
                      backgroundColor: "#FFF",
                    }}
                    value=""
                  >
                    Tất cả
                  </option>
                  <option
                    style={{
                      backgroundColor: "#FFF",
                    }}
                    value={config.orderPending}
                  >
                    Đơn đang xử lý
                  </option>
                  <option
                    style={{
                      backgroundColor: "#FFF",
                    }}
                    value={config.orderCompleted}
                  >
                    Đơn hoàn tất
                  </option>
                  <option
                    style={{
                      backgroundColor: "#FFF",
                    }}
                    value={config.orderCancelled}
                  >
                    Đơn huỷ
                  </option>
                </Form.Select>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ghi chú</th>
                <th>Hoàn tất</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* {summary.recentOrders.map((order) => {
                const isEditable = isBeforeCutoff(order.createdAt || "");
                return (
                  <tr
                    key={order.id}
                    onDoubleClick={() => {
                      setSelectedOrder(order);
                      setShowOrderModal(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{order.id}</td>
                    <td>
                      {format(
                        new Date(order.createdAt || ""),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.note || "-"}</td>
                    <td>{order.totalPrice?.toLocaleString()} đ</td>
                    <td>
                      <Badge
                        bg={
                          order.status === config.orderCompleted
                            ? "success"
                            : order.status === config.orderCancelled
                            ? "danger"
                            : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {isEditable && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })} */}
              {paginatedOrders.map((order) => {
                const isEditable = isBeforeCutoff(order.createdAt);
                return (
                  <tr
                    key={order.id}
                    onDoubleClick={() => {
                      if (!order.isPaid) {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{order.id}</td>
                    {/* <td>
                        {format(
                          new Date(order.createdAt || ""),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </td> */}
                    <td>{order.customerName}</td>
                    <td>{order.note || "-"}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="button-tooltip">
                            Đơn hàng{" "}
                            {order.isPaid ? "đã thanh toán" : "chưa thanh toán"}
                          </Tooltip>
                        }
                      >
                        <Badge bg={order.isPaid ? "success" : "warning"}>
                          {order.isPaid ? (
                            <MdOutlinePaid size={16} />
                          ) : (
                            <MdPaid size={16} />
                          )}
                        </Badge>
                      </OverlayTrigger>
                    </td>
                    <td>{order.totalPrice?.toLocaleString()} đ</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="button-tooltip">
                            Đơn hàng{" "}
                            {order.status === config.orderCompleted
                              ? "đã được đặt"
                              : order.status === config.orderCancelled
                              ? "huỷ"
                              : "đang xử lý"}
                          </Tooltip>
                        }
                      >
                        <Badge
                          bg={
                            order.status === config.orderCompleted
                              ? "success"
                              : order.status === config.orderCancelled
                              ? "danger"
                              : "warning"
                          }
                        >
                          {order.status === config.orderCompleted ? (
                            <AiOutlineFileDone size={16} />
                          ) : order.status === config.orderCancelled ? (
                            <MdOutlineCancel size={16} />
                          ) : (
                            <MdOutlinePendingActions size={16} />
                          )}
                        </Badge>
                      </OverlayTrigger>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {isEditable &&
                          !order.isPaid &&
                          order.status === config.orderPending && (
                            <>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="button-tooltip">
                                    Cập nhật thông tin đơn hàng
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                    setShowOrderModal(true);
                                  }}
                                >
                                  <Edit2 size={16} />
                                </Button>
                              </OverlayTrigger>

                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="button-tooltip">
                                    Huỷ đơn hàng
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </OverlayTrigger>
                            </>
                          )}
                        {order.status === config.orderPending && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="button-tooltip">
                                Xác nhận đơn hàng đã hoàn thành
                              </Tooltip>
                            }
                          >
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowCompleteOrderModal(true);
                              }}
                            >
                              <BsFillBagCheckFill size={16} />
                            </Button>
                          </OverlayTrigger>
                        )}
                        {!order.isPaid &&
                        (order.status === config.orderPending ||
                          order.status === config.orderCompleted) ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="button-tooltip">
                                Xác nhận đơn hàng đã thanh toán
                              </Tooltip>
                            }
                          >
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowConfirmPaidModal(true);
                              }}
                            >
                              <DollarSign size={16} />
                            </Button>
                          </OverlayTrigger>
                        ) : (
                          ""
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-center align-items-center pt-4">
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
        </Card.Footer>
      </Card>

      {/* Modals */}
      <MenuModal
        show={showPlaceOrder}
        onHide={() => setShowPlaceOrder(false)}
        customerInfo={{
          customerName: "",
          customerPhone: "",
          customerEmail: "",
        }}
        cart={cart}
        total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        onSubmit={handlePlaceOrder}
        showMenu={true}
        onUpdateCart={setCart}
      />

      {selectedOrder && (
        <>
          <OrderModal
            show={showOrderModal}
            onHide={() => {
              setShowOrderModal(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            isEditable={isBeforeCutoff(selectedOrder.createdAt || 0)}
            onSubmit={handleOrderUpdate}
            title={`Mã đơn hàng: ${selectedOrder.id}`}
          />

          {/* <DeleteOrderModal
            show={showDeleteModal}
            order={selectedOrder}
            handleClose={() => setShowDeleteModal(false)}
            handleDelete={handleDeleteOrder}
          /> */}

          {/* <ConfirmPaymentModal
            show={showConfirmPaidModal}
            order={selectedOrder}
            handleClose={() => setShowConfirmPaidModal(false)}
            handleConfirm={handleConfirmOrder}
          /> */}

          <CustomInformationModal
            show={showCustomModal}
            order={selectedOrder}
            title={customModal.title}
            titleBg={customModal.titleBg}
            action={customModal.action}
            informationText={customModal.information}
            handleClose={() => {
              setCustomModal(() => ({
                title: "",
                titleBg: "",
                information: "",
                action: "",
              }));
              setShowCompleteOrderModal(false);
              setShowConfirmPaidModal(false);
              setShowDeleteModal(false);
              setShowCustomModal(false);
            }}
            handleAction={handleCustomModalAction}
          />
        </>
      )}

      <style>
        {`
          .stat-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s ease-in-out;
          }

          .stat-card:hover {
            transform: translateY(-2px);
          }

          .stat-card.pending { border-left: 4px solid #ffc107; }
          .stat-card.completed { border-left: 4px solid #198754; }
          .stat-card.cancelled { border-left: 4px solid #dc3545; }

          .table th {
            background: #f8f9fa;
            font-weight: 600;
          }

          tr:hover {
            background-color: rgba(0,0,0,0.02);
          }
        `}
      </style>
    </div>
  );
};
