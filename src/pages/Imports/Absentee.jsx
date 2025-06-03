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
  Spin,
  Input
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
import axios from 'axios';
import { handleDecrypt } from '@/Security/Security';

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
  const [showAbsenteeList, setShowAbsenteeList] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredAbsentee, setFilteredAbsentee] = useState([]);
  const token = useUserToken();
  const [absentee, setAbsentee] = useState([]);
  const ProjectId = useProjectId();
  const database = useDatabase();
  const apiurl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.values(mapping).every((value) => headers.includes(value));
    setIsValidData(isValid);
  }, [headers, mapping]);

  const mappedHeaders = Object.values(mapping);

  // Custom file upload handler to work with Ant Design Upload component
  const customUpload = ({ file }) => {
    const event = { target: { files: [file] } };
    handleFileUpload(event);
  };

  const getAbsentee = async () => {
    try {
      const response = await axios.get(`${apiurl}/Absentee?WhichDatabase=Local&ProjectId=${ProjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      const decrypted = JSON.parse(handleDecrypt(response.data));

      const dataArray = Array.isArray(decrypted.data) ? decrypted.data : decrypted;
      const transformed = dataArray.map((id, index) => ({
        key: index,  // required by Ant Design
        id: id
      }));
      setAbsentee(transformed);
      setFilteredAbsentee(transformed)
      setShowAbsenteeList(true)
    }
    catch (err) {
      console.error("Failed to fetch absentee", err)
    }
  }

  const absenteeColumns = [
    { title: 'S.No', dataIndex: 'index', key: 'index' },
    { title: 'Roll No', dataIndex: 'id', key: 'id' }
  ]

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
        {showAbsenteeList ? 'Absentee List' : 'Upload Absentee'}
      </Title>
      {showAbsenteeList ? (
        <>
          <Button type="default" onClick={() => setShowAbsenteeList(false)} style={{ marginBottom: 16 }}>
            Back
          </Button>

          {/* Search + Delete Actions */}
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Input
                placeholder="Search by Roll No"
                allowClear
                value={searchText}
                onChange={(e) => {
                  const text = e.target.value;
                  setSearchText(text);
                  const filtered = absentee.filter(item =>
                    item.id.toLowerCase().includes(text.toLowerCase())
                  );
                  setFilteredAbsentee(filtered);
                }}
                style={{ width: 300 }}
              />

            </Col>

            <Col>
              <Popconfirm
                title="Delete selected records?"
                onConfirm={async () => {
                  const selectedIds = selectedRowKeys.map((key) => absentee[key].id);
                  try {
                    const response = await axios.delete(`${apiurl}/Absentee?WhichDatabase=${database}&ProjectId=${ProjectId}&rollno=${selectedIds}`, {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    });
                    getAbsentee();
                    setSelectedRowKeys([]);
                  } catch (err) {
                    console.error("Failed to delete selected records", err);
                  }
                }}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
                disabled={selectedRowKeys.length === 0}
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                >
                  Delete Selected
                </Button>
              </Popconfirm>
            </Col>
          </Row>

          {/* Absentee Table */}
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
            }}
            dataSource={filteredAbsentee.map((item, index) => ({
              ...item,
              key: index,
              index: index + 1
            }))}
            columns={[
              {
                title: 'S.No',
                dataIndex: 'index',
                key: 'index',
                width: '10%',
              },
              {
                title: 'Roll No',
                dataIndex: 'id',
                key: 'id',
                width: '70%',
              },
            ]}
            pagination={{ pageSize: 5, showSizeChanger: true }}
            bordered
          />
        </>

      ) : (
        <>
          <Button type='primary' onClick={getAbsentee}>View Absentee</Button>
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
        </>)}
    </Card>
  );
};

export default Absentee;
