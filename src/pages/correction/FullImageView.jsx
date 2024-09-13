// import React, { useState, useEffect, useRef } from 'react';
// import './style.css';

// const FullImageView = ({ data, onUpdate, onNext }) => {
//   const [value, setValue] = useState('');
//   const [error, setError] = useState('');
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (data) {
//       setValue(data.fieldNameValue);
//       if (inputRef.current) {
//         inputRef.current.select();
//       }
//     }
//   }, [data]);

//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.select();
//     }
//   }, []);

//   const handleChange = (e) => {
//     const inputValue = e.target.value;
//     setValue(inputValue);

//     // Validate input value on change
//     const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',');
//     const isValid = responses ? responses.includes(inputValue) : true;
//     if (hasValidResponses) {
//       if (!isValid && inputValue) {
//         setError('Invalid input. Please enter a valid option.');
//       } else {
//         setError('');
//       }
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',');
//       const isValid = responses ? responses.includes(e.target.value) : true;

//       if (hasValidResponses) {
//         if (isValid) {
//           onUpdate(value);
//           onNext();
//         } else {
//           setError('Invalid input. Please enter a valid option.');
//         }
//       } else {
//         onUpdate(value);
//         onNext();
//       }
//     }
//   };

//   if (!data || !data.coordinates) {
//     return null;
//   }

//   const { x, y, width, height } = data.coordinates;
//   const originalWidth = 700; // Replace with the original width of your image
//   const imageUrl = data.imageUrl;

//   const responses = data.fieldConfig?.fieldAttributes[0]?.responses?.split(',');
//   const hasValidResponses =
//     responses && responses.length > 0 && !(responses.length === 1 && responses[0] === '');

//   return (
//     <>
//       {error && (
//         <div className="alert alert-info mt-2" role="alert">
//           {error}
//         </div>
//       )}
//       <div
//         className="zoomimg m-auto"
//         style={{
//           position: 'relative',
//           width: `${originalWidth}px`,
//           margin: 'auto',
//         }}
//       >
//         <img
//           src={imageUrl}
//           alt="Full Image"
//           style={{
//             width: `${originalWidth}px`,
//           }}
//         />
//         <div
//           className="form-group"
//           style={{
//             position: 'absolute',
//             top: `${y}px`,
//             left: `${x}px`,
//             width: `${width}px`,
//             height: `${height}px`,
//             border: '2px solid black',
//           }}
//         >
//           <input
//             type="text"
//             ref={inputRef}
//             className="form-control border-danger p-0 text-center"
//             value={value}
//             onChange={handleChange}
//             onKeyDown={handleKeyDown}
//             style={{
//               width: '100%',
//               boxSizing: 'border-box',
//             }}
//             required
//             autoFocus
//             list="suggestions"
//           />
//           {hasValidResponses && (
//             <datalist id="suggestions">
//               {responses.map((response, index) => (
//                 <option key={index} value={response} />
//               ))}
//             </datalist>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default FullImageView;

import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const FullImageView = ({ data, onUpdate, onNext }) => {
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
    const validValues = JSON.parse(data.fieldConfig.FieldAttributesJson)[0]?.Responses?.split(',').map(val => val.trim())

      console.log('Valid Values:', validValues);
    if (e.key === 'Enter') {
      
      if (validValues.includes(e.target.value.trim())) {
        if (JSON.parse(data.fieldConfig.FieldAttributesJson)[0]?.NumberOfBlocks === e.target.value.length ) {
          onUpdate(e.target.value.trim());
        onNext();
        }
        else {
          alert('Please enter the correct number of digits');
        }
        
      } else {
        alert(`Invalid value! Allowed values: ${validValues.join(', ')}`);
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

