import { Badge, Button, Card, Popconfirm, Space, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Upload } from '@/components/upload';
import { Col, Row } from 'react-bootstrap';

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
  scannedCount,
  fileList,
  setFileList,
  setSelectedFile
}) => {
  const [isValidData, setIsValidData] = useState(false);
  const [count, setCount] = useState([]);
  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();
  const apiurl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const isValid = Object.keys(fieldMappings).every((field) =>
      headers.includes(fieldMappings[field]),
    );
    setIsValidData(isValid);
  }, [headers, fieldMappings]);



  const mappedHeaders = Object.values(fieldMappings);

  return (
    <>
      <Card style={{ margin: '20px auto', maxWidth: 900, padding: 20, border: "1px solid #00A76F" }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 20, color: "#00A76F" }}>
          Upload Scanned Records
        </Title>
        <div style={{ width: '100%' }} className='container'>
          <Row>
            <Col md={selectedFile ? 4 : 6} >
              <Row >
                <Col md={12}>
                  <div className="d-flex justify-content-center align-items-center">
                    <Upload
                      accept=".csv"
                      beforeUpload={(file) => {
                        handleFileUpload({ target: { files: [file] } });
                        setFileList([file]);
                        return false; // Prevent automatic upload
                      }}
                      fileList={fileList} // Control the file list explicitly
                      onRemove={() => {
                        setSelectedFile(null);
                        setFileList([]);
                      }}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                        Select CSV File
                      </Button>
                    </Upload>
                  </div>
                </Col>
              </Row>
              {selectedFile && (
                <Row>
                  <Col md={12}>
                    {count !== null ? (
                      <p className="count-display text-center mt-4 mb-2 font-bold">
                        Total Scanned records: <br />
                        <Badge
                          count={scannedCount}
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
                      <div>
                        <p className="text-center mt-4">Loading count...</p>

                      </div>
                    )}
                  </Col>
                </Row>
              )}
              {selectedFile && (
                <Row>
                  <Col md={12} className='d-flex justify-content-center'>
                    {scannedCount > 0 &&
                      <Popconfirm
                        title="Are you sure you want to delete all absentee?"
                        onConfirm={handleDeleteScanned}
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
              )}

            </Col>
            {selectedFile ?
              <>
                <Col md={8} className="d-flex justify-content-center">
                  <table className="table-bordered table" style={{ width: '100%', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>Field</th>
                        <th style={{ width: '50%' }}>CSV Header</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(fieldMappings).map((field) => (
                        <tr key={field}>
                          <td style={{ wordWrap: 'break-word' }}>{field}</td>
                          <td style={{ wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <select
                              value={fieldMappings[field]}
                              onChange={(e) => handleFieldMappingChange(e, field)}
                              style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              <option value="">Select Header</option>
                              {headers
                                .filter(
                                  (header) =>
                                    !mappedHeaders.includes(header) || header === fieldMappings[field],
                                )
                                .map((header, index) => (
                                  <option key={index} value={header} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {header}
                                  </option>
                                ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* <div className="d-flex justify-content-center mt-4">
                    {selectedFile && (
                      <button
                        className="btn btn-primary"
                        onClick={handleScannedUpload}
                        disabled={loading}
                      >
                        {loading ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                  </div> */}
                </Col>
              </> :
              <>
                <Col md={6}>
                  {count !== null ? (
                    <p className="count-display text-center mt-4 mb-2 font-bold">
                      Total Scanned records: <br />
                      <Badge
                        count={scannedCount}
                        showZero
                        overflowCount={9999}
                        style={{
                          backgroundColor: '#00A76F',
                          fontSize: '16px',
                          padding: '0 12px',
                          height: '28px',
                          lineHeight: '28px',
                          marginBottom: '5px'
                        }}
                      />
                      <br />
                      {scannedCount > 0 &&
                        <Popconfirm
                          title="Are you sure you want to delete all absentee?"
                          onConfirm={handleDeleteScanned}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button danger>
                            <DeleteOutlined />
                            Delete All Records
                          </Button>
                        </Popconfirm>
                      }
                    </p>
                  ) : (
                    <p className="text-center mt-4">Loading count...</p>
                  )}
                </Col>
              </>}

          </Row>

          {/* Upload button */}
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
        </div>
      </Card>
    </>
  );
};

export default Scanned;
