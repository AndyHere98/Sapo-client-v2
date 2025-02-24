import React, { useState } from "react";
import { Modal, Button, Form, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { authService } from "../services/api";
import { ApiError, CustomerInfo } from "../types/api";
import { CustomToast } from "./CustomToast";

interface CustomerModalProps {
  onHide: () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ onHide }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [show] = useState<boolean>(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });
  const [validated, setValidated] = useState<boolean>(false);

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

  const handleClose = () => {
    // setShow(false);
    setValidated(false);
  };

  // const handleShow = () => setShow(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity()) {
      // Handle the form submission here
      console.log("Form submitted:", customerInfo);
      await handleRegisterCustomer(customerInfo);
      handleClose();
    }

    setValidated(true);
  };

  const handleRegisterCustomer = async (customerInfo: CustomerInfo) => {
    try {
      const response = await authService.registerCustomer(customerInfo);
      console.log("handleRegisterCustomer", response);

      if (response.status === 201) {
        const successfulResponse: any = response.data;
        showToast(
          "success",
          "Customer Information",
          `${successfulResponse.message}`
        );
        setTimeout(() => {
          onHide();
          setCustomerInfo({
            customerName: "",
            customerPhone: "",
            customerEmail: "",
          });
        }, 1000);
      } else {
        const apiError: ApiError = {
          apiPath: "/user/register",
          errorStatus: 500,
          errorMessage: "Failed to connect to the server",
          errorTime: new Date().toISOString(),
        };
        showToast(
          "error",
          `Error ${apiError.errorStatus}`,
          apiError.errorMessage
        );
      }
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
  return (
    <Container className="mt-4">
      {/* Modal Component */}
      <Modal
        show={show}
        // onHide={handleClose}
        centered
        backdrop="static"
        keyboard={false}
        className="fade"
      >
        <Modal.Header className="border-bottom-0 bg-primary text-white">
          <Modal.Title className="h4">Đăng ký thông tin khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên của bạn"
                name="customerName"
                value={customerInfo.customerName}
                onChange={handleInputChange}
                required
                className="shadow-sm"
              />
              <Form.Control.Feedback type="invalid">
                Nhập tên của bạn
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Nhập số điện thoại"
                name="customerPhone"
                value={customerInfo.customerPhone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
                className="shadow-sm"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid 10-digit phone number.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                name="customerEmail"
                value={customerInfo.customerEmail}
                onChange={handleInputChange}
                required
                className="shadow-sm"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email address.
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                type="submit"
                className="py-2 shadow-sm"
              >
                Đăng ký
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <CustomToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        timestamp={toast.timestamp}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </Container>
  );
};

export default CustomerModal;
