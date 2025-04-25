import React from 'react'
import { Container, Row, Col, Card, Button, Nav, Navbar } from 'react-bootstrap';
const NavbarComponent = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-4 py-3 sticky-top">
      <Navbar.Brand href="#" className="fw-bold">OMR Scanner</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
          <Nav.Link href="/login">Login</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default NavbarComponent
