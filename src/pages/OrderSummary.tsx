import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Container,
  Row,
  Col,
  Badge,
  Modal,
  Button,
  Collapse,
} from "react-bootstrap";
import { ChevronDown, ChevronUp, Trophy, List } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CustomToast } from "../components/CustomToast";
import { orderService } from "../services/api";
import {
  OrderItem,
  OrderSummaryResponse,
  TopCustomer,
  ApiError,
  CustomerInfo,
} from "../types/api";
import { config } from "../config/config";

interface OrderDetailsRowProps {
  order: OrderItem;
}

const OrderDetailsRow: React.FC<OrderDetailsRowProps> = ({ order }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <tr>
        <td>{format(new Date(order.createdAt || ""), "MM/dd/yyyy")}</td>
        <td>{order.id}</td>
        <td>{order.customerName}</td>
        <td>
          {(order.totalPrice || 0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
          {config.currency}
        </td>
        <td>
          <Badge
            bg={
              order.status === config.orderCompleted
                ? "success"
                : order.status === config.orderCancelled
                ? "warning"
                : "danger"
            }
          >
            {order.status}
          </Badge>
        </td>
        <td>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="d-flex align-items-center gap-2 w-100"
          >
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showDetails ? "Ẩn" : "Hiển thị"}
          </Button>
        </td>
      </tr>
      <tr>
        <td colSpan={6} className="p-3 rounded bg-light">
          <Collapse in={showDetails}>
            <div className="modal-content-wrapper  bg-light">
              <Row className="mb-4">
                <Col md={6}>
                  <div className="customer-info p-3 bg-light rounded">
                    <h5 className="mb-3">
                      <strong>Thông tin khách hàng</strong>
                    </h5>
                    <dl className="row mb-0">
                      <dt className="col-sm-4">Name:</dt>
                      <dd className="col-sm-8">{order.customerName}</dd>

                      <dt className="col-sm-4">Email:</dt>
                      <dd className="col-sm-8">{order.customerEmail}</dd>

                      <dt className="col-sm-4">Phone:</dt>
                      <dd className="col-sm-8">{order.customerPhone}</dd>

                      <dt className="col-sm-4">Payment:</dt>
                      <dd className="col-sm-8">
                        {order?.paymentMethod === "POSTPAID"
                          ? "Pay on Delivery"
                          : "Pay Now"}
                      </dd>
                    </dl>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="customer-info p-3 bg-light rounded">
                    <h5 className="mb-3">
                      <strong>Thông tin đơn hàng</strong>
                    </h5>

                    <dl className="row mb-0">
                      <dt className="col-sm-7">Loại hình thanh toán:</dt>
                      <dd className="col-sm-5">{order.paymentMethod}</dd>

                      <dt className="col-sm-7">Hình thức thanh toán:</dt>
                      <dd className="col-sm-5">{order.paymentType}</dd>

                      {order.address && (
                        <>
                          <dt className="col-sm-7">Địa chỉ:</dt>
                          <dd className="col-sm-5">{order.address}</dd>
                        </>
                      )}
                      {order.note && (
                        <>
                          <dt className="col-sm-7">Ghi chú:</dt>
                          <dd className="col-sm-5">{order.note}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                </Col>
              </Row>

              <Card className="mb-4 shadow-sm bg-light bg-light">
                <Card.Header className="bg-warning d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <h2 className="h5 mb-0">Món ăn đã chọn</h2>
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
                          <th>Tổng giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderDetails.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>
                              {item.price
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                              {" đ/món"}
                            </td>
                            <td>
                              {(item.price * item.quantity)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                              {config.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Collapse>
        </td>
      </tr>
    </>
  );
};

interface MonthModalProps {
  show: boolean;
  onHide: () => void;
  orders: OrderItem[];
  month: string;
  year: string;
}

const MonthOrderModal: React.FC<MonthModalProps> = ({
  show,
  onHide,
  orders,
  month,
  year,
}) => {
  const totalAmount = orders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0
  );

  return (
    <Modal show={show} onHide={onHide} size="xl" className="fade">
      <Modal.Header closeButton>
        <Modal.Title>
          Đơn hàng tháng {month}, năm {year}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <div className="align-items-center">
              <h2 className="h5 mb-0">Chi tiết đơn</h2>
            </div>
            <div className="gap-3">
              <Badge bg="light" text="primary" className="px-3 py-2 me-3">
                Tổng đơn: {orders.length > 0 ? orders.length : "0"}
                {" đơn"}
              </Badge>
              <Badge bg="light" text="primary" className="px-3 py-2">
                Tổng tiền:{" "}
                {totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                {config.currency}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Ngày đặt đơn</th>
                    <th>Mã đơn hàng</th>
                    <th>Khách hàng</th>
                    <th>Tổng</th>
                    <th>Trạng thái</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <OrderDetailsRow key={order.id} order={order} />
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const TopContributorCard: React.FC<{
  contributor: TopCustomer;
  rank: number;
}> = ({ contributor, rank }) => {
  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "none";
    }
  };

  const isTopThree = rank <= 3;

  return (
    <Card
      className={`contributor-card ${isTopThree ? "top-three" : ""}`}
      style={{ height: isTopThree ? "200px" : "auto" }}
    >
      <Card.Body className="position-relative">
        {isTopThree && (
          <div className="position-absolute top-0 end-0 mt-2 me-2">
            <Trophy
              size={24}
              fill={getTrophyColor(rank)}
              color={getTrophyColor(rank)}
            />
          </div>
        )}
        <div
          className={`d-flex ${
            isTopThree
              ? "flex-column align-items-center"
              : "justify-content-between align-items-center"
          }`}
        >
          <div className={`${isTopThree ? "text-center mb-3" : ""}`}>
            <h5 className="mb-1">{contributor.customerName}</h5>
            <p className="text-muted mb-2">{contributor.totalOrders} orders</p>
          </div>
          <div className={`${isTopThree ? "text-center" : ""}`}>
            <h4 className="mb-0 text-primary">
              {contributor.totalSpending
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
              {config.currency}
            </h4>
            <small className="text-muted">
              Số món đã đặt: {contributor.totalDishes}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

interface TodayOrdersModalProps {
  show: boolean;
  onHide: () => void;
  orders: OrderItem[];
}

const TodayOrdersModal: React.FC<TodayOrdersModalProps> = ({
  show,
  onHide,
  orders,
}) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" className="fade">
      <Modal.Header closeButton>
        <Modal.Title>Today's Orders</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <div className="align-items-center">
              <h2 className="h5 mb-0">Chi tiết đơn</h2>
            </div>
            <div className="gap-3">
              <Badge bg="light" text="primary" className="px-3 py-2 me-3">
                Tổng đơn: {orders.length > 0 ? orders.length : "0"}
                {" đơn"}
              </Badge>
              <Badge bg="light" text="primary" className="px-3 py-2">
                Tổng tiền:{" "}
                {orders
                  .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                {config.currency}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Thời gian đặt đơn</th>
                    <th>Khách hàng</th>
                    <th>Thông tin đơn</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        {format(new Date(order.createdAt || ""), "HH:mm:ss")}
                      </td>
                      <td>
                        <div>{order.customerName}</div>
                        <small className="text-muted">
                          {order.customerPhone}
                        </small>
                      </td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {order.orderDetails.map((item, idx) => (
                            <li key={idx}>
                              {"- "}
                              {item.name} × {item.quantity}
                            </li>
                          ))}
                          Note: - {order.note}
                        </ul>
                      </td>
                      <td>
                        {(order.totalPrice || 0)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        {config.currency}
                      </td>
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
                          {order.status === config.orderPending
                            ? "Đang xử lý"
                            : order.status === config.orderCompleted
                            ? "Hoàn tất"
                            : order.status === config.orderCancelled
                            ? "Đã huỷ"
                            : "Xin thua"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface OrderSummaryProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}
export const OrderSummary: React.FC<OrderSummaryProps> = ({
  customerInfo,
  onGetCustomerInfo,
}) => {
  const [summaryData, setSummaryData] = useState<OrderSummaryResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTodayOrders, setShowTodayOrders] = useState(false);
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
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await orderService.getSummary();
      console.log("fetchSummary", response.data);

      setSummaryData(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      showToast(
        "error",
        `Error ${apiError.errorStatus}`,
        apiError.errorData?.errorMessage || apiError.errorMessage
      );
    } finally {
      setLoading(false);
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

  const handleMonthDoubleClick = (year: string, month: string) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowModal(true);
  };

  if (loading || !summaryData) {
    return <LoadingSpinner centered />;
  }

  const { todayOrders, dailyOrders, yearlyOrders } = summaryData;
  const allTopCustomers = yearlyOrders
    .flatMap((year) =>
      year.monthlyOrderSummary.flatMap((month) => month.topCustomer)
    )
    .reduce((acc, customer) => {
      const existing = acc.find(
        (c) => c.customerEmail === customer.customerEmail
      );
      if (existing) {
        existing.totalOrders += customer.totalOrders;
        existing.totalDishes += customer.totalDishes;
        existing.totalSpending += customer.totalSpending;
        return acc;
      }
      return [...acc, { ...customer }];
    }, [] as TopCustomer[])
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, 10);

  return (
    <Container className="py-4">
      {/* Stats Cards */}
      <div className="mb-4">
        <h1 className="text-primary mb-3">Tổng đơn</h1>
        <div className="d-flex gap-3 flex-wrap">
          <Card className="stats-card">
            <Card.Body>
              <h6 className="text-muted">Số đơn hàng hôm nay</h6>
              <h3>{todayOrders.length}</h3>
            </Card.Body>
          </Card>
          <Card className="stats-card">
            <Card.Body>
              <h6 className="text-muted">Tổng chi hôm nay</h6>
              <h3>
                {todayOrders
                  .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                {config.currency}
              </h3>
            </Card.Body>
          </Card>
        </div>
      </div>

      {yearlyOrders.length > 0 && (
        <>
          {/* Top Contributors Section */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h2 className="h5 mb-0">Bảng xếp hạng khách VIP</h2>
            </Card.Header>
            <Card.Body>
              {/* Top 3 Contributors */}
              <Row className="g-4 mb-4">
                {allTopCustomers.slice(0, 3).map((contributor, index) => (
                  <Col key={contributor.customerEmail} md={4}>
                    <TopContributorCard
                      contributor={contributor}
                      rank={index + 1}
                    />
                  </Col>
                ))}
              </Row>

              {/* Contributors 4-10 */}
              {allTopCustomers.slice(3).length > 0 && (
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Hạng</th>
                          <th>Khách hàng</th>
                          <th>Tổng số đơn</th>
                          <th>Tổng món</th>
                          <th>Tổng chi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTopCustomers.slice(3).map((contributor, index) => (
                          <tr key={contributor.customerEmail}>
                            <td>#{index + 4}</td>
                            <td>{contributor.customerName}</td>
                            <td>{contributor.totalOrders}</td>
                            <td>{contributor.totalDishes}</td>
                            <td>
                              {contributor.totalSpending
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                              {config.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>

          {/* Today's Orders Section */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <h2 className="h5 mb-0">Đơn hàng hôm nay</h2>
                {todayOrders.length > 0 && (
                  <Button
                    variant="light"
                    size="sm"
                    className="d-flex align-items-center gap-2"
                    onClick={() => setShowTodayOrders(true)}
                  >
                    <List size={16} />
                    Show Orders
                  </Button>
                )}
              </div>
              <Badge bg="light" text="primary" className="px-3 py-2">
                Tổng:{" "}
                {todayOrders
                  .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                {config.currency}
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Món ăn</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyOrders.map((item, index) => (
                      <tr key={index} className="order-row">
                        <td>{item.dishName}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {item.unitPrice
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          {config.currency}
                        </td>
                        <td>
                          {item.sumPrice
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          {config.currency}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-light fw-bold">
                      <td>Tổng</td>
                      <td>
                        {dailyOrders.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </td>
                      <td></td>
                      <td>
                        {dailyOrders
                          .reduce((sum, item) => sum + item.sumPrice, 0)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        {config.currency}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
          <h2 className="h4 mb-4">Tổng kết theo năm / tháng</h2>
          {yearlyOrders.map((yearSummary) => (
            <Card key={yearSummary.year} className="mb-4 shadow-sm year-card">
              <Card.Header className="bg-success text-white">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="h5 mb-0">Năm: {yearSummary.year}</h3>
                  </Col>
                  <Col className="text-end">
                    <span className="me-3">
                      Số lượng đơn: {yearSummary.totalOrders}
                    </span>
                    {" | "}
                    <span>
                      Tổng chi:{" "}
                      {yearSummary.totalSpending
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                      {config.currency}
                    </span>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Row xs={1} md={2} lg={3} className="g-4">
                  {yearSummary.monthlyOrderSummary.map((monthSummary) => (
                    <Col key={monthSummary.month}>
                      <Card
                        className="month-card h-100"
                        onClick={() =>
                          handleMonthDoubleClick(
                            yearSummary.year,
                            monthSummary.month
                          )
                        }
                      >
                        <Card.Body>
                          <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                            <span>Tháng {monthSummary.month}</span>
                            <Badge bg="primary" pill>
                              {monthSummary.totalOrders} đơn
                            </Badge>
                          </Card.Title>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Doanh thu:</span>
                            <h5 className="mb-0">
                              {monthSummary.totalSpending
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                              {config.currency}
                            </h5>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Tổng món:</span>
                            <h6 className="mb-0">{monthSummary.totalDish}</h6>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </>
      )}

      {/* Modals */}
      <TodayOrdersModal
        show={showTodayOrders}
        onHide={() => setShowTodayOrders(false)}
        orders={todayOrders}
      />

      {selectedMonth && selectedYear && (
        <MonthOrderModal
          show={showModal}
          onHide={() => setShowModal(false)}
          orders={
            yearlyOrders
              .find((y) => y.year === selectedYear)
              ?.monthlyOrderSummary.find((m) => m.month === selectedMonth)
              ?.orderList || []
          }
          month={selectedMonth}
          year={selectedYear}
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

      <style>
        {`
          .stats-card {
            min-width: 200px;
            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s ease-in-out;
          }

          .stats-card:hover {
            transform: translateY(-2px);
          }

          .contributor-card {
            border: none;
            transition: all 0.3s ease-in-out;
            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .contributor-card.top-three {
            background: linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%);
          }

          .contributor-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .year-card {
            border: none;
            transition: all 0.2s ease-in-out;
          }

          .year-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }

          .month-card {
            cursor: pointer;
            border: 1px solid #e9ecef;
            transition: all 0.2s ease-in-out;
          }

          .month-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: #dee2e6;
          }

          .order-row {
            transition: background-color 0.2s ease-in-out;
          }

          .order-row:hover {
            background-color: #f8f9fa;
          }

          .modal.fade .modal-dialog {
            transition: transform 0.3s ease-out;
          }

          .modal.show .modal-dialog {
            transform: none;
          }

          .collapse {
            transition: all 0.2s ease-in-out;
          }

          .list-unstyled {
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .list-unstyled li {
            margin-bottom: 0.25rem;
          }

          .list-unstyled li:last-child {
            margin-bottom: 0;
          }
        `}
      </style>
    </Container>
  );
};
