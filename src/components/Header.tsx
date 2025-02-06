import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={NavLink} to="/">Lunch Ordering System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/menu">Menu</Nav.Link>
            <Nav.Link as={NavLink} to="/history">Order History</Nav.Link>
            <Nav.Link as={NavLink} to="/summary">Order Summary</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};