import React, { useEffect, useState } from 'react';
import './style.css';
import { Button, Popconfirm, Typography, Space, Card } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';


const { Title, Text } = Typography;

const Absentee = ({
  handleFileUpload,
  handleAbsenteeUpload,
  selectedFile,
  handleDeleteAbsentee,
  headers,
  mapping,
  handleMappingChange,
  loading,
  absenteeCount
}) => {
  const [isValidData, setIsValidData] = useState(false);
  const [count, setCount] = useState([]);
  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();
  const apiurl = import.meta.env.VITE_API_URL;
  console.log(absenteeCount)

  useEffect(() => {

    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.values(mapping).every((value) => headers.includes(value));
    setIsValidData(isValid);
  }, [headers, mapping]);

  // Get already mapped headers
  const mappedHeaders = Object.values(mapping);



  return (
    <>
      <Card style={{ margin: '20px auto', maxWidth: 900, padding: 20 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
          Upload Absentee
        </Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className={`tab-pane active d-flex align-items-center justify-content-around py-3 mt-5`} id="absentee">
            <div className="d-flex justify-content-center align-items-center">
              <p>
                <input type="file" onChange={handleFileUpload} accept=".xlsx" />
              </p>
              {absenteeCount > 0 &&
                <Popconfirm
                  title="Are you sure you want to delete all absentee?"
                  onConfirm={handleDeleteAbsentee}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger >
                    <DeleteOutlined />
                    Delete All Absentee
                  </Button>
                </Popconfirm>

              }
            </div>
            {count !== null ? (
              <p className="count-display text-center mt-4">
                Total Absentee: {absenteeCount}
              </p>
            ) : (
              <p className="text-center mt-4">Loading count...</p>
            )}
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
        </Space>
      </Card>
    </>
  );
};

export default Absentee;
