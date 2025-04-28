import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  message,
  Dropdown,
  Input,
  Table,
  Select,
  Spin,
  notification,
  Space,
  Statistic,
  Divider
} from 'antd';
import {
  FilePdfOutlined,
  FileExcelOutlined,
  DownOutlined,
  DownloadOutlined,
  FlagOutlined,
  DatabaseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  OrderedListOutlined,
  FileSearchOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { fetchUserName } from '@/CustomHooks/useUserName';
import { useUserToken } from '@/store/UserDataStore';

const { Title, Text, Paragraph } = Typography;
const apiUrl = import.meta.env.VITE_API_URL;

const Flagreport = () => {
  const [projectName, setProjectName] = useState('');
  const [data, setData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFields, setSelectedFields] = useState([]);
  const [sortedFields, setSortedFields] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [flagData, setFlagData] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useUserToken()

  const projectId = useProjectId();
  const database = useDatabase();

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/Projects/${projectId}?WhichDatabase=${database}`,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProjectName(data.projectName);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const fetchFlagData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/Flags/ByProject/${projectId}?WhichDatabase=${database}`,{
        headers: {
            Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const flagData = await response.json();
      console.log('Fetched Flag Data:', flagData); // Debug log to see the data structure

      if (flagData.length === 0) {
        notification.info({
          message: 'No Flag Data',
          description: 'No flag data found for this project.',
          duration: 3,
        });
        setLoading(false);
        return;
      }

      // Extract fields from fetched data
      const fieldsSet = new Set();
      flagData.forEach(item => {
        if (item.field) fieldsSet.add('Field');
        if (item.fieldNameValue) fieldsSet.add('Old Value');

        if (item.remarks) fieldsSet.add('Remarks');
        if (item.barCode) fieldsSet.add('Bar Code');
        if (item.updatedByUserId) fieldsSet.add('Updated By');
      });

      const fieldsArray = Array.from(fieldsSet);

      // Update dropdown options dynamically
      setFieldOptions(fieldsArray.map(field => ({ label: field, value: field })));
      setSelectedFields(fieldsArray); // Set to all fields initially
      setSortedFields(fieldsArray);   // Set to all fields initially
      setFlagData(flagData); // Save flagData for later use

      // No longer automatically process and display the data
      // User will need to click "Show Data" button

      notification.success({
        message: 'Flag Data Loaded',
        description: `Successfully loaded ${flagData.length} flag records. Click "Show Data" to display.`,
        duration: 3,
      });
    } catch (error) {
      console.error('Error fetching flag data:', error);
      notification.error({
        message: 'Error Loading Data',
        description: error.message || 'Failed to load flag data.',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // New function to process and display data
  const processAndDisplayData = async (flagDataToProcess, selectedFieldsToUse) => {
    try {
      const updatedData = await Promise.all(flagDataToProcess.map(async (item, index) => {
        const updatedByName = await fetchUserName(item?.updatedByUserId, database, token);
        // Filter and include only selected fields
        const filteredItem = {
          key: index + 1,
          'S.No.': index + 1,
          ...(selectedFieldsToUse.includes('Field') && { 'Field': item.field }),
          ...(selectedFieldsToUse.includes('Old Value') && { 'Old Value': item.fieldNameValue }),
          ...(selectedFieldsToUse.includes('Remarks') && { 'Remarks': item.remarks }),
          ...(selectedFieldsToUse.includes('Bar Code') && { 'Bar Code': item.barCode }),
          ...(selectedFieldsToUse.includes('Updated By') && { 'Updated By': updatedByName || '' }),
        };
        return filteredItem;
      }));

      setData(updatedData);
      setReportGenerated(true);
    } catch (error) {
      console.error('Error processing flag data:', error);
      notification.error({
        message: 'Error Processing Data',
        description: error.message || 'Failed to process flag data.',
        duration: 3,
      });
    }
  };

  const handleShowData = async () => {
    setLoading(true);
    try {
      // Use the existing flagData but with the current selectedFields
      await processAndDisplayData(flagData, selectedFields);
    } catch (error) {
      console.error('Error processing flag data:', error);
      notification.error({
        message: 'Error Showing Data',
        description: error.message || 'Failed to process and display flag data.',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to hide the table
  const handleHideData = () => {
    setReportGenerated(false);
  };

  const handlePDFAction = () => {
    const doc = new jsPDF();

    // Title
    doc.text(`Flag Report for ${projectName}`, 14, 16);

    // Columns and Rows
    const tableColumn = ['S.No.', ...sortedFields];
    const tableRows = data.map(item => tableColumn.map(field => item[field]));

    // Add Table
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
        const pageHeight = pageSize.height || pageSize.getHeight();
        const pageWidth = pageSize.width || pageSize.getWidth();

        doc.setFontSize(8);
        const pageNumberText = `Page ${data.pageNumber} of ${pageCount}`;
        const textWidth = doc.getStringUnitWidth(pageNumberText) * doc.internal.scaleFactor;
        const xPosition = pageWidth - textWidth - 10;
        const yPosition = pageHeight - 10;

        doc.text(pageNumberText, xPosition, yPosition);
      },
    });

    // Save the PDF
    doc.save(`flag_report_${projectName}.pdf`);
  };

  const handleExcelAction = () => {
    const title = [`Flag Report for ${projectName}`];
    const headers = ['S.No.', ...sortedFields];
    const cleanData = data.map(({ key, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet([], { header: headers });

    XLSX.utils.sheet_add_aoa(worksheet, [title], { origin: 'A1' });

    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A2' });

    XLSX.utils.sheet_add_json(worksheet, cleanData, { header: headers, skipHeader: true, origin: 'A3' });

    worksheet['!merges'] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 }
      }
    ];

    worksheet['A1'] = {
      v: title[0],
      s: {
        fill: {
          fgColor: { rgb: 'ff0000' }
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        },
        font: {
          sz: 14,
          bold: true
        }
      }
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, `flag_report_${projectName}.xlsx`);
  };

  // Define table columns based on sorted fields and include 'S.No.'
  const columns = ['S.No.', ...sortedFields].map(field => ({
    title: field,
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
          placeholder={`Search ${field}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block', width: 188 }}
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
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    onFilter: (value, record) =>
      record[field]?.toString().toLowerCase().includes(value.toLowerCase()),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  }));

  // Filter the options for sorting based on selected fields
  const sortFieldOptions = fieldOptions.filter(option => selectedFields.includes(option.value));

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);

    // You can add additional handling for filters and sorter if needed
    console.log('Filters:', filters);
    console.log('Sorter:', sorter);
  };

  // Dropdown menu with styled icons
  const exportMenu = {
    items: [
      {
        key: '1',
        icon: <FilePdfOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />,
        label: <span onClick={handlePDFAction} style={{ color: '#262626', fontWeight: 500 }}>Download PDF</span>
      },
      {
        key: '2',
        icon: <FileExcelOutlined style={{ fontSize: '18px', color: '#52c41a' }} />,
        label: <span onClick={handleExcelAction} style={{ color: '#262626', fontWeight: 500 }}>Download Excel</span>
      }
    ]
  };

  return (
    <div >
      <Spin spinning={loading} tip="Loading data...">
        <Card
          title={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <FlagOutlined style={{ marginRight: '8px', color: '#1890ff', fontSize: '20px' }} />
              Flag Report
            </span>
          }
          style={{
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #d9d9d9',
          }}
        >
          <Row gutter={[24, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                Generate and view flag reports for project: <Text strong>{projectName}</Text>
              </Paragraph>
              <Input
                value={projectName}
                style={{ width: '100%' }}
                disabled
                prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              />
            </Col>
            <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<FileSearchOutlined />}
                  onClick={fetchFlagData}
                  loading={loading}
                >
                  Fetch Flag Data
                </Button>
                {!reportGenerated ? (
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={handleShowData}
                    loading={loading}
                    disabled={flagData.length === 0}
                  >
                    Show Data
                  </Button>
                ) : (
                  <Button
                    type="default"
                    icon={<EyeInvisibleOutlined />}
                    onClick={handleHideData}
                  >
                    Hide Table
                  </Button>
                )}
                <Dropdown menu={exportMenu} trigger={['click']} disabled={!reportGenerated}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined style={{ fontSize: '16px' }} />}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    Export <DownOutlined style={{ fontSize: '12px', marginLeft: '4px' }} />
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          {flagData.length > 0 && (
            <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={12}>
                <Text strong style={{ display: 'block', marginBottom: '12px', color: '#4b5563' }}>
                  <EyeOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Select Fields to Display
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select fields"
                  value={selectedFields}
                  onChange={setSelectedFields}
                  options={fieldOptions}
                  disabled={loading}
                  maxTagCount={5}
                  showSearch
                  allowClear
                />
              </Col>
              <Col xs={24} lg={12}>
                <Text strong style={{ display: 'block', marginBottom: '12px', color: '#4b5563' }}>
                  <OrderedListOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Sort Fields
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Sort fields"
                  value={sortedFields}
                  onChange={setSortedFields}
                  options={sortFieldOptions}
                  disabled={loading}
                  maxTagCount={5}
                  showSearch
                  allowClear
                />
              </Col>
            </Row>
          )}



          {reportGenerated && (
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <DatabaseOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Flag Data ({data.length} records)
                </span>
              }
              style={{
                marginTop: 16,
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #d9d9d9',
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
                dataSource={data}
                columns={columns}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: data.length,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                }}
                onChange={handleTableChange}
                bordered
                loading={loading}
                size="middle"
                scroll={{ x: 'max-content' }}
                rowClassName={(record, index) => index % 2 === 0 ? '' : 'ant-table-row-light'}
              />
            </Card>
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default Flagreport;


