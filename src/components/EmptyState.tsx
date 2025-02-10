import React from "react";
import { Container, Card } from "react-bootstrap";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
}) => {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "60vh" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <Card className="empty-state-card">
          <Card.Body>
            {icon && <div className="empty-state-icon mb-4">{icon}</div>}
            <h3 className="mb-3">{title}</h3>
            <p className="text-muted mb-0">{message}</p>
          </Card.Body>
        </Card>

        <style>
          {`
            .empty-state-card {
              background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
              border: none;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 2rem;
              max-width: 400px;
              margin: auto;
            }

            .empty-state-icon {
              font-size: 3rem;
              color: #6c757d;
            }
          `}
        </style>
      </motion.div>
    </Container>
  );
};
