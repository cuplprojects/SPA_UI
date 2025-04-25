import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar, Container, Row, Col, Card, Button, Nav, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './SubscriptionPage.css';
import Footer from '@/components/wrapper/Footer';
import NavbarComponent from '@/components/wrapper/Navbar';

const SubscriptionPage = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('selectedPlan', plan);
  };

  const plans = [
    {
      title: '6-Month Plan',
      duration: '6 months',
      price: '$29.99',
      features: ['Process up to 1000 response sheets', 'Access to premium support', 'Basic analytics'],
      plan: '6-Month',
      recommended: false
    },
    {
      title: '1-Year Plan',
      duration: '12 months',
      price: '$49.99',
      features: ['Process up to 2000 sheets', 'Premium support', 'Priority batch processing', 'Advanced analytics'],
      plan: '1-Year',
      recommended: true
    }
  ];

  return (
    <div className="subscription-page">
      <NavbarComponent/>

      {/* <div className="progress-container bg-light py-3">
        <Container>
          <ProgressBar now={(step / 3) * 100} className="subscription-progress" />
          <div className="d-flex justify-content-between mt-2">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>Intro</div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>Select Plan</div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>Register</div>
          </div>
        </Container>
      </div> */}

      <Container className="my-5">
        {step === 1 && (
          <div className="intro-section">
            <Row className="justify-content-center mb-5">
              <Col md={10} lg={8}>
                <div className="text-center mb-5">
                  <h1 className="display-4 fw-bold mb-4">Automated OMR Sheet Processing</h1>
                  <p className="lead text-secondary">
                    Transform your assessment workflow with our advanced OMR scanning solution
                  </p>
                </div>
              </Col>
            </Row>

            <Row className="align-items-center mb-5">
              <Col md={6} className="mb-4 mb-md-0">
                <div className="image-container">
                  <img
                    src="response-sheet-image.jpg"
                    alt="Scanned Response Sheet"
                    className="img-fluid rounded shadow"
                  />
                </div>
              </Col>
              <Col md={6}>
                <h2 className="fw-bold mb-4">What You'll Get</h2>
                <p className="lead">
                  Upload scanned OMR response sheets and let our system take care of everything:
                  from identifying marked corrections to generating precise scores in seconds.
                </p>
                <p>
                  Designed for institutions and educators, this tool helps you manage exams faster and with
                  complete accuracy — no manual checking required.
                </p>
              </Col>
            </Row>

            <Row className="justify-content-center mb-5">
              <Col md={10} lg={12}>
                <div className="how-it-works p-4 bg-light rounded shadow-sm">
                  <h3 className="fw-bold mb-4">How It Works</h3>
                  <div className="d-flex flex-column flex-md-row justify-content-between">
                    <div className="step-item text-center mb-3 mb-md-0">
                      <div className="step-icon">
                        <i className="bi bi-upload fs-1"></i>
                      </div>
                      <h5 className="mt-3">Upload</h5>
                      <p className="small text-secondary">Upload scanned JPG or PDF response sheets</p>
                    </div>
                    <div className="step-item text-center mb-3 mb-md-0">
                      <div className="step-icon">
                        <i className="bi bi-cpu fs-1"></i>
                      </div>
                      <h5 className="mt-3">Process</h5>
                      <p className="small text-secondary">Our system reads answers and corrections</p>
                    </div>
                    <div className="step-item text-center">
                      <div className="step-icon">
                        <i className="bi bi-file-earmark-check fs-1"></i>
                      </div>
                      <h5 className="mt-3">Results</h5>
                      <p className="small text-secondary">Get scores ready for download</p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center mb-5">
              <Col md={10} lg={8}>
                <div className="demo-section text-center">
                  <h4 className="text-secondary mb-3">See it in action</h4>
                  <div className="video-container">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="rounded shadow"
                      style={{ maxWidth: '100%' }}
                    >
                      <source src="/demo-omr-processing.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={6} lg={4} className="text-center">
                <Button
                  variant="primary"
                  size="md"
                  className="p-2 fw-bold"
                  onClick={handleNext}
                >
                  View Plans <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {step === 2 && (
          <div className="plan-selection-section">
            <Row className="justify-content-center mb-5">
              <Col md={10} lg={8} className="text-center">
                <h2 className="display-5 fw-bold mb-3">Choose Your Plan</h2>
                <p className="lead text-secondary mb-5">
                  Select a subscription plan that fits your assessment needs
                </p>
              </Col>
            </Row>

            <Row className="justify-content-center mb-5">
              {plans.map((plan, idx) => (
                <Col md={6} lg={5} xl={4} key={idx} className="mb-4">
                  <Card
                    className={`plan-card h-100 border-0 shadow ${selectedPlan === plan.plan ? 'selected' : ''} ${plan.recommended ? 'recommended' : ''}`}
                  >
                    {plan.recommended && (
                      <div className="recommended-badge">
                        <Badge bg="success" className="position-absolute top-0 end-0 m-3 px-3 py-2">
                          RECOMMENDED
                        </Badge>
                      </div>
                    )}
                    <Card.Body className="p-4 text-center">
                      <h3 className="card-title fw-bold mb-3">{plan.title}</h3>
                      <p className="text-muted">{plan.duration}</p>
                      <h2 className="price fw-bold my-4">{plan.price}</h2>
                      <hr className="my-4" />
                      <ul className="list-unstyled mb-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={selectedPlan === plan.plan ? "primary" : "outline-primary"}
                        className="w-100 py-2"
                        onClick={() => handleSelectPlan(plan.plan)}
                      >
                        {selectedPlan === plan.plan ? 'Selected' : 'Select Plan'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="justify-content-center">
              <Col md={6} className="d-flex justify-content-between">
                <Button
                  variant="outline-secondary"
                  onClick={handlePrevious}
                >
                  <i className="bi bi-arrow-left me-2"></i> Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!selectedPlan}
                >
                  Continue <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {step === 3 && (
          <div className="registration-section">
            <Row className="justify-content-center mb-5">
              <Col md={10} lg={8} className="text-center">
                <h2 className="display-5 fw-bold mb-3">Register Your Account</h2>
                <p className="lead text-secondary mb-3">
                  Create your account to continue with your subscription
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
                    <form>
                      <Row>
                        <Col md={6} className="mb-3">
                          <label htmlFor="firstName" className="form-label">First Name</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-person"></i></span>
                            <input type="text" className="form-control" id="firstName" placeholder="Enter first name" required />
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <label htmlFor="lastName" className="form-label">Last Name</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-person"></i></span>
                            <input type="text" className="form-control" id="lastName" placeholder="Enter last name" required />
                          </div>
                        </Col>
                      </Row>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                          <input type="email" className="form-control" id="email" placeholder="Enter email address" required />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="organization" className="form-label">Organization Name</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-building"></i></span>
                          <input type="text" className="form-control" id="organization" placeholder="Enter organization name" required />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-lock"></i></span>
                          <input type="password" className="form-control" id="password" placeholder="Create a password" required />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-lock"></i></span>
                          <input type="password" className="form-control" id="confirmPassword" placeholder="Confirm your password" required />
                        </div>
                      </div>
                      <div className="d-grid">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => navigate('/PaymentPage', { state: { selectedPlan } })}
                        >
                          Continue to Payment <i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                      </div>
                    </form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={6} className="d-flex justify-content-between">
                <Button
                  variant="outline-secondary"
                  onClick={handlePrevious}
                >
                  <i className="bi bi-arrow-left me-2"></i> Back
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Container>

      {/* Footer Component Here */}
      <Footer />
    </div>
  );
};

export default SubscriptionPage;
