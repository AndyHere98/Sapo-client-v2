import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Badge } from "react-bootstrap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminService } from "../../services/api";
import { AdminBillingSummary } from "../../types/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../contexts/ToastContext";
import { EmptyState } from "../../components/EmptyState";
import { FileText } from "lucide-react";

export const AdminBilling: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminBillingSummary | null>(null);
  const { handleApiError } = useToast();

  useEffect(() => {
    fetchBillingSummary();
  }, []);

  const fetchBillingSummary = async () => {
    try {
      const response = await adminService.getAdminBillingSummary();
      setSummary(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner centered />;

  if (!summary) {
    return (
      <EmptyState
        title="Không có dữ liệu"
        message="Hiện tại chưa có thông tin hoá đơn nào."
        icon={<FileText size={48} />}
      />
    );
  }

  return (
    <div className="admin-billing">
      <h1 className="mb-4">Quản lý hoá đơn</h1>

      {/* Revenue Stats */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="text-muted">Doanh thu hôm nay</h6>
              <h3>{summary.dailyRevenue.toLocaleString()} đ</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="text-muted">Doanh thu tháng</h6>
              <h3>{summary.monthlyRevenue.toLocaleString()} đ</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="text-muted">Doanh thu năm</h6>
              <h3>{summary.yearlyRevenue.toLocaleString()} đ</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="text-muted">Tổng doanh thu</h6>
              <h3>{summary.totalRevenue.toLocaleString()} đ</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Biểu đồ doanh thu</h5>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={summary.revenueStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0d6efd"
                fill="#0d6efd"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Đơn chưa thanh toán</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Hạn thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {summary.unpaidOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{(order.totalPrice ? order.totalPrice : 0).toLocaleString()} đ</td>
                  <td>
                    <Badge bg="warning">
                      {new Date(order.createdAt ? order.createdAt : '').toLocaleDateString()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

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

          .table th {
            background: #f8f9fa;
            font-weight: 600;
          }
        `}
      </style>
    </div>
  );
};
