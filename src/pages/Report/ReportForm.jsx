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
        fetchReportData(false) // Don't show success message on automatic load
      }
    } catch (error) {
      console.error('Error fetching saved sort order:', error);
    }
  };


  const fetchReportData = async (showSuccessMessage = false) => {
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

        // Show success notification only when explicitly requested
        if (showSuccessMessage) {
          notification.success({
            message: 'Success',
            description: `Report fetched successfully!`,

          });
        }
    } catch (error) {
        console.error('Error fetching report data:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to fetch report data. Please try again.',
          icon: <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
        });
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
    // Validation
    if (!reportData || reportData.length === 0) {
      notification.warning({
        message: 'No Data',
        description: 'Please fetch data first before exporting to PDF.',
      });
      return;
    }

    if (!selectedFields || selectedFields.length === 0) {
      notification.warning({
        message: 'No Fields Selected',
        description: 'Please select fields to display before exporting to PDF.',
      });
      return;
    }

    try {
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

      // Show success notification
      notification.success({
        message: 'Success',
        description: 'PDF exported successfully!',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      notification.error({
        message: 'Export Error',
        description: 'Failed to export PDF. Please try again.',
      });
    }
  };

  const downloadExcel = () => {
    // Validation
    if (!reportData || reportData.length === 0) {
      notification.warning({
        message: 'No Data',
        description: 'Please fetch data first before exporting to Excel.',
      });
      return;
    }

    if (!selectedFields || selectedFields.length === 0) {
      notification.warning({
        message: 'No Fields Selected',
        description: 'Please select fields to display before exporting to Excel.',
      });
      return;
    }

    try {
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

      // Clean up the URL object
      URL.revokeObjectURL(url);

      // Show success notification
      notification.success({
        message: 'Success',
        description: 'Excel file exported successfully!',
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      notification.error({
        message: 'Export Error',
        description: 'Failed to export Excel file. Please try again.',
      });
    }
  };

  // Menu items for the export dropdown
  const exportMenu = {
    items: [
      {
        key: '1',
        icon: <FilePdfOutlined style={{ fontSize: '30px', color: '#ff4d4f' }} />,
       
        onClick: downloadPDF
      },
      {
        key: '2',
        icon: <FileExcelOutlined style={{ fontSize: '30px', color: '#52c41a' }} />,
       
        onClick: downloadExcel
      }
    ]
  };

  return (
    <div >
      {/* Single Main Container with Simple Border */}
      <div style={{
        border: '2px solid silver',
        borderRadius: '8px',
        backgroundColor: 'white',
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>

        {/* Header Section */}
        <div style={{
          borderBottom: '1px solid #e8e8e8',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} lg={16}>
              
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Generate and customize reports for project: <Text >{projectName}</Text>
              </Text>
            </Col>
            <Col xs={24} lg={8}>
              {assignedUsers.length > 0 && (
                <div style={{
                  textAlign: 'right',
                  padding: '6px',
                  backgroundColor: '#f0f7ff',
                  borderRadius: '5px',
                  border: '2px solid #d6e4ff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <TeamOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '8px' }} />
                    <Text strong style={{ color: '#1890ff' }}>
                      Assigned Users ({assignedUsers.length})
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {assignedUsers.map((user, index) => {
                      const colors = ['blue', 'cyan', 'green', 'geekblue', 'purple'];
                      const colorIndex = index % colors.length;
                      return (
                        <Tag
                          color={colors[colorIndex]}
                          key={index}
                          style={{
                            margin: '2px',
                            fontSize: '12px'
                          }}
                          icon={<UserAddOutlined />}
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
        </div>

        {/* Controls Section */}
        <div style={{
          borderBottom: '1px solid #e8e8e8',
          paddingBottom: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Space size="middle">
              <Button
                type="primary"
                icon={<FileSearchOutlined style={{ color: 'white' }} />}
                onClick={() => fetchReportData(true)}
                size="large"
              >
                Fetch Data
              </Button>
              <Button
                type={showData ? "default" : "primary"}
                icon={showData ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowData(!showData)}
                size="large"
              >
                {showData ? 'Hide Data' : 'Show Data'}
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveOrder}
                size="large"
              >
                {isOrderAlready ? 'save' : 'Update'}
              </Button>
            </Space>

            <Dropdown
              menu={exportMenu}
              trigger={['click']}
              disabled={!reportData || reportData.length === 0 || !selectedFields || selectedFields.length === 0}
            >
              <Button
                type="primary"
                icon={<DownloadOutlined style={{ fontSize: '16px', color: 'white' }} />}
                size="large"
                style={{ display: 'flex', alignItems: 'center' }}
                disabled={!reportData || reportData.length === 0 || !selectedFields || selectedFields.length === 0}
              >
                Export <DownOutlined style={{ fontSize: '12px', marginLeft: '4px' }} />
              </Button>
            </Dropdown>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={6}>
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ display: 'block', marginBottom: '12px',  fontSize: '16px' }}>
                  <EyeOutlined style={{ marginRight: '8px' }} />
                  Select Fields to Display
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', minHeight: '40px' }}
                  placeholder="Select fields to show"
                  value={selectedFields}
                  onChange={setSelectedFields}
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  maxTagCount={5}
                  size="large"
                >
                  {dataKeys.map((key) => (
                    <Option key={key} value={key}>
                      {fieldTitleMapping[key] || key}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} lg={6}>
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ display: 'block', marginBottom: '12px',  fontSize: '16px' }}>
                  <OrderedListOutlined style={{ marginRight: '8px' }} />
                  Select Fields to Order By
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', minHeight: '40px' }}
                  placeholder="Select fields to order"
                  value={fieldOrder}
                  onChange={handleFieldOrderChange}
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  maxTagCount={5}
                  size="large"
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
              </div>
            </Col>
          </Row>
        </div>

        {/* Data Display Section */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px dashed #d9d9d9'
          }}>
            <Spin size="large" tip="Loading report data..." />
          </div>
        ) : (
          showData && reportData.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #e8e8e8'
              }}>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  <DatabaseOutlined style={{ marginRight: '8px' }} />
                  Report Data
                  <Tag color="blue" style={{ marginLeft: '12px', fontSize: '14px' }}>
                    {reportData.length} records
                  </Tag>
                </Title>
               
              </div>

              <div style={{
                border: '1px solid #e8e8e8',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <Table
                  columns={columns}
                  dataSource={sortData(reportData)}
                  rowKey={(record, index) => index}
                  bordered={false}
                  size="middle"
                  scroll={{ x: 'max-content' }}
                  pagination={{
                    pageSize: 15,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    style: { padding: '16px', backgroundColor: '#fafafa' }
                  }}
                  style={{ backgroundColor: 'white' }}
                />
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default ReportForm;