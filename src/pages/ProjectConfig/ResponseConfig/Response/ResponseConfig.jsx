import React from 'react';

const ResponseConfig = ({ responseOption, setResponseOption, numBlocks, setNumBlocks }) => {
  const responseOptions = ['ABCD', '1234', 'PQRS'];

  const handleResponseOptionChange = (e) => {
    setResponseOption(e.target.value);
  };

  const handleNumBlocksChange = (e) => {
    setNumBlocks(parseInt(e.target.value));
  };

  const generateBlockValues = (responseOption, numBlocks) => {
    const values = [];
    if (responseOption === 'ABCD') {
      for (let i = 0; i < numBlocks; i++) {
        values.push(String.fromCharCode(65 + (i % 26))); // A, B, C, D, etc.
      }
    } else if (responseOption === '1234') {
      for (let i = 0; i < numBlocks; i++) {
        values.push(i + 1); // 1, 2, 3, 4, etc.
      }
    } else if (responseOption === 'PQRS') {
      const startCharCode = 80; // 'P' = 80 in ASCII
      for (let i = 0; i < numBlocks; i++) {
        // Cycle through P, Q, R, S, T...
        values.push(String.fromCharCode(startCharCode + (i % 4))); // 'P', 'Q', 'R', 'S', 'P', 'Q'...
      }
    }
    return values;
  };

  const blockValues = generateBlockValues(responseOption, numBlocks);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f0f0f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', width: '300px', margin: 'auto', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      <h3 style={{ textAlign: 'center', fontSize: '20px', color: '#333', marginBottom: '15px' }}>Specifications</h3>
      
      {/* Response Selection */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Response Selection</h4>
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          {responseOptions.map((option) => (
            <label key={option} style={{ fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="radio"
                value={option}
                checked={option === responseOption}
                onChange={handleResponseOptionChange}
                style={{ marginRight: '5px', transform: 'scale(1.2)' }}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Number of Blocks */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Number of Blocks</h4>
        <select
          id="numBlocks"
          value={numBlocks}
          onChange={handleNumBlocksChange}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '15px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            outline: 'none',
          }}
        >
          {[...Array(15)].map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Render Blocks */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {blockValues.map((value, index) => (
          <div
            key={index}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#009688',
              color: '#fff',
              margin: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'transform 0.3s ease, background-color 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponseConfig;
