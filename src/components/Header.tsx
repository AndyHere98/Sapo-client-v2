// import React from "react";
// import { Navbar, Nav, Container } from "react-bootstrap";
// import { NavLink } from "react-router-dom";

// export const Header: React.FC = () => {
//   return (
//     <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
//       <Container className="d-flex justify-content-between">
//         <Navbar.Brand as={NavLink} to="/">
//           Tiệm cơm bất ổn
//         </Navbar.Brand>
//         <Container className="d-flex flex-column justify-content-between">
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="me-auto">
//               <Nav.Link as={NavLink} to="/menu">
//                 Menu
//               </Nav.Link>
//               <Nav.Link as={NavLink} to="/history">
//                 Order History
//               </Nav.Link>
//               <Nav.Link as={NavLink} to="/summary">
//                 Order Summary
//               </Nav.Link>
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Container>
//     </Navbar>
//   );
// };

import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaHome, FaBars, FaHistory } from "react-icons/fa";
import { FaLayerGroup } from "react-icons/fa6";
import { BiFoodMenu } from "react-icons/bi";
import { CustomerInfo } from "../types/api";
import { RiAdminFill } from "react-icons/ri";

interface HeaderProps {
  customerInfo: CustomerInfo;
  onGetCustomerInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  customerInfo,
  onGetCustomerInfo,
}) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onGetCustomerInfo();
  }, []);

  return (
    <Navbar
      expand="lg"
      bg="dark"
      variant="dark"
      expanded={expanded}
      className="shadow-sm px-3"
    >
      <Container>
        {/* Logo & Title */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold fs-4 d-flex align-items-center"
        >
          <FaHome className="me-2" />
          Tiệm cơm bất ổn
        </Navbar.Brand>

        {/* Toggle Button */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(expanded ? false : true)}
        >
          <FaBars />
        </Navbar.Toggle>

        {/* Nav Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              as={Link}
              to="/menu"
              className="nav-link-custom"
              onClick={() => setExpanded(false)}
            >
              Menu <BiFoodMenu />
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/history"
              className="nav-link-custom"
              onClick={() => setExpanded(false)}
            >
              Order History <FaHistory />
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/summary"
              className="nav-link-custom"
              onClick={() => setExpanded(false)}
            >
              Order Summary <FaLayerGroup />
            </Nav.Link>
            {customerInfo.isAdmin && (
              <Nav.Link
                as={Link}
                to="/admin"
                className="nav-link-custom"
                onClick={() => setExpanded(false)}
              >
                Admin <RiAdminFill />
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// export default Header;
