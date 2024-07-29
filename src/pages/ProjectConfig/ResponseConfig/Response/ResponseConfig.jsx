import React, { useState } from 'react';

const ResponseConfig = () => {
  const [responseOption, setResponseOption] = useState('ABC'); // State for selected response option
  const [numBlocks, setNumBlocks] = useState(4); // State for number of blocks

  const handleResponseOptionChange = (e) => {
    setResponseOption(e.target.value);
  };

  const handleNumBlocksChange = (e) => {
    setNumBlocks(parseInt(e.target.value));
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '2rem' }}>
      <h3>Specifications</h3>
      <h2>Response Selection</h2>
      <div>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            value="ABC"
            checked={responseOption === 'ABC'}
            onChange={handleResponseOptionChange}
          />
          ABC
        </label>
        <label>
          <input
            type="radio"
            value="123"
            checked={responseOption === '123'}
            onChange={handleResponseOptionChange}
          />
          123
        </label>
      </div>

      <h2>Range</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label htmlFor="numBlocks" style={{ marginRight: '10px' }}>
          Number of Blocks:
        </label>
        <select
          id="numBlocks"
          value={numBlocks}
          
          onChange={handleNumBlocksChange}
          style={{ marginRight: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
        >
          {[...Array(15)].map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex' }}>
          {Array.from({ length: numBlocks }, (_, index) => (
            <div
              key={index}
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#ccc',
                marginRight: '10px',
                marginBottom: '10px',
                border: '1px solid #000',
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResponseConfig;
