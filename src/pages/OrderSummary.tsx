import React, { useState, useEffect } from 'react';
import { Card, Table, Container, Row, Col, Badge, Modal, Button, Collapse } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Trophy, List } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CustomToast } from '../components/CustomToast';
import { orderService } from '../services/api';
import { 
  OrderItem, 
  OrderSummaryResponse, 
  TopCustomer,
  ApiError, 
  CustomerInfo
} from '../types/api';
import { config } from '../config/config';

interface OrderDetailsRowProps {
  order: OrderItem;
}


const OrderDetailsRow: React.FC<OrderDetailsRowProps> = ({ order }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <tr>
        <td>{format(new Date(order.createdAt || ''), 'MM/dd/yyyy')}</td>
        <td>{order.id}</td>
        <td>{order.customerName}</td>
        <td>{(order.totalPrice || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
        <td>
          <Badge bg={
            order.status === 'completed' ? 'success' :
            order.status === 'pending' ? 'warning' : 'danger'
          }>
            {order.status}
          </Badge>
        </td>
        <td>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="d-flex align-items-center gap-2"
          >
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </td>
      </tr>
      <tr>
        <td colSpan={6} className="p-0">
          <Collapse in={showDetails}>
            <div className="p-3 bg-light">
              <h6 className="mb-3">Order Details</h6>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Customer Information</strong></p>
                  <p>Name: {order.customerName}</p>
                  <p>Phone: {order.customerPhone}</p>
                  <p>Email: {order.customerEmail}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Order Information</strong></p>
                  <p>Payment Method: {order.paymentMethod}</p>
                  {order.address && <p>Delivery Address: {order.address}</p>}
                  {order.note && <p>Special Instructions: {order.note}</p>}
                </Col>
              </Row>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderDetails.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
                      <td>{(item.price * item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                    <td><strong>{(order.totalPrice || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</strong></td>
                  </tr>
                </tbody>
              </Table>
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

const MonthOrderModal: React.FC<MonthModalProps> = ({ show, onHide, orders, month, year }) => {
  const totalAmount = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  
  return (
    <Modal show={show} onHide={onHide} size="xl" className="fade">
      <Modal.Header closeButton>
        <Modal.Title>Orders for {month} {year}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <strong>Total Orders:</strong> {orders.length} |{' '}
          <strong>Total Amount:</strong> {totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}
        </div>
        <Table responsive bordered>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderDetailsRow key={order.id} order={order} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

const TopContributorCard: React.FC<{ contributor: TopCustomer; rank: number }> = ({ contributor, rank }) => {
  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return 'none';
    }
  };

  const isTopThree = rank <= 3;

  return (
    <Card 
      className={`contributor-card ${isTopThree ? 'top-three' : ''}`}
      style={{ height: isTopThree ? '200px' : 'auto' }}
    >
      <Card.Body className="position-relative">
        {isTopThree && (
          <div className="position-absolute top-0 end-0 mt-2 me-2">
            <Trophy size={24} fill={getTrophyColor(rank)} color={getTrophyColor(rank)} />
          </div>
        )}
        <div className={`d-flex ${isTopThree ? 'flex-column align-items-center' : 'justify-content-between align-items-center'}`}>
          <div className={`${isTopThree ? 'text-center mb-3' : ''}`}>
            <h5 className="mb-1">{contributor.customerName}</h5>
            <p className="text-muted mb-2">
              {contributor.totalOrders} orders
            </p>
          </div>
          <div className={`${isTopThree ? 'text-center' : ''}`}>
            <h4 className="mb-0 text-primary">
              {contributor.totalSpending.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}
            </h4>
            <small className="text-muted">
              {contributor.totalDishes} dishes ordered
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

const TodayOrdersModal: React.FC<TodayOrdersModalProps> = ({ show, onHide, orders }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" className="fade">
      <Modal.Header closeButton>
        <Modal.Title>Today's Orders</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <strong>Total Orders:</strong> {orders.length} |{' '}
          <strong>Total Amount:</strong> {orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}
        </div>
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{format(new Date(order.createdAt || ''), 'HH:mm:ss')}</td>
                <td>
                  <div>{order.customerName}</div>
                  <small className="text-muted">{order.customerPhone}</small>
                </td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {order.orderDetails.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{(order.totalPrice || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
                <td>
                  <Badge bg={
                    order.status === 'completed' ? 'success' :
                    order.status === 'pending' ? 'warning' : 'danger'
                  }>
                    {order.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

interface OrderSummaryProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}
export const OrderSummary: React.FC<OrderSummaryProps> = ({customerInfo, onGetCustomerInfo}) => {
  const [summaryData, setSummaryData] = useState<OrderSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTodayOrders, setShowTodayOrders] = useState(false);
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
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await orderService.getSummary();
      console.log('fetchSummary', response.data);
      
      setSummaryData(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      showToast('error', `Error ${apiError.errorStatus}`, apiError.errorData?.errorMessage || apiError.errorMessage);
    } finally {
      setLoading(false);
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
    .flatMap(year => year.monthlyOrderSummary
      .flatMap(month => month.topCustomer))
    .reduce((acc, customer) => {
      const existing = acc.find(c => c.customerEmail === customer.customerEmail);
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
        <h1 className="text-primary mb-3">Order Summary</h1>
        <div className="d-flex gap-3 flex-wrap">
          <Card className="stats-card">
            <Card.Body>
              <h6 className="text-muted">Today's Orders</h6>
              <h3>{todayOrders.length}</h3>
            </Card.Body>
          </Card>
          <Card className="stats-card">
            <Card.Body>
              <h6 className="text-muted">Today's Revenue</h6>
              <h3>{todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</h3>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Top Contributors Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="h5 mb-0">Top Contributors</h2>
        </Card.Header>
        <Card.Body>
          {/* Top 3 Contributors */}
          <Row className="g-4 mb-4">
            {allTopCustomers.slice(0, 3).map((contributor, index) => (
              <Col key={contributor.customerEmail} md={4}>
                <TopContributorCard contributor={contributor} rank={index + 1} />
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
                      <th>Rank</th>
                      <th>Customer</th>
                      <th>Total Orders</th>
                      <th>Total Dishes</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTopCustomers.slice(3).map((contributor, index) => (
                      <tr key={contributor.customerEmail}>
                        <td>#{index + 4}</td>
                        <td>{contributor.customerName}</td>
                        <td>{contributor.totalOrders}</td>
                        <td>{contributor.totalDishes}</td>
                        <td>{contributor.totalSpending.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
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
            <h2 className="h5 mb-0">Today's Orders</h2>
            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center gap-2"
              onClick={() => setShowTodayOrders(true)}
            >
              <List size={16} />
              Show Orders
            </Button>
          </div>
          <Badge bg="light" text="primary" className="px-3 py-2">
            Total: {todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Dish Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {dailyOrders.map((item, index) => (
                  <tr key={index} className="order-row">
                    <td>{item.dishName}</td>
                    <td>{item.quantity}</td>
                    <td>{(item.sumPrice / item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
                    <td>{item.sumPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
                  </tr>
                ))}
                <tr className="table-light fw-bold">
                  <td>Total</td>
                  <td>{dailyOrders.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td></td>
                  <td>{dailyOrders.reduce((sum, item) => sum + item.sumPrice, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Monthly Summary Section */}
      <h2 className="h4 mb-4">Monthly Summary</h2>
      {yearlyOrders.map((yearSummary) => (
        <Card key={yearSummary.year} className="mb-4 shadow-sm year-card">
          <Card.Header className="bg-light">
            <Row className="align-items-center">
              <Col>
                <h3 className="h5 mb-0">Year: {yearSummary.year}</h3>
              </Col>
              <Col className="text-end">
                <span className="me-3">Orders: {yearSummary.totalOrders}</span>
                <span>Total: {yearSummary.totalSpending.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency} {config.currency}</span>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Row xs={1} md={2} lg={3} className="g-4">
              {yearSummary.monthlyOrderSummary.map((monthSummary) => (
                <Col key={monthSummary.month}>
                  <Card
                    className="month-card h-100"
                    onClick={() => handleMonthDoubleClick(yearSummary.year, monthSummary.month)}
                  >
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                        <span>{monthSummary.month}</span>
                        <Badge bg="primary" pill>
                          {monthSummary.totalOrders} orders
                        </Badge>
                      </Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Total Revenue</span>
                        <h5 className="mb-0">{monthSummary.totalSpending.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {config.currency}</h5>
                      </div>
                      <div className="mt-2 text-muted">
                        <small>Total Dishes: {monthSummary.totalDish}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      ))}

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
          orders={yearlyOrders
            .find(y => y.year === selectedYear)
            ?.monthlyOrderSummary
            .find(m => m.month === selectedMonth)
            ?.orderList || []}
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
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
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