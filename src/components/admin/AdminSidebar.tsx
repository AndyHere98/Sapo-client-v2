import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AdminSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // const sidebarWidth = isCollapsed && !isHovered ? 70 : 250;

  const sidebarVariants = {
    expanded: { width: 250 },
    collapsed: { width: 70 },
  };

  const linkVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 },
  };

  return (
    <motion.div
      className="admin-sidebar"
      initial="expanded"
      animate={isCollapsed && !isHovered ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-header">
        <AnimatePresence mode="wait">
          {(!isCollapsed || isHovered) && (
            <motion.h3
              className="brand"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={linkVariants}
              transition={{ duration: 0.2 }}
            >
              FoodieExpress
            </motion.h3>
          )}
        </AnimatePresence>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <Nav className="flex-column">
        {[
          {
            path: "/admin/orders",
            icon: <LayoutDashboard size={20} />,
            label: "Đơn hàng",
          },
          {
            path: "/admin/customers",
            icon: <Users size={20} />,
            label: "Khách hàng",
          },
          {
            path: "/admin/billing",
            icon: <FileText size={20} />,
            label: "Hoá đơn",
          },
        ].map((item) => (
          <Nav.Item key={item.path}>
            <NavLink
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.icon}
              <AnimatePresence mode="wait">
                {(!isCollapsed || isHovered) && (
                  <motion.span
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={linkVariants}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </Nav.Item>
        ))}
      </Nav>

      <style>
        {`
          .admin-sidebar {
            height: 100vh;
            background: #fff;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
            position: fixed;
            z-index: 1000;
            overflow: hidden;
            transition: width 0.2s ease;
          }

          .sidebar-header {
            padding: 1.5rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #eee;
            min-height: 73px;
          }

          .brand {
            font-size: 1.25rem;
            margin: 0;
            white-space: nowrap;
          }

          .collapse-btn {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            min-width: 32px;
          }

          .collapse-btn:hover {
            color: #000;
            background: #f8f9fa;
            border-radius: 4px;
          }

          .nav-link {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            color: #666;
            transition: all 0.2s ease;
            text-decoration: none;
            white-space: nowrap;
          }

          .nav-link:hover {
            background: #f8f9fa;
            color: #000;
          }

          .nav-link.active {
            background: #e9ecef;
            color: #0d6efd;
            font-weight: 500;
            border-right: 3px solid #0d6efd;
          }
        `}
      </style>
    </motion.div>
  );
};
