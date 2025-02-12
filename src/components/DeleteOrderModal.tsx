import React from "react";
import { Modal, Button } from "react-bootstrap";
import { OrderItem } from "../types/api";

interface DeleteOrderModalProps {
  show: boolean;
  order: OrderItem | null;
  handleClose: () => void;
  handleDelete: () => void;
}

const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({
  show,
  order,
  handleClose,
  handleDelete,
}) => {
  if (!order) {
    return;
  }
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="bg-danger text-white">
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete order: {order.id}? This action cannot
          be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete Order
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteOrderModal;
