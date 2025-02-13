import React from "react";
import { Modal, Button } from "react-bootstrap";
import { OrderItem } from "../types/api";

interface ConfirmPaymentModalProps {
  show: boolean;
  order: OrderItem | null;
  handleClose: () => void;
  handleConfirm: () => void;
}

const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  show,
  order,
  handleClose,
  handleConfirm,
}) => {
  if (!order) {
    return;
  }
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="bg-success text-white">
        <Modal.Title>Thanh toán hoá đơn</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Xác nhận thanh toán cho đơn hàng: {order.id}?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="success" onClick={handleConfirm}>
          Xác nhận
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmPaymentModal;
