import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Badge } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminService } from "../../services/api";
import { AdminCustomerSummary } from "../../types/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../contexts/ToastContext";
import { EmptyState } from "../../components/EmptyState";
import { Users } from "lucide-react";

export const AdminCustomers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminCustomerSummary | null>(null);
  const { handleApiError } = useToast();

  useEffect(() => {
    fetchCustomerSummary();
  }, []);

  const fetchCustomerSummary = async () => {
    try {
      const response = await adminService.getAdminCustomerSummary();
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
        message="Hiện tại chưa có thông tin khách hàng nào."
        icon={<Users size={48} />}
      />
    );
  }

  return (
    <div className="admin-customers">
      <h1 className="mb-4">Quản lý khách hàng</h1>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="text-muted">Tổng khách hàng</h6>
              <h3>{summary.totalCustomers}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="stat-card new-customers">
            <Card.Body>
              <h6 className="text-muted">Khách hàng mới hôm nay</h6>
              <h3>{summary.newCustomersToday}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Customer Growth Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Tăng trưởng khách hàng</h5>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.customerStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="newCustomers"
                stroke="#0d6efd"
                name="Khách hàng mới"
              />
              <Line
                type="monotone"
                dataKey="activeCustomers"
                stroke="#198754"
                name="Khách hàng hoạt động"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* Top Customers */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Khách hàng VIP</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Tổng đơn</th>
                    <th>Tổng chi</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topCustomers.map((customer, index) => (
                    <tr key={index}>
                      <td>
                        <div>{customer.customerName}</div>
                        <small className="text-muted">
                          {customer.customerEmail}
                        </small>
                      </td>
                      <td>{customer.totalOrders}</td>
                      <td>{customer.totalSpending.toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Hoạt động gần đây</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover>
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Đơn gần nhất</th>
                    <th>Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.customerActivity.map((activity, index) => (
                    <tr key={index}>
                      <td>{activity.customerName}</td>
                      <td>
                        {new Date(activity.lastOrderDate).toLocaleDateString()}
                      </td>
                      <td>{activity.totalSpent.toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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

          .stat-card.new-customers { border-left: 4px solid #0d6efd; }

          .table th {
            background: #f8f9fa;
            font-weight: 600;
          }
        `}
      </style>
    </div>
  );
};
