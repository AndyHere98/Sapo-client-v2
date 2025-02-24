import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Badge, Form, Button } from "react-bootstrap";
import { adminService } from "../../services/api";
import {
  AdminCustomerSummary,
  CustomerInfo,
  TopCustomer,
} from "../../types/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useToast } from "../../contexts/ToastContext";
import { EmptyState } from "../../components/EmptyState";
import { Users, Trophy, Save } from "lucide-react";

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
    <Card className={`contributor-card ${isTopThree ? "top-three" : ""}`}>
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
              đ
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

export const AdminCustomers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminCustomerSummary | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editingCustomerName, setEditingCustomerName] = useState<string>("");
  const [editingCustomerPhone, setEditingCustomerPhone] = useState<string>("");
  const [editingCustomerEmail, setEditingCustomerEmail] = useState<string>("");
  const [customerEdits, setCustomerEdits] = useState<CustomerInfo>({
    customerName: editingCustomerName,
    customerPhone: editingCustomerPhone,
    customerEmail: editingCustomerEmail,
  });
  const { showToast, handleApiError } = useToast();

  useEffect(() => {
    fetchCustomerSummary();
  }, []);

  const fetchCustomerSummary = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminCustomerSummary();
      setSummary(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // const handleCellEdit = () => {
  //   setCustomerEdits((prev) => ({
  //     ...prev,
  //   }));

  //   console.log('setCustomerEdits', customerEdits);

  // };

  useEffect(() => {
    setCustomerEdits({
      customerName: editingCustomerName,
      customerPhone: editingCustomerPhone,
      customerEmail: editingCustomerEmail,
    });
  }, [editingCustomerName, editingCustomerPhone, editingCustomerEmail]);

  const handleUpdateCustomer = async (
    customerId: string,
    customerInfo: CustomerInfo
  ) => {
    try {
      setLoading(true);
      console.log("handleUpdateCustomer", customerInfo);

      await adminService.updateCustomer(customerId, customerInfo);
      showToast(
        "success",
        "Cập nhật thông tin",
        "Thông tin khách hàng đã được cập nhật thành công"
      );
      setEditingCustomer(null);
      setCustomerEdits({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
      });
      await fetchCustomerSummary();
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

      {/* Top Contributors Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="h5 mb-0">Bảng xếp hạng khách VIP</h2>
        </Card.Header>
        <Card.Body>
          {/* Top 3 Contributors */}
          <Row className="g-4 mb-4">
            {summary.topCustomers.slice(0, 3).map((contributor, index) => (
              <Col key={contributor.customerEmail} md={4}>
                <TopContributorCard
                  contributor={contributor}
                  rank={index + 1}
                />
              </Col>
            ))}
          </Row>

          {/* Contributors 4-10 */}
          {summary.topCustomers.slice(3).length > 0 && (
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
                    {summary.topCustomers.slice(3).map((contributor, index) => (
                      <tr key={contributor.customerEmail}>
                        <td>#{index + 4}</td>
                        <td>{contributor.customerName}</td>
                        <td>{contributor.totalOrders}</td>
                        <td>{contributor.totalDishes}</td>
                        <td>
                          {contributor.totalSpending
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          đ
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

      {/* Customer Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Danh sách khách hàng</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive>
            <thead>
              <tr>
                <th>Tên khách hàng</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ IP</th>
                <th>PC Host Name</th>
                <th>Công nợ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {summary.customerInfos.map((customer) => {
                const isEditing = editingCustomer === customer.ipAddress;
                const editedCustomer: CustomerInfo = {
                  customerName: editingCustomerName || customer.customerName,
                  customerPhone: editingCustomerPhone || customer.customerPhone,
                  customerEmail: editingCustomerEmail || customer.customerEmail,
                };

                return (
                  <tr key={customer.ipAddress}>
                    <td
                      onDoubleClick={() => {
                        setEditingCustomer(customer?.ipAddress || "");
                        // setEditingCustomerEmail(customer.customerEmail)
                      }}
                    >
                      {isEditing ? (
                        <Form.Control
                          type="text"
                          value={editedCustomer.customerName}
                          onChange={(e) =>
                            // handleCellEdit(
                            //   customer?.ipAddress || '',
                            //   "customerName",
                            //   e.target.value
                            // )
                            setEditingCustomerName(e.target.value)
                          }
                        />
                      ) : (
                        customer.customerName
                      )}
                    </td>
                    <td
                      onDoubleClick={() =>
                        setEditingCustomer(customer?.ipAddress || "")
                      }
                    >
                      {isEditing ? (
                        <Form.Control
                          type="text"
                          value={editedCustomer.customerPhone}
                          onChange={(e) =>
                            // handleCellEdit(
                            //   customer?.ipAddress || '',
                            //   "customerPhone",
                            //   e.target.value
                            // )
                            setEditingCustomerPhone(e.target.value)
                          }
                        />
                      ) : (
                        customer.customerPhone
                      )}
                    </td>
                    <td
                      onDoubleClick={() =>
                        setEditingCustomer(customer?.ipAddress || "")
                      }
                    >
                      {isEditing ? (
                        <Form.Control
                          type="email"
                          value={editedCustomer.customerEmail}
                          onChange={(e) =>
                            // handleCellEdit(
                            //   customer?.ipAddress || '',
                            //   "customerEmail",
                            //   e.target.value
                            // )
                            setEditingCustomerEmail(e.target.value)
                          }
                        />
                      ) : (
                        customer.customerEmail
                      )}
                    </td>
                    <td>{customer.ipAddress || "-"}</td>
                    <td>{customer.pcHostName || "-"}</td>
                    <td>
                      <Badge bg={customer.balance ? "warning" : "success"}>
                        {customer.balance
                          ? `${customer.balance
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ`
                          : "Đã thanh toán"}
                      </Badge>
                    </td>
                    <td>
                      {isEditing && (
                        <div className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleUpdateCustomer(
                                customer?.ipAddress || "",
                                editedCustomer
                              )
                            }
                            className="d-flex align-items-center gap-2"
                          >
                            <Save size={16} />
                            Cập nhật
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setEditingCustomer("");
                            }}
                          >
                            Huỷ
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <style>
        {`
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

          .table th {
            background: #f8f9fa;
            font-weight: 600;
          }

          td {
            vertical-align: middle;
          }

          tr:hover {
            background-color: rgba(0,0,0,0.02);
          }
        `}
      </style>
    </div>
  );
};
