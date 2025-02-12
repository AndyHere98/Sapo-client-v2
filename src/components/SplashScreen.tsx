import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "react-bootstrap";

export const SplashScreen: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container fluid className="splash-screen">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="splash-content"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="splash-icon"
        >
          🍽️
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="splash-title"
        >
          FoodieExpress
        </motion.h1>
        <div className="loading-bar-container">
          <motion.div
            className="loading-bar"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>

      <style>
        {`
          .splash-screen {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #0061f2 0%, #00ba88 100%);
            color: white;
          }

          .splash-content {
            text-align: center;
          }

          .splash-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            display: inline-block;
          }

          .splash-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 2rem;
            background: linear-gradient(to right, #fff, #e0e0e0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .loading-bar-container {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin: 0 auto;
          }

          .loading-bar {
            height: 100%;
            background: white;
            border-radius: 2px;
          }
        `}
      </style>
    </Container>
  );
};
