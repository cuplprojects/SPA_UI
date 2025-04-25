import { Button, Card, Popconfirm, Space, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Upload } from '@/components/upload';

const { Title, Text } = Typography;
const Scanned = ({
  handleFileUpload,
  handleScannedUpload,
  selectedFile,
  handleDeleteScanned,
  loading,
  headers,
  fieldMappings,
  handleFieldMappingChange,
  scannedCount
}) => {
  const [isValidData, setIsValidData] = useState(false);
  const [count, setCount] = useState([]);
  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();
  const apiurl = import.meta.env.VITE_API_URL;

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
      <Card style={{ margin: '20px auto', maxWidth: 900, padding: 20 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
          Upload Scanned Records
        </Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div
            className="tab-pane active d-flex align-items-center justify-content-around mt-5 py-3"
            id="scanned"
          >
            <div className="d-flex justify-content-center align-items-center">
              <p>
                <input type="file" onChange={handleFileUpload} accept=".csv" />
              </p>
            </div>
            {count !== null ? (
              <p className="count-display text-center mt-4">
                Total Scanned records: {scannedCount}
              </p>
            ) : (
              <p className="text-center mt-4">Loading count...</p>
            )}
            {scannedCount > 0 &&
              <Popconfirm
                title="Are you sure you want to delete all absentee?"
                onConfirm={handleDeleteScanned}
                okText="Yes"
                cancelText="No"
              >
                <Button danger >
                  <DeleteOutlined />
                  Delete All Records
                </Button>
              </Popconfirm>
            }
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

          </div>
        </Space>
      </Card>
    </>
  );
};

export default Scanned;
