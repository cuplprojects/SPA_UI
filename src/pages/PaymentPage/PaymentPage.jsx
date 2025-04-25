import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Navbar, Nav, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './PaymentPage.css';
import Footer from '@/components/wrapper/Footer';
import NavbarComponent from '@/components/wrapper/Navbar';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.selectedPlan || localStorage.getItem('selectedPlan');
  const [loading, setLoading] = useState(false);

  // Mock payment details
  const planDetails = {
    '6-Month': {
      price: '$29.99',
      duration: '6 months'
    },
    '1-Year': {
      price: '$49.99',
      duration: '12 months'
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      navigate('/SuccessPage', { state: { selectedPlan } });
    }, 2000);
  };

  return (
    <div className="payment-page">
      <NavbarComponent/>

      {/* <div className="progress-container bg-light py-3">
        <Container>
          <ProgressBar now={75} className="payment-progress" />
          <div className="d-flex justify-content-between mt-2">
            <div className="progress-step active">Intro</div>
            <div className="progress-step active">Select Plan</div>
            <div className="progress-step active">Register</div>
            <div className="progress-step active">Payment</div>
          </div>
        </Container>
      </div> */}

      <Container className="my-5">
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8} className="text-center">
            <h2 className="display-5 fw-bold mb-3">Complete Your Payment</h2>
            <p className="lead text-secondary mb-3">
              You're almost there! Just one more step to access your subscription.
            </p>
            {selectedPlan && (
              <div className="selected-plan-badge">
                <Badge bg="success" className="px-3 py-2">
                  Selected Plan: {selectedPlan} - {planDetails[selectedPlan]?.price}
                </Badge>
              </div>
            )}
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow mb-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4">Order Summary</h4>
                <div className="d-flex justify-content-between mb-2">
                  <span>Plan:</span>
                  <span className="fw-bold">{selectedPlan}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Duration:</span>
                  <span>{planDetails[selectedPlan]?.duration}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Price:</span>
                  <span>{planDetails[selectedPlan]?.price}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-0">
                  <span className="fw-bold">Total:</span>
                  <span className="fw-bold">{planDetails[selectedPlan]?.price}</span>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4">Payment Details</h4>
                <Form onSubmit={handlePayment}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cardholder Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-person"></i></span>
                      <Form.Control type="text" placeholder="Name on card" required />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                      <Form.Control type="text" placeholder="1234 5678 9012 3456" required />
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiration Date</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                          <Form.Control type="text" placeholder="MM/YY" required />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CVV</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-lock"></i></span>
                          <Form.Control type="text" placeholder="123" required />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Billing Address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                      <Form.Control type="text" placeholder="Enter your billing address" required />
                    </div>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      size="lg"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>Complete Payment</>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Footer Component Here */}
      <Footer />
    </div>
  );
};

export default PaymentPage;
