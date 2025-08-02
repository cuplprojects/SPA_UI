import React, { useState, useEffect, useRef } from 'react';
import { notification } from 'antd'; // Import Ant Design notification
import './style.css';

const FullImageView = ({ data, onUpdate, onNext, handleClose }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Update value when data changes
  useEffect(() => {
    if (data) {
      setValue(data.fieldNameValue);
      // Select the input text when data changes
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [data]);

  // Select input text on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    const fieldAttributes = JSON.parse(data?.fieldConfig.FieldAttributesJson)[0];
    const rawValidValues = fieldAttributes?.Responses?.split(',').map((val) => val.trim()) || [];

    // Filter out blank strings from validValues
    const filteredValidValues = rawValidValues.filter((val) => val !== '');

    console.log('Filtered Valid Values:', filteredValidValues);

    if (e.key === 'Enter') {
      const inputValue = e.target.value.trim();

      // Skip validation if filteredValidValues is empty
      const isValidValue =
        filteredValidValues.length === 0 || filteredValidValues.includes(inputValue);

      if (isValidValue) {
        if (fieldAttributes?.NumberOfBlocks == inputValue.length) {
          onUpdate(inputValue);
          onNext();
          handleClose();
        } else {
          // Using Ant Design's notification
          notification.error({
            message: 'Input Error',
            description: 'Please enter the correct number of digits.',
            duration: 5, // Display duration in seconds
          });
        }
      } else {
        // Using Ant Design's notification
        notification.error({
          message: 'Invalid Value',
          description: `Invalid value! Allowed values: ${filteredValidValues.join(', ')}`,
          duration: 5, // Display duration in seconds
        });
      }
    }
  };

  if (!data || !data.coordinates) {
    return null; // Handle case where data or coordinates are not yet available
  }

  const { x, y, width, height } = data.coordinates;
  const originalWidth = 700; // Replace with the original width of your image
  const imageUrl = data.imageUrl; // Ensure data includes imageUrl

  return (
    <div
      className="zoomimg m-auto"
      style={{
        position: 'relative',
        width: `${originalWidth}px`, // Set the width of the container to the original image width
        margin: 'auto',
      }}
    >
      <img
        src={imageUrl}
        alt="Full Image"
        style={{
          width: `${originalWidth}px`, // Set the image width to the original image width
        }}
      />
      <div
        className="form-group"
        style={{
          position: 'absolute',
          top: `${y}px`, // Adjust top position to match annotation y-coordinate
          left: `${x}px`, // Adjust left position to match annotation x-coordinate
          width: `${width}px`, // Set width to match annotation width
          height: `${height}px`, // Set height to match annotation height
          border: '2px solid black',
        }}
      >
        <div className="input-group">
          {data?.FieldName === 'Answers' &&
            (() => {
              const match = data?.remarks?.match(/Question[:\s]+(\d+)/i);
              const questionNumber = match ? parseInt(match[1], 10) : null;
              
              // Extract scanned answer from remarks
              const scannedMatch = data?.remarks?.match(/ScannedAns\s*:\s*([A-Z])/i);
              const scannedAnswer = scannedMatch ? scannedMatch[1] : null;

              console.log('Extracted Q.No.:', questionNumber, 'Scanned Answer:', scannedAnswer, 'from remarks:', data?.remarks);

              return (
                <div className="input-group-prepend">
                  <div className="input-group-text fw-bold bg-success text-white">
                    Q.No: {questionNumber ?? 'N/A'} Scanned:{scannedAnswer ? ` (${scannedAnswer})` : ''}
                  </div>
                </div>
              );
            })()}

          <input
            id="inlineFormInputGroup"
            type="text"
            ref={inputRef}
            className="form-control border-danger p-0 text-center"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{
              boxSizing: 'border-box',
            }}
            required
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default FullImageView;
