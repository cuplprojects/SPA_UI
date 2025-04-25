import React from 'react'
import { Navbar, Container, Button } from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';

const NavbarComponent = () => {
  return (
    <Navbar bg="dark" variant="dark" className="py-3 ">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <Navbar.Brand className="fw-bold">
          <span className="d-block d-md-none">SPA</span>
          <span className="d-none d-md-block">Score Processing Application (SPA)</span>
        </Navbar.Brand>
        <Button variant="outline-light" href="/login" className="d-flex align-items-center gap-2">
          <FaSignInAlt />
          Login
        </Button>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
