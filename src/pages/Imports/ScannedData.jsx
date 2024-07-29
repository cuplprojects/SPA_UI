import React, { useState, useEffect } from 'react';

const Scanned = ({
  handleFileUpload,
  handleScannedUpload,
  selectedFile,
  alertMessage,
  alertType,
  loading,
  headers,
  fieldMappings,
  handleFieldMappingChange,
}) => {
  const [isValidData, setIsValidData] = useState(false);

  useEffect(() => {
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.keys(fieldMappings).every((field) =>
      headers.includes(fieldMappings[field]),
    );
    setIsValidData(isValid);
  }, [headers, fieldMappings]);

  // Get already mapped headers
  const mappedHeaders = Object.values(fieldMappings);

  return (
    <>
      <div
        className="tab-pane active d-flex align-items-center justify-content-around mt-5 py-3"
        id="scanned"
      >
        <h3 className="head fs-3 text-center">Upload Scanned Data</h3>
        <div className="d-flex justify-content-center align-items-center">
          <p>
            <input type="file" onChange={handleFileUpload} accept=".csv,.dat,.xlsx" />
          </p>
        </div>
        {headers.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
            <table className="table-bordered table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>CSV Header</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(fieldMappings).map((field) => (
                  <tr key={field}>
                    <td>{field}</td>
                    <td>
                      <select
                        value={fieldMappings[field]}
                        onChange={(e) => handleFieldMappingChange(e, field)}
                      >
                        <option value="">Select Header</option>
                        {headers
                          .filter(
                            (header) =>
                              !mappedHeaders.includes(header) || header === fieldMappings[field],
                          )
                          .map((header, index) => (
                            <option key={index} value={header}>
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
      <div className="d-flex justify-content-center mt-4">
        {selectedFile && (
          <button
            className="btn btn-primary"
            onClick={handleScannedUpload}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        )}
        {alertMessage && (
          <div className={`alert alert-${alertType} mt-3`} role="alert">
            {alertMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default Scanned;
