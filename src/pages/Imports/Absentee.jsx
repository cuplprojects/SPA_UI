import React, { useEffect, useState } from 'react';
import './style.css';
import {
  Button,
  Popconfirm,
  Typography,
  Space,
  Card,
  Row,
  Col,
  Upload,
  Table,
  Select,
  Divider,
  Badge,
  Alert,
  Spin
} from 'antd';
import {
  DeleteOutlined,
  UploadOutlined,
  FileExcelOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

const { Title, Text } = Typography;
const { Option } = Select;

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
  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();
  const apiurl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.values(mapping).every((value) => headers.includes(value));
    setIsValidData(isValid);
  }, [headers, mapping]);

  // Get already mapped headers
  const mappedHeaders = Object.values(mapping);

  // Custom file upload handler to work with Ant Design Upload component
  const customUpload = ({ file }) => {
    const event = { target: { files: [file] } };
    handleFileUpload(event);
  };

  // Create table columns and data for mapping
  const columns = [
    {
      title: 'Model Property',
      dataIndex: 'property',
      key: 'property',
      width: '40%',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Excel Header',
      dataIndex: 'header',
      key: 'header',
      width: '60%',
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          value={mapping[record.property]}
          onChange={(value) => {
            const e = { target: { value } };
            handleMappingChange(e, record.property);
          }}
          placeholder="Select Header"
        >
          <Option value="">Select Header</Option>
          {headers
            .filter(header => !mappedHeaders.includes(header) || header === mapping[record.property])
            .map((header) => (
              <Option key={header} value={header}>
                {header}
              </Option>
            ))}
        </Select>
      )
    }
  ];

  const tableData = Object.keys(mapping).map((property) => ({
    key: property,
    property: property,
    header: mapping[property]
  }));

  return (
    <Card
      className="absentee-card"
      style={{
        margin: '20px auto',
        maxWidth: '100%',
        borderRadius: '8px',
        border: "1px solid #00A76F",
        padding: '24px'
      }}
    >
      <Title
        level={3}
        style={{
          textAlign: 'center',
          marginBottom: 5,
          color: "#00A76F"
        }}
      >
        Upload Absentee
      </Title>

      <Row gutter={[24, 24]} justify="center" className='mb-1'>
        <Col xs={24} md={8} lg={8}>
          <Card
            className="upload-card"
            bordered={false}
            style={{
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Upload.Dragger
              name="file"
              accept=".xlsx"
              showUploadList={false}
              customRequest={customUpload}
            // style={{ padding: '20px 0' }}
            >
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ fontSize: 38, color: '#00A76F' }} />
              </p>
              <p className="ant-upload-text">Click or drag Excel file to upload</p>
              <p className="ant-upload-hint">
                Support for .xlsx files only
              </p>
              {selectedFile && (
                <Alert
                  message={`Selected file: ${selectedFile.name}`}
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Upload.Dragger>

          </Card>
        </Col>

        <Col xs={24} md={8} lg={8}>
          <Card
            className="status-card"
            bordered={false}
            style={{
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Title level={4}>Absentee Status</Title>
            <div style={{ margin: '20px 0' }}>
              <Badge
                count={absenteeCount}
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
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Total Absentee Records</Text>
              </div>
            </div>

            {absenteeCount > 0 && (
              <Popconfirm
                title="Delete all absentee records"
                description="Are you sure you want to delete all absentee records? This action cannot be undone."
                onConfirm={handleDeleteAbsentee}
                okText="Yes, Delete All"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                >
                  Delete All Records
                </Button>
              </Popconfirm>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8} xl={8}>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            size="middle"
            bordered
            className="mapping-table"
            style={{ marginBottom: 14 }}
          />
        </Col>
      </Row>

      {/* {headers.length > 0 && (
        <>
          <Divider orientation="center">
            <Space>
              <InfoCircleOutlined />
              <span>Map Excel Headers to Properties</span>
            </Space>
          </Divider>

         
            <Col xs={24} lg={8} xl={8}>
              <Table

                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                bordered
                className="mapping-table"
                style={{ marginBottom: 14 }}
              />
            </Col>
      
        </>
      )} */}

      {selectedFile && (
        <Row justify="center" style={{ marginTop: 2 }}>
          <Col>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleAbsenteeUpload}
              disabled={loading}
              size="large"
              style={{
                backgroundColor: '#00A76F',
                borderColor: '#00A76F',
                minWidth: '150px'
              }}
            >
              {loading ? <Spin size="small" /> : 'Upload Data'}
            </Button>
            {headers.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text type="danger">Please map all required fields</Text>
              </div>
            )}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default Absentee;
