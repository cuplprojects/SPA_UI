import React from 'react';
import './Toolkit.css';

const Toolkit = ({
  onDelete,
  selectedAnnotation,
  selectedInputField,
  inputFields,
  setSelectedInputField,
  annotations,
  setAnnotations,
  mappedFields,
  setMappedFields,
}) => {
  // Function to handle input field change
  const handleInputChange = (event) => {
    const newInputField = event.target.value;
    setSelectedInputField(newInputField); // Update selectedInputField in state

    // Update annotations if a selected annotation exists
    if (selectedAnnotation !== null) {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[selectedAnnotation].FieldName = newInputField;
      setAnnotations(updatedAnnotations); // Update annotations state
      localStorage.setItem('annotations', JSON.stringify(updatedAnnotations)); // Store in localStorage
    }

    // Update mappedFields state to mark the selected input field as mapped
    const updatedMappedFields = { ...mappedFields };
    updatedMappedFields[newInputField] = true; // Assuming true means mapped
    setMappedFields(updatedMappedFields); // Update state of mappedFields
  };

  // Function to handle coordinate and dimension change
  const handleCoordinateChange = (name, value) => {
    if (selectedAnnotation !== null) {
      const updatedAnnotations = [...annotations];
      updatedAnnotations[selectedAnnotation].coordinates[name] = parseInt(value, 10);
      setAnnotations(updatedAnnotations);
      localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
    }
  };

  // Function to handle increment/decrement buttons
  const handleIncrement = (name, incrementValue) => {
    if (selectedAnnotation !== null) {
      const updatedValue = annotations[selectedAnnotation].coordinates[name] + incrementValue;
      handleCoordinateChange(name, updatedValue);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between text-danger mb-3">
        <h2 className="fs-4">{selectedInputField}</h2>
        <button
          className="btn btn-danger m-1 text-end"
          onClick={onDelete}
          disabled={selectedAnnotation === null}
        >
          Delete
        </button>
      </div>
      <hr />
      {selectedAnnotation !== null && (
        <>
          {/* Inputs for coordinates and dimensions */}
          <div className=" coordinate-inputs mt-3">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroup-sizing-default">
                  X
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                name="x"
                aria-label="X"
                aria-describedby="inputGroup-sizing-default"
                value={annotations[selectedAnnotation].coordinates.x}
                onChange={(e) => handleCoordinateChange('x', e.target.value)}
              />
              <br />
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('x', -10)}>
                  -10
                </button>
              </div>
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('x', 10)}>
                  +10
                </button>
              </div>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroup-sizing-default">
                  Y
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                name="y"
                aria-label="Y"
                aria-describedby="inputGroup-sizing-sm"
                value={annotations[selectedAnnotation].coordinates.y}
                onChange={(e) => handleCoordinateChange('y', e.target.value)}
              />
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('y', -10)}>
                  -10
                </button>
              </div>
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('y', 10)}>
                  +10
                </button>
              </div>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroup-sizing-default">
                  Width
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                name="width"
                aria-label="Width"
                aria-describedby="inputGroup-sizing-default"
                value={annotations[selectedAnnotation].coordinates.width}
                onChange={(e) => handleCoordinateChange('width', e.target.value)}
              />
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('width', -10)}>
                  -10
                </button>
              </div>
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('width', 10)}>
                  +10
                </button>
              </div>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroup-sizing-default">
                  Height
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                name="height"
                aria-label="Height"
                aria-describedby="inputGroup-sizing-default"
                value={annotations[selectedAnnotation].coordinates.height}
                onChange={(e) => handleCoordinateChange('height', e.target.value)}
              />
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('height', -10)}>
                  -10
                </button>
              </div>
              <div className="input-group-prepend">
                <button className="btn btn-light" onClick={() => handleIncrement('height', 10)}>
                  +10
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Toolkit;
