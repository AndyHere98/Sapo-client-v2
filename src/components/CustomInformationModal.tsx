import React from "react";
import { Modal, Button } from "react-bootstrap";
import { OrderItem } from "../types/api";

interface CustomInformationModalProps {
  show: boolean;
  order: OrderItem | null;
  title: string;
  titleBg: string;
  action: string;
  informationText: string;
  handleClose: () => void;
  handleAction: () => void;
}

const CustomInformationModal: React.FC<CustomInformationModalProps> = ({
  show,
  order,
  title,
  titleBg,
  action,
  informationText,
  handleClose,
  handleAction,
}) => {
  if (!order) {
    return;
  }
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className={`bg-${titleBg} text-white`}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{informationText}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant={`${titleBg}`} onClick={handleAction}>
          {action}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomInformationModal;
