import React from "react";
import { Modal, Button } from "react-bootstrap";

const AnnotationFieldModal = ({ inputFields, mappedFields, setSelectedInputField, showModal, setShowModal }) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Select Input Field</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {inputFields.map((field) => (
            <li key={field}>
              <Button
                onClick={() => setSelectedInputField(field)}
                disabled={mappedFields[field]} // Disable the button if the field is already mapped
              >
                {field}
              </Button>
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AnnotationFieldModal;
