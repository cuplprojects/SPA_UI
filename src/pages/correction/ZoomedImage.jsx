
import React, { useState, useEffect } from 'react';
import { notification, Select } from 'antd'; // Import Select from antd
import './style.css';

const { Option } = Select;

const ZoomedImage = ({ data, onUpdate, onNext, handleClose }) => {
  const [selectedResponse, setSelectedResponse] = useState('');

  useEffect(() => {
    if (data) {
      setSelectedResponse(data.fieldNameValue);
    }
  }, [data]);

  const handleChange = (newValue) => {
    setSelectedResponse(newValue);
    onUpdate(newValue);
  };

  const handleKeyDown = (e) => {
    const fieldAttributes = JSON.parse(data.fieldConfig.FieldAttributesJson)[0];
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
    onNext();
    return null;
  }

  const { x, y, width, height } = data.coordinates;
  const scale = 700 / width; // Assuming the original image width is 700px

  return (
    <div
      className="zoomimg m-auto"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(2)`,
        width,
        height,
        overflow: 'hidden',
      }}
    >
      <img
        src={data.imageUrl}
        alt="Zoomed Image"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${x / scale}px ${y / scale}px`,
          position: 'relative',
          left: `-${x / scale}px`,
          top: `-${y / scale}px`,
        }}
      />
      <div
        className="form-group"
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        {data.responses ? (
          <Select
            value={selectedResponse}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ width: '100%' }}
          >
            <Option value="">Select an option</Option>
            {data.responses.split(',').map((response, index) => (
              <Option key={index} value={response.trim()}>
                {response.trim()}
              </Option>
            ))}
          </Select>
        ) : (
          <div className="input-group">
            {data?.FieldName === 'Answers' &&
              (() => {
                const match = data?.remarks?.match(/question[:\s]+(\d+)/i);
                const questionNumber = match ? parseInt(match[1], 10) : null;
                
                // Extract scanned answer from remarks
                const scannedMatch = data?.remarks?.match(/ScannedAns\s*:\s*([A-Z])/i);
                const scannedAnswer = scannedMatch ? scannedMatch[1] : null;

                return (
                  <div className="input-group-prepend">
                    <div className="input-group-text">
                      Q.No.: {questionNumber ?? 'N/A'}{scannedAnswer ? ` (${scannedAnswer})` : ''}
                    </div>
                  </div>
                );
              })()}

            <input
              type="text"
              className="form-control border-danger p-0 text-center"
              value={selectedResponse}
              onChange={(e) => setSelectedResponse(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomedImage;
