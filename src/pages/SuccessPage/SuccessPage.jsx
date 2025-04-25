import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './SuccessPage.css';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.selectedPlan || localStorage.getItem('selectedPlan');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown to redirect to login page
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/login');
    }
  }, [countdown, navigate]);

  return (
    <div className="success-page">
      <Navbar bg="dark" variant="dark" expand="lg" className="px-4 py-3">
        <Navbar.Brand href="#" className="fw-bold">OMR Scanner</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link href="/login">Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="progress-container bg-light py-3">
        <Container>
          <ProgressBar now={100} className="success-progress" />
          <div className="d-flex justify-content-between mt-2">
            <div className="progress-step active">Intro</div>
            <div className="progress-step active">Select Plan</div>
            <div className="progress-step active">Register</div>
            <div className="progress-step active">Payment</div>
            <div className="progress-step active">Success</div>
          </div>
        </Container>
      </div>

      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow text-center p-5">
              <div className="success-icon mb-4">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <Card.Body>
                <h2 className="display-6 fw-bold mb-3">Payment Successful!</h2>
                <p className="lead text-secondary mb-4">
                  Thank you for subscribing to our {selectedPlan} plan. Your account has been created successfully.
                </p>
                <div className="order-details mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Order ID:</span>
                    <span className="fw-bold">OMR-{Math.floor(Math.random() * 10000)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Plan:</span>
                    <span>{selectedPlan}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Status:</span>
                    <span className="text-success">Paid</span>
                  </div>
                </div>
                <p className="mb-4">
                  We've sent a confirmation email with all the details to your registered email address.
                </p>
                <div className="redirect-message">
                  <p className="text-muted">
                    Redirecting to login page in <span className="fw-bold">{countdown}</span> seconds...
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="mt-2"
                  >
                    Go to Login <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <footer className="bg-dark text-white py-3">
        <Container>
          <Row className="align-items-center">
            <Col md={5} className="mb-2 mb-md-0">
              <div className="d-flex align-items-center">
                <span className="fw-bold me-2 text-white">OMR Scanner</span>
                <span className="small text-white-50">|</span>
                <span className="small text-white-50 mx-2">© {new Date().getFullYear()}</span>
              </div>
            </Col>
            <Col md={4} className="mb-2 mb-md-0">
              <div className="d-flex justify-content-md-center">
                <a href="#" className="text-decoration-none text-white-50 small mx-2">About</a>
                <a href="#" className="text-decoration-none text-white-50 small mx-2">Privacy</a>
                <a href="#" className="text-decoration-none text-white-50 small mx-2">Terms</a>
                <a href="#" className="text-decoration-none text-white-50 small mx-2">Contact</a>
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex justify-content-md-end">
                <a href="#" className="me-3 text-decoration-none text-white-50"><i className="bi bi-facebook"></i></a>
                <a href="#" className="me-3 text-decoration-none text-white-50"><i className="bi bi-twitter"></i></a>
                <a href="#" className="me-3 text-decoration-none text-white-50"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="text-decoration-none text-white-50"><i className="bi bi-instagram"></i></a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default SuccessPage;
