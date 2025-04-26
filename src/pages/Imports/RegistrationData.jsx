import { Button, Popconfirm, Card, Space, Typography, Badge } from 'antd';
import React, { useEffect, useState } from 'react';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Upload } from '@/components/upload';
import { Col, Row } from 'react-bootstrap';

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
      <Card style={{ margin: '20px auto', maxWidth: 900, padding: 20, border: "1px solid #00A76F" }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 20, color: "#00A76F" }}>
          Upload Registration Records
        </Title>
        <div style={{ width: '100%' }} className='container'>
          <Row>
            <Col md={4}>
              <Row>
                <Col md={12}>
                  <div className="d-flex justify-content-center align-items-center">
                    <Upload
                      accept=".xlsx"
                      beforeUpload={(file) => {
                        handleFileUpload({ target: { files: [file] } });
                        return false;
                      }}
                      onRemove={() => {
                        handleFileUpload({ target: { files: [] } });
                        return true;
                      }}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                        Select Excel File
                      </Button>
                    </Upload>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  {registrationCount !== null ? (
                    <p className="count-display text-center mt-4 mb-2 font-bold">
                      Total Registration records: <br />
                      <Badge
                        count={registrationCount}
                        showZero
                        overflowCount={9999}
                        style={{
                          backgroundColor: '#00A76F',
                          fontSize: '16px',
                          padding: '0 12px',
                          height: '28px',
                          lineHeight: '28px'
                        }}
                      />
                    </p>
                  ) : (
                    <p className="text-center mt-4">Loading count...</p>
                  )}
                </Col>
              </Row>

              {/* Delete All Records Button */}
              <Row>
                <Col md={12} className='d-flex justify-content-center'>
                  {registrationCount > 0 &&
                    <Popconfirm
                      title="Are you sure you want to delete all Registration?"
                      onConfirm={handleDeleteRegistration}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button danger>
                        <DeleteOutlined />
                        Delete All Records
                      </Button>
                    </Popconfirm>
                  }
                </Col>
              </Row>
              
            </Col>


            <Col md={8}>
              <table className="table-bordered table" style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Field</th>
                    <th style={{ width: '50%' }}>Excel Header</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(registrationMapping).map((field) => (
                    <tr key={field}>
                      <td style={{ wordWrap: 'break-word' }}>{field}</td>
                      <td style={{ wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <select
                          value={registrationMapping[field]}
                          onChange={(e) => handleRegistrationMappingChange(e, field)}
                          style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          <option value="">Select Header</option>
                          {headers
                            .filter(
                              (header) =>
                                !Object.values(registrationMapping).includes(header) || header === registrationMapping[field],
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
            </Col>

          </Row>

          {/* Upload button */}
          <div className="d-flex justify-content-center mt-4">
            {selectedFile && ( 
              <Button
                type="primary"
                onClick={handleRegistrationUpload}
                disabled={loading}
                icon={<UploadOutlined />}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default Registration;