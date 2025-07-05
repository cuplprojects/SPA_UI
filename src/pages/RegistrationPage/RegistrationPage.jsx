import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge } from 'react-bootstrap';

import Footer from '@/components/wrapper/Footer';
import NavbarComponent from '@/components/wrapper/Navbar';
import BackButton from '@/components/wrapper/BackButton';

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.selectedPlan || localStorage.getItem('selectedPlan');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });

    // Clear error when user types
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z. ]*$/.test(formData.firstName)) {
      newErrors.firstName = 'Please enter a valid name';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z. ]*$/.test(formData.lastName)) {
      newErrors.lastName = 'Please enter a valid name';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate organization
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization name is required';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);

      // Store user data in localStorage for demo purposes
      localStorage.setItem('userData', JSON.stringify({
        ...formData,
        plan: selectedPlan
      }));

      // Simulate API call delay
      setTimeout(() => {
        setLoading(false);
        navigate('/PaymentPage', { state: { selectedPlan } });
      }, 1500);
    }
  };

  const handlePrevious = () => {
    navigate('/SubscriptionPage');
  };

  return (
    <div className="registration-page">
      <NavbarComponent/>

      <div className="progress-container bg-light py-3">
        <Container>
          <ProgressBar now={66} className="registration-progress" />
          <div className="d-flex justify-content-between mt-2">
            <div className="progress-step active">Intro</div>
            <div className="progress-step active">Select Plan</div>
            <div className="progress-step active">Register</div>
            <div className="progress-step">Payment</div>
          </div>
        </Container>
      </div>

      <Container className="my-5">
        <BackButton />

        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8} className="text-center">
            <h2 className="display-5 fw-bold mb-3">Create Your Account</h2>
            <p className="lead text-secondary mb-3">
              Register to continue with your subscription
            </p>
            {selectedPlan && (
              <div className="selected-plan-badge">
                <Badge bg="success" className="px-3 py-2">
                  Selected Plan: {selectedPlan}
                </Badge>
              </div>
            )}
          </Col>
        </Row>

        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-person"></i></span>
                          <Form.Control
                            type="text"
                            id="firstName"
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChange={handleChange}
                            isInvalid={!!errors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.firstName}
                          </Form.Control.Feedback>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-person"></i></span>
                          <Form.Control
                            type="text"
                            id="lastName"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            isInvalid={!!errors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.lastName}
                          </Form.Control.Feedback>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <Form.Control
                        type="email"
                        id="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Organization Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-building"></i></span>
                      <Form.Control
                        type="text"
                        id="organization"
                        placeholder="Enter organization name"
                        value={formData.organization}
                        onChange={handleChange}
                        isInvalid={!!errors.organization}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organization}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  {/* <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <Form.Control
                        type="password"
                        id="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <Form.Control
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group> */}
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
                        <>Continue to Payment <i className="bi bi-arrow-right ms-2"></i></>
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

export default RegisterPage;
