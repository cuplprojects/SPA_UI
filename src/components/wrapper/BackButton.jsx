import React from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page in history
  };

  return (
    <div className="back-button-container d-none d-lg-block mb-4">
      <Button 
        variant="outline-secondary" 
        className="d-flex align-items-center" 
        onClick={handleGoBack}
      >
        <FaArrowLeft className="me-2" />
        Back
      </Button>
    </div>
  );
};

export default BackButton;
