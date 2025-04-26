import React, { useState, useEffect } from 'react';
import {
  Select,
  Button,
  Table,
  Spin,
  Input,
  Space,
  Dropdown,
  Menu,
  notification,
  Card,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Statistic
} from 'antd';
import {
  DownOutlined,
  SaveOutlined,
  FileSearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  TeamOutlined,
  DownloadOutlined,
  DatabaseOutlined,
  OrderedListOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  UserAddOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';
import { useProjectId } from '@/store/ProjectState';
import { useUserInfo, useUserToken } from '@/store/UserDataStore';
import useProject from '@/CustomHooks/useProject';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const apiUrl = import.meta.env.VITE_API_URL;

const fieldTitleMapping = {
  rollNumber: 'Roll Number',
  candidateName: 'Candidate Name',
  fathersName: "Father's Name",
  courseName: 'Course Name',
  omrDataBarCode: 'OMR Data Bar Code',
  marksObtained: 'Marks Obtained',
};

const ReportForm = () => {
  const { userId } = useUserInfo();
  const database = useDatabase();
  const projectId = useProjectId();
  const { projectName } = useProject(projectId);
  const [reportData, setReportData] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [fieldOrder, setFieldOrder] = useState([]);
  const [sortableFields, setSortableFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataKeys, setDataKeys] = useState([]);
  const [showData, setShowData] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isOrderAlready, setIsOrderAlready] = useState(false); // This hook manages the state for checking if the order already exists
  const [existingReportId, setExistingReportId] = useState(0)
  const token = useUserToken()



  useEffect(() => {
    if (selectedFields.length > 0) {
      handleFieldChange(selectedFields);
    }
  }, [selectedFields]);

  useEffect(() => {
    if (projectId) {
      const fetchAssignedUsers = async () => {
        try {
          const response = await axios.get(`${apiUrl}/Projects/users/${projectId}?WhichDatabase=Local`,{
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setAssignedUsers(response.data);
        } catch (error) {
          console.error('Error fetching assigned users:', error);
          setAssignedUsers([]);
        }
      };

      fetchAssignedUsers();
    }
  }, [projectId, token]);

  // Fetch saved sort order from the API when the component mounts
  useEffect(() => {
    fetchSortOrder();
  }, [database, userId]);

  const fetchSortOrder = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/Report?WhichDatabase=${database}&UserId=${userId}`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.length > 0) {
        const savedSortOrder = JSON.parse(JSON.parse(response?.data[0]?.reportData));
        setExistingReportId(response?.data[0]?.reportId)
        setFieldOrder(savedSortOrder);
        setSelectedFields(savedSortOrder)
        setIsOrderAlready(true)
        fetchReportData()
      }
    } catch (error) {
      console.error('Error fetching saved sort order:', error);
    }
  };


  const fetchReportData = async () => {
    setLoading(true);
    try {
        const postdata = {
            fields: ['registrationData', 'score'],
        };
        const response = await axios.post(
            `${apiUrl}/Report/GetFilteredData?WhichDatabase=${database}&ProjectId=${projectId}`,
            postdata, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log('API Response:', response.data);

        // Map through the response data and structure it as desired
        const structuredData = response.data.map((item) => {
            // Destructure and exclude omrData and registrationData
            const { omrData, registrationData, ...rest } = item;

            // Optionally parse omrData if you need it, otherwise leave it out
            const omrParsed = omrData ? JSON.parse(omrData) : {}; // Parse omrData if it's a string

            // Return the desired structure
            return {
                ...rest, // Spread the remaining fields
                ...registrationData, // Spread the fields from registrationData directly
                // Include only the relevant data from omrParsed, or exclude it entirely
                ...omrParsed // If omrParsed contains useful information, spread it here
            };
        });

        console.log('Structured Data:', structuredData);

        setReportData(structuredData);
        setDataKeys(Object.keys(structuredData[0] || {})); // Update dataKeys here
    } catch (error) {
        console.error('Error fetching report data:', error);
    }
    setLoading(false);
};



const handleFieldChange = (fields) => {
  // Update the field order to only include fields that are still selected
  const updatedFieldOrder = fieldOrder.filter(field => fields.includes(field));

  // Only update fieldOrder if it has changed
  if (JSON.stringify(updatedFieldOrder) !== JSON.stringify(fieldOrder)) {
    setFieldOrder(updatedFieldOrder);
  }

  // Create a map of all selected fields
  const fieldsMap = {};
  fields.forEach(field => {
    fieldsMap[field] = true;
  });

  // Create columns based on the field order first, then add any remaining selected fields
  let orderedFields = [];

  // First add fields that are in the order
  updatedFieldOrder.forEach(field => {
    if (fieldsMap[field]) {
      orderedFields.push(field);
      // Remove from map to track which ones we've added
      delete fieldsMap[field];
    }
  });

  // Then add any remaining selected fields that aren't in the order
  fields.forEach(field => {
    if (fieldsMap[field]) {
      orderedFields.push(field);
    }
  });

  // Create the columns in the correct order
  const dynamicColumns = orderedFields.map((field) => {
    return {
      title: fieldTitleMapping[field] || field,
      dataIndex: field,
      key: field,
      sorter: (a, b) => {
        if (typeof a[field] === 'string' && typeof b[field] === 'string') {
          return a[field].localeCompare(b[field]);
        } else if (typeof a[field] === 'number' && typeof b[field] === 'number') {
          return a[field] - b[field];
        }
        return 0;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search ${fieldTitleMapping[field] || field}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record[field]?.toString().toLowerCase().includes(value.toLowerCase()),
    };
  });

  setColumns(dynamicColumns);
  setSortableFields(fields);
};



  const handleFieldOrderChange = (order) => {
    // Update the field order state
    setFieldOrder(order);

    // Get the current selected fields
    const currentFields = selectedFields.length > 0 ? [...selectedFields] : [];

    // Immediately update the columns to reflect the new order
    // This ensures the table updates instantly when the order changes
    handleFieldChange(currentFields);
  };

  const handleSaveOrder = async () => {
    try {
      let response;

      if (isOrderAlready) {
        // If the order already exists, send a PUT request to update it
        response = await axios.put(`${apiUrl}/Report?WhichDatabase=${database}&UserId=${userId}&ReportId=${existingReportId}`, {
          reportId: existingReportId, // You should have an existingReportId to update the correct report
          reportData: JSON.stringify(fieldOrder), // Save the field order as a JSON string
          userId: userId,
        },{
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      } else {
        // If the order does not exist, send a POST request to create a new one
        response = await axios.post(`${apiUrl}/Report?WhichDatabase=${database}&UserId=${userId}`, {
          reportId: 0, // Assuming reportId is 0 for new reports, adjust as needed
          reportData: JSON.stringify(fieldOrder), // Save the field order as a JSON string
          userId: userId,
        },{
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      }

      // Handle response
      if (response.status === 201 || response.status === 204) {
        fetchSortOrder()
        notification.success({
          message: 'Success',
          description: 'Field order saved successfully!',
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to save field order. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error saving field order:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while saving the field order.',
      });
    }
  };



  const sortData = (data) => {
    if (!data || data.length === 0 || fieldOrder.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const field of fieldOrder) {
        // Skip if field doesn't exist in either record
        if (a[field] === undefined || b[field] === undefined) continue;

        // Handle string comparison
        if (typeof a[field] === 'string' && typeof b[field] === 'string') {
          const comparison = a[field].localeCompare(b[field]);
          if (comparison !== 0) return comparison;
        }
        // Handle number comparison
        else if (typeof a[field] === 'number' && typeof b[field] === 'number') {
          if (a[field] < b[field]) return -1;
          if (a[field] > b[field]) return 1;
        }
        // Handle mixed types or other cases
        else {
          const aStr = String(a[field]);
          const bStr = String(b[field]);
          if (aStr < bStr) return -1;
          if (aStr > bStr) return 1;
        }
      }
      return 0;
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');

    const text = `Report For Group ${projectName}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.scaleFactor;
    const xPosition = (pageWidth - textWidth) / 2;

    doc.text(text, xPosition, 20);

    const sortedData = sortData(reportData);

    const tableColumn = ['Serial No.', ...columns.map((col) => col.title)];
    const tableRows = sortedData.map((data, index) => [
      index + 1,
      ...selectedFields.map((field) => data[field]),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 6,
        cellPadding: 2,
        lineColor: [44, 62, 80],
        lineWidth: 0.2,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fontSize: 8,
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        lineColor: [44, 62, 80],
        lineWidth: 0.2,
        halign: 'center',
        valign: 'middle',
      },
      theme: 'striped',
      margin: { top: 20 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

        doc.setFontSize(8);
        const pageNumberText = `Page ${data.pageNumber} of ${totalPagesExp}`;
        const textWidth = doc.getStringUnitWidth(pageNumberText) * doc.internal.scaleFactor;
        const xPosition = pageWidth - textWidth - 10;
        const yPosition = pageHeight - 10;

        doc.text(pageNumberText, xPosition, yPosition);
      },
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(`report_${projectName}.pdf`);
  };

  const downloadExcel = () => {
    const sortedData = sortData(reportData);

    const filteredData = sortedData.map((data) => {
      const rowData = {};
      selectedFields.forEach((field) => {
        rowData[fieldTitleMapping[field] || field] = data[field];
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${projectName}.xlsx`;
    link.click();
  };

  // Menu items for the export dropdown
  const exportMenu = {
    items: [
      {
        key: '1',
        icon: <FilePdfOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />,
        label: <span onClick={downloadPDF}>Download PDF</span>
      },
      {
        key: '2',
        icon: <FileExcelOutlined style={{ fontSize: '18px', color: '#52c41a' }} />,
        label: <span onClick={downloadExcel}>Download Excel</span>
      }
    ]
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={12}>

            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Generate and customize reports for project: <Text strong>{projectName}</Text>
            </Paragraph>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            {assignedUsers.length > 0 && (
              <div style={{ backgroundColor: '#f0f7ff', padding: '5px', borderRadius: '2px', border: '1px solid #d6e4ff' }}>
                <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: '#4b5563' }}>

                  <div style={{
                    backgroundColor: '#1890ff',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '10px',
                    position: 'relative'
                  }}>
                    <TeamOutlined style={{ fontSize: '18px' }} />

                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#ff4d4f',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {assignedUsers.length}
                    </div>
                  </div>
                  Assigned Users:
                </Text>
                <div>
                  {assignedUsers.map((user, index) => {
                    // Use a limited set of professional colors
                    const colors = ['blue', 'cyan', 'green', 'geekblue', 'purple'];
                    const colorIndex = index % colors.length;

                    return (
                      <Tag
                        color={colors[colorIndex]}
                        key={index}
                        style={{
                          margin: '0 4px 8px 0',
                          padding: '4px 10px',
                          borderRadius: '2px',
                          fontSize: '13px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}

                        icon={<UserAddOutlined style={{ marginRight: '4px' }} />}
                      >
                        {user.fullName}
                      </Tag>
                    );
                  })}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <FileSearchOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Data Controls
              </span>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              marginBottom: '24px'
            }}
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<FileSearchOutlined />}
                  onClick={fetchReportData}
                >
                  Fetch Data
                </Button>
                <Button
                  type={showData ? "default" : "primary"}
                  icon={showData ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => setShowData(!showData)}
                >
                  {showData ? 'Hide Data' : 'Show Data'}
                </Button>
                <Dropdown menu={exportMenu} trigger={['click']}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined style={{ fontSize: '16px' }} />}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    Export <DownOutlined style={{ fontSize: '12px', marginLeft: '4px' }} />
                  </Button>
                </Dropdown>
              </Space>
            }
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Text strong style={{ display: 'block', marginBottom: '12px', color: '#4b5563' }}>
                  <EyeOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Select Fields to Display
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select fields to show"
                  value={selectedFields}
                  onChange={setSelectedFields}
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  maxTagCount={5}
                >
                  {dataKeys.map((key) => (
                    <Option key={key} value={key}>
                      {fieldTitleMapping[key] || key}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} lg={12}>
                <Text strong style={{ display: 'block', marginBottom: '12px', color: '#4b5563' }}>
                  <OrderedListOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Select Fields to Order By
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select fields to order"
                  value={fieldOrder}
                  onChange={handleFieldOrderChange}
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  maxTagCount={5}
                  tagRender={(props) => {
                    const { label, value, closable, onClose } = props;
                    const index = fieldOrder.indexOf(value) + 1;
                    return (
                      <Tag
                        color="blue"
                        closable={closable}
                        onClose={onClose}
                        style={{ marginRight: 3 }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            backgroundColor: '#1890ff',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '5px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {index}
                          </span>
                          {label}
                        </span>
                      </Tag>
                    );
                  }}
                >
                  {selectedFields.map((key) => (
                    <Option key={key} value={key}>
                      {fieldTitleMapping[key] || key}
                    </Option>
                  ))}
                </Select>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                  <InfoCircleOutlined style={{ marginRight: '5px', color: '#1890ff' }} />
                  The order of selection determines the sorting priority. Table data will be sorted by these fields in the order shown.
                </Text>
              </Col>
              <Col xs={24} style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveOrder}
                >
                  {isOrderAlready ? 'Update Configuration' : 'Save Configuration'}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          {loading ? (
            <Card
              style={{
                textAlign: 'center',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Spin tip="Loading report data..." />
            </Card>
          ) : (
            showData && reportData.length > 0 && (
              <Card
                title={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <DatabaseOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    Report Data ({reportData.length} records)
                  </span>
                }
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                styles={{ body: { padding: 0 } }}
                extra={
                  <Dropdown menu={exportMenu} trigger={['click']}>
                    <Button
                      type="text"
                      icon={<DownloadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                  </Dropdown>
                }
              >
                <Table
                  columns={columns}
                  dataSource={sortData(reportData)}
                  rowKey={(record, index) => index} // Use index as key to avoid issues with missing id
                  bordered
                  size="middle"
                  scroll={{ x: 'max-content' }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                  }}
                  rowClassName={(record, index) => index % 2 === 0 ? '' : 'ant-table-row-light'}
                />
              </Card>
            )
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ReportForm;