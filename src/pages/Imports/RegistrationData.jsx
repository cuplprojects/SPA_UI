import React, { useEffect, useState } from 'react';

const Registration = ({
  handleFileUpload,
  handleRegistrationUpload,
  selectedFile,
  headers,
  registrationMapping,
  handleRegistrationMappingChange,
  alertMessage,
  alertType,
  loading,
}) => {
  const [isValidData, setIsValidData] = useState(false);

  useEffect(() => {
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.keys(registrationMapping).every(field => headers.includes(registrationMapping[field]));
    setIsValidData(isValid);
  }, [headers, registrationMapping]);

  const mappedHeaders = Object.values(registrationMapping);

  return (
    <>
      <div className="tab-pane active d-flex align-items-center justify-content-around mt-5 py-3" id="registration">
        <h3 className="head fs-3 text-center">Upload Registration Data</h3>
        <div className="d-flex justify-content-center align-items-center">
          <input type="file" onChange={handleFileUpload} accept=".xlsx" />
        </div>
        {headers.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
            <table className="table-bordered table">
              <thead>
                <tr>
                  <th>Application Fields</th>
                  <th>Excel Header</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(registrationMapping).map((field) => (
                  <tr key={field}>
                    <td>{field}</td>
                    <td>
                      <select
                        value={registrationMapping[field]}
                        onChange={(e) => handleRegistrationMappingChange(e, field)}
                      >
                        <option value="">Select Header</option>
                        {headers
                          .filter(header => !mappedHeaders.includes(header) || header === registrationMapping[field])
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
            className="btn btn-primary m-auto"
            onClick={handleRegistrationUpload}
            disabled={ loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
    </>
  );
};

export default Registration;