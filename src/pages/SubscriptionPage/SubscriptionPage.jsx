import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SubscriptionPage.css';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    setStep(2);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };


  const handleStartSubscription = () => {
    alert('Redirecting to login or sign-up page...');
  };

  return (
    <div className="subscription-page">
      <header className="bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="h4 mb-0">YourLogo</div>
        <nav>
          <a className="text-white mx-2" href="#">Login / Sign Up</a>
        </nav>
      </header>

      <main className="container my-5">
        {step === 1 && (
          <section className="product-details text-center my-5 px-3 px-md-5">
            <h2 className="fw-bold mb-4">What You'll Get</h2>

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-4 mb-4">
              <img
                src="response-sheet-image.jpg"
                alt="Scanned Response Sheet"
                className="img-fluid shadow rounded"
                style={{ maxWidth: '400px' }}
              />
              <div className="text-start" style={{ maxWidth: '500px' }}>
                <p className="lead">
                  Upload scanned OMR response sheets and let our AI-powered system take care of everything:
                  from identifying marked corrections to generating precise scores in seconds.
                </p>
                <p>
                  Designed for institutions and educators, this tool helps you manage exams faster and with
                  complete accuracy — no manual checking required.
                </p>
              </div>
            </div>

            <h3 className="fw-semibold mt-5 mb-3">How It Works</h3>
            <ol className="text-start mx-auto" style={{ maxWidth: '500px' }}>
              <li><strong>Step 1:</strong> Upload scanned JPG or PDF response sheets.</li>
              <li><strong>Step 2:</strong> Our system reads answers and any corrections.</li>
              <li><strong>Step 3:</strong> Final scores are generated and ready for download or review.</li>
            </ol>

            <div className="mt-5">
              <button
                className="btn btn-lg btn-danger px-4 py-2"
                onClick={handleNext}
                style={{ transition: '0.3s' }}
              >
                Next <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>

            {/* Optional: Animated demo below the button */}
            <div className="mt-5">
              <h5 className="text-muted mb-3">See it in action</h5>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="shadow rounded"
                style={{ maxWidth: '600px', width: '100%' }}
              >
                <source src="/demo-omr-processing.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </section>
        )}

        {step === 2 && (
          <>
            <div> <section className="hero text-white text-center d-flex flex-column justify-content-center align-items-center px-3">
              <h1 className="display-4 fw-bold">Start Processing OMR Sheets Effortlessly</h1>
              <p className="lead mt-3 mb-4">Choose a plan that fits your assessment needs.</p>
              <button className="btn btn-danger btn-lg" onClick={handleStartSubscription}>
                Start Your Subscription
              </button>
            </section>
              <div className="row justify-content-center">
                {[
                  {
                    title: '6-Month Plan',
                    duration: '6 months',
                    price: '$29.99',
                    features: ['✔ Process up to 1000 response sheets', '✔ Access to premium support'],
                    plan: '6-Month'
                  },
                  {
                    title: '1-Year Plan',
                    duration: '12 months',
                    price: '$49.99',
                    features: ['✔ Process up to 2000 sheets', '✔ Premium support', '✔ Priority batch processing'],
                    plan: '1-Year'
                  }
                ].map(({ title, duration, price, features, plan }, idx) => (
                  <div className="col-md-5 col-lg-4 mb-4" key={idx}>
                    <div className="card h-100 shadow plan-card border-0">
                      <div className="card-body text-center">
                        <h3 className="card-title">{title}</h3>
                        <p className="text-muted">{duration}</p>
                        <h4 className="text-primary fw-bold">{price}</h4>
                        <ul className="list-unstyled mt-3 mb-4">
                          {features.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                        <button className="btn btn-outline-primary" onClick={() => handleSelectPlan(plan)}>Select Plan</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-4">
              <button
                className="btn btn-success btn-lg"
                onClick={() => navigate('/RegistrationPage', { state: { selectedPlan } })}
                disabled={!selectedPlan}
              >
                Next
              </button>
              <p className="mt-2">Already have an account? <a href="/login">Login</a></p>
            </div>


          </>
        )}

      </main>

      <footer className="bg-dark text-white text-center py-4">
        <p className="mb-2">About Us | Privacy | Terms | Contact</p>
        <div>
          <a className="text-white mx-2" href="#">Facebook</a>
          <a className="text-white mx-2" href="#">Twitter</a>
          <a className="text-white mx-2" href="#">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
};

export default SubscriptionPage;
