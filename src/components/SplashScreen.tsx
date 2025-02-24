import { motion } from "framer-motion";
import { Container } from "react-bootstrap";

export const SplashScreen: React.FC = () => {
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100 bg-info text-white"
    >
      <motion.h1
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, repeatType: "loop", duration: 1.0 }}
        className="display-3 fw-bold text-white"
      >
        🍔 Tiệm này bất ổn 🍕
      </motion.h1>
      <motion.p
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.0 }}
        className="fs-4 text-white mt-3"
      >
        "Ăn gì do bạn chọn"
      </motion.p>
    </Container>
  );
};
