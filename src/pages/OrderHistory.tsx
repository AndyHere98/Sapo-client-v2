import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge, Pagination, Container, Alert } from 'react-bootstrap';
import { format, parse, isAfter, isBefore } from 'date-fns';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CustomToast } from '../components/CustomToast';
import { OrderModal } from '../components/OrderModal';
import { orderService, menuService } from '../services/api';
import { OrderItem, MenuItem, ApiError, CustomerInfo } from '../types/api';
import { config } from '../config/config';


interface OrderHistoryProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({customerInfo, onGetCustomerInfo}) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useState({
    customerName: '',
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    onGetCustomerInfo();
    fetchOrders();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders(searchParams);
      setOrders(response.data);
      setPagination(prev => ({
        ...prev,
        totalItems: response.data.length,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      showToast('error', `Error ${apiError.errorStatus}`, apiError.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isBeforeCutoff = (orderDate: string) => {
    const orderDateTime = new Date(orderDate);
    const cutoffTime = parse(config.orderCutoffTime, 'HH:mm', orderDateTime);
    return isBefore(orderDateTime, cutoffTime);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setLoading(true);
    fetchOrders();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleOrderUpdate = async (orderData: any) => {
    if (!selectedOrder) return;

    try {
      console.log('handleOrderUpdate', JSON.stringify(orderData));
      
      await orderService.updateOrder(selectedOrder.id!, orderData);
      showToast('success', 'Order Updated', 'Order has been successfully updated');
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      const apiError = error as ApiError;
      showToast('error', `Error ${apiError.errorStatus}`, apiError.errorMessage);
    }
  };

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setToast({
      show: true,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  const paginatedOrders = orders.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  if (loading) {
    return <LoadingSpinner centered />;
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-4">Search Orders</h4>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerInfo.customerName}
                    readOnly
                    onChange={e => setSearchParams(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={searchParams.fromDate}
                    onChange={e => setSearchParams(prev => ({ ...prev, fromDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={searchParams.toDate}
                    onChange={e => setSearchParams(prev => ({ ...prev, toDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="w-100">
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {orders.length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>No Orders Found</h5>
          <p className="mb-0">Try adjusting your search criteria or check back later.</p>
        </Alert>
      ) : (
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Order History</h4>
            <Form.Select
              style={{ width: 'auto' }}
              value={pagination.itemsPerPage}
              onChange={(e) => setPagination(prev => ({
                ...prev,
                itemsPerPage: parseInt(e.target.value),
                currentPage: 1
              }))}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </Form.Select>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {paginatedOrders.map((order) => {
              const isEditable = isBeforeCutoff(order.createdAt || '');
              return (
                <Col key={order.id}>
                  <Card
                    className={`h-100 shadow-sm order-card ${isEditable ? 'editable' : 'completed'}`}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="mb-1">Order #{order.id}</h5>
                          <p className="text-muted mb-0">
                            {format(new Date(order.createdAt || ''), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        {isEditable && (
                          <Badge bg="warning">Editable</Badge>
                        )}
                      </div>
                      <div className="mb-3">
                        <strong>Customer:</strong>
                        <p className="mb-1">{order.customerName}</p>
                        <small className="text-muted">{order.customerEmail}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge bg={order.status === 'completed' ? 'success' : 
                                 order.status === 'cancelled' ? 'danger' : 'warning'}>
                          {order.status}
                        </Badge>
                        <strong>${(order.totalPrice || 0).toFixed(2)}</strong>
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
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          isEditable={isBeforeCutoff(selectedOrder.createdAt || '')}
          onSubmit={handleOrderUpdate}
          title={`Order #${selectedOrder.id}`}
        />
      )}

      <CustomToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        timestamp={toast.timestamp}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
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