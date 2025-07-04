import React, { useState, useEffect, useRef } from 'react';
import { notification } from 'antd'; // Import Ant Design notification
import './style.css';

const FullImageView = ({ data, onUpdate, onNext, setIsViewRegData }) => {
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
    const rawValidValues = fieldAttributes?.Responses?.split(',').map(val => val.trim()) || [];
    
    // Filter out blank strings from validValues
    const filteredValidValues = rawValidValues.filter(val => val !== '');
  
    console.log('Filtered Valid Values:', filteredValidValues);
  
    if (e.key === 'Enter') {
      const inputValue = e.target.value.trim();
      
      // Skip validation if filteredValidValues is empty
      const isValidValue = filteredValidValues.length === 0 || filteredValidValues.includes(inputValue);
  
      if (isValidValue) {
        if (fieldAttributes?.NumberOfBlocks == inputValue.length) {
          onUpdate(inputValue);
          onNext();
          setIsViewRegData(false);
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
      className="m-auto zoomimg"
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
        <input
          type="text"
          ref={inputRef}
          className="form-control border-danger text-center p-0"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%', // Make input full width of its container
            boxSizing: 'border-box', // Ensure padding and border are included in width and height
          }}
          required
          autoFocus
        />
      </div>
    </div>
  );
};

export default FullImageView;
