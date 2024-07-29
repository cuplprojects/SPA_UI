import React, { useEffect, useState } from 'react';
import './style.css';

const Absentee = ({
  handleFileUpload,
  handleAbsenteeUpload,
  selectedFile,
  headers,
  mapping,
  handleMappingChange,
  loading,
  alertMessage,
  alertType,
}) => {
  const [isValidData, setIsValidData] = useState(false);

  useEffect(() => {
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.values(mapping).every((value) => headers.includes(value));
    setIsValidData(isValid);
  }, [headers, mapping]);

  // Get already mapped headers
  const mappedHeaders = Object.values(mapping);

  return (
    <>
      <div className={`tab-pane active d-flex align-items-center justify-content-around py-3 mt-5`} id="absentee">
        <h3 className="head text-center fs-3">Upload Absentee</h3>
        <div className="d-flex justify-content-center align-items-center">
          <p>
            <input type="file" onChange={handleFileUpload} accept=".xlsx" />
          </p>
        </div>
        {headers.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Model Property</th>
                  <th>Excel Header</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(mapping).map((property) => (
                  <tr key={property}>
                    <td>{property}</td>
                    <td>
                      <select value={mapping[property]} onChange={(e) => handleMappingChange(e, property)}>
                        <option value="">Select Header</option>
                        {headers.filter(header => !mappedHeaders.includes(header) || header === mapping[property]).map((header, index) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedFile && (
        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-primary" onClick={handleAbsenteeUpload} disabled={loading}>
            {loading ? 'Uploading' : 'Upload'}
          </button>
        </div>
      )}
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
    </>
  );
};

export default Absentee;
