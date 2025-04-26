import { Button, Popconfirm, Card, Space, Typography} from 'antd';
import React, { useEffect, useState } from 'react';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import { DeleteOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
const Registration = ({
  handleFileUpload,
  handleRegistrationUpload,
  selectedFile,
  handleDeleteRegistration,
  headers,
  registrationMapping,
  handleRegistrationMappingChange,
  registrationCount,
  loading,
}) => {
  const [isValidData, setIsValidData] = useState(false);
  const [count, setCount] = useState([]);
  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();
  const apiurl = import.meta.env.VITE_API_URL;

  useEffect(() => {

    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.keys(registrationMapping).every(field => headers.includes(registrationMapping[field]));
    setIsValidData(isValid);
  }, [headers, registrationMapping]);

  const mappedHeaders = Object.values(registrationMapping);

  return (
    <>
    <Card style={{ margin: '20px auto', maxWidth: 900, padding: 20 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
        Upload Registration
      </Title>
      <Space direction="vertical" style={{ width: '100%' }}>
      <div className="tab-pane active d-flex align-items-center justify-content-around mt-5 py-3" id="registration">
        <h3 className="head fs-3 text-center">Upload Registration Data</h3>
        <div className="d-flex justify-content-center align-items-center">
          <input type="file" onChange={handleFileUpload} accept=".xlsx" />
          {registrationCount > 0 &&
          
            <Popconfirm
              title="Are you sure you want to delete all Registration?"
              onConfirm={handleDeleteRegistration}
              okText="Yes"
              cancelText="No"
            >
              <Button danger >
                <DeleteOutlined />
                Delete All Registration
              </Button>
            </Popconfirm>
          }
        </div>
        {count !== null ? (
          <p className="count-display text-center mt-4">
            Total Registeration: {registrationCount}
          </p>
        ) : (
          <p className="text-center mt-4">Loading count...</p>
        )}
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
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      </Space>
      </Card>
    </>
  );
};

export default Registration;