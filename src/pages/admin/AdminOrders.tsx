import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Badge, Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminService, orderService } from "../../services/api";
import { AdminOrderSummary } from "../../types/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { MenuModal } from "../../components/MenuModal";
import { LayoutDashboard, PlusCircle } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { EmptyState } from "../../components/EmptyState";

export const AdminOrders: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const { showToast, handleApiError } = useToast();

  useEffect(() => {
    fetchOrderSummary();
  }, []);

  const fetchOrderSummary = async () => {
    try {
      const response = await adminService.getAdminOrderSummary();
      setSummary(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (orderData: any) => {
    try {
      await orderService.placeOrder(orderData);
      showToast("success", "Đặt đơn hàng", "Đơn hàng đã được tạo thành công");
      setShowPlaceOrder(false);
      fetchOrderSummary();
    } catch (error) {
      handleApiError(error);
    }
  };

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
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={() => setShowPlaceOrder(true)}
        >
          <PlusCircle size={20} />
          Tạo đơn hàng
        </Button>
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
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Thống kê đơn hàng</h5>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.dailyOrderStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orderCount" fill="#0d6efd" name="Số đơn" />
              <Bar dataKey="totalAmount" fill="#198754" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* Recent Orders */}
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Đơn hàng gần đây</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>
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
                      </td>
                      <td>{order.totalPrice?.toLocaleString()} đ</td>
                      <td>
                        <Button size="sm" variant="outline-primary">
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Popular Dishes */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Món ăn phổ biến</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover>
                <thead>
                  <tr>
                    <th>Món ăn</th>
                    <th>Số lượng</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.popularDishes.map((dish, index) => (
                    <tr key={index}>
                      <td>{dish.dishName}</td>
                      <td>{dish.orderCount}</td>
                      <td>{dish.totalRevenue.toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Place Order Modal */}
      <MenuModal
        show={showPlaceOrder}
        onHide={() => setShowPlaceOrder(false)}
        customerInfo={{
          customerName: "",
          customerPhone: "",
          customerEmail: "",
        }}
        cart={[]}
        total={0}
        onSubmit={handlePlaceOrder}
      />

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
        `}
      </style>
    </div>
  );
};
