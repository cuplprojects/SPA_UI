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
  Tag,
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
  FileSearchOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
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

const ComparisonReport = () => {
  const [projectName, setProjectName] = useState('');
  const [overviewData, setOverviewData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rawFlagData, setRawFlagData] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useUserToken()

  const projectId = useProjectId();
  const database = useDatabase();

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/Projects/${projectId}?WhichDatabase=${database}`, {
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
      const response = await fetch(`${apiUrl}/Report/ComparisonReport/${projectId}?WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const flagData = await response.json();
      console.log('Fetched Flag Data:', flagData);

      if (flagData.length === 0) {
        notification.info({
          message: 'No Flag Data',
          description: 'No flag data found for this project.',
          duration: 3,
        });
        setLoading(false);
        return;
      }

      setRawFlagData(flagData);
      await processAndDisplayData(flagData);

      notification.success({
        message: 'Flag Data Loaded',
        description: `Successfully loaded ${flagData.length} barcode records with flags.`,
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

  // Process and display data with new structure
  const processAndDisplayData = async (flagDataToProcess) => {
    try {
      // Create overview data
      const overview = flagDataToProcess.map((item, index) => {
        const totalFlags = item.flags.length;
        
        // Count different types of errors based on field types
        const errorCounts = {};
        Object.keys(item.fieldCounts || {}).forEach(fieldType => {
          errorCounts[fieldType] = item.fieldCounts[fieldType];
        });
        
        return {
          key: item.barcode,
          'S.No.': index + 1,
          'Bar Code': item.barcode,
          'Unmatched': totalFlags,
          ...errorCounts // This will add columns like "Answers": 2, "Roll Number": 1, etc.
        };
      });

      // Create detailed data for all flags
      const details = [];
      let detailIndex = 1;
      
      for (const item of flagDataToProcess) {
        for (const flag of item.flags) {
          const updatedByName = flag.updatedByUserId ? 
            await fetchUserName(flag.updatedByUserId, database, token) : '';
          
          let scannedValue = '';
          let extractedValue = '';
          let questionNumber = '';
          
          // Process based on field type
          if (flag.field === 'Answers') {
            // Extract question number from remarks
            const questionMatch = flag.remarks.match(/Question:\s*(\d+)/);
            questionNumber = questionMatch ? questionMatch[1] : '';
            
            // Extract scanned answer from remarks
            const scannedMatch = flag.remarks.match(/ScannedAns\s*:\s*([A-Z])/);
            scannedValue = scannedMatch ? scannedMatch[1] : '';
            
            // For answers, fieldNameValue is the extracted value
            extractedValue = flag.fieldNameValue;
          } else {
            // For other fields, extract scanned value from remarks and fieldNameValue is extracted value
            // Try to extract scanned value from remarks (look for patterns like "000265" in remarks)
            const remarksScannedMatch = flag.remarks.match(/(\*?\d+)/);
            scannedValue = remarksScannedMatch ? remarksScannedMatch[1] : '';
            
            // fieldNameValue is the extracted value
            extractedValue = flag.fieldNameValue;
          }
          
          details.push({
            key: `${item.barcode}-${flag.flagId}`,
            'S.No.': detailIndex++,
            'Bar Code': flag.barCode,
            'Flag ID': flag.flagId,
            'Field': flag.field,
            'Question Number': flag.field === 'Answers' ? questionNumber : '',
            'Scanned Value': scannedValue,
            'Extracted Value': extractedValue,
            'Old Value': scannedValue, // Keep for backward compatibility
            'Remarks': flag.remarks,
            'Is Corrected': flag.isCorrected ? 'Yes' : 'No',
            'Updated By': updatedByName || 'N/A',
            'Project ID': flag.projectId
          });
        }
      }

      setOverviewData(overview);
      setDetailData(details);
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

  // Function to hide the table
  const handleHideData = () => {
    setReportGenerated(false);
  };

  const handlePDFAction = () => {
    const doc = new jsPDF();

    // Title
    doc.text(`Comparison Report for ${projectName}`, 14, 16);

    // Overview Table
    const fieldTypes = getFieldTypes();
    const overviewColumns = ['S.No.', 'Bar Code', 'Unmatched', ...fieldTypes];
    const overviewRows = overviewData.map(item => overviewColumns.map(field => item[field] || 0));

    doc.autoTable({
      head: [overviewColumns],
      body: overviewRows,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [44, 62, 80],
        lineWidth: 0.2,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fontSize: 9,
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        lineColor: [44, 62, 80],
        lineWidth: 0.2,
        halign: 'center',
        valign: 'middle',
      },
      theme: 'striped',
      margin: { top: 20 },
    });

    // Save the PDF
    doc.save(`comparison_report_${projectName}.pdf`);
  };

  const handleExcelAction = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewTitle = [`Comparison Report Overview - ${projectName}`];
    const fieldTypes = getFieldTypes();
    const overviewHeaders = ['S.No.', 'Bar Code', 'Unmatched', ...fieldTypes];
    const overviewCleanData = overviewData.map(({ key, ...rest }) => rest);

    const overviewWorksheet = XLSX.utils.json_to_sheet([], { header: overviewHeaders });
    
    XLSX.utils.sheet_add_aoa(overviewWorksheet, [overviewTitle], { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(overviewWorksheet, [overviewHeaders], { origin: 'A2' });
    XLSX.utils.sheet_add_json(overviewWorksheet, overviewCleanData, { 
      header: overviewHeaders, 
      skipHeader: true, 
      origin: 'A3' 
    });

    overviewWorksheet['!merges'] = [{
      s: { r: 0, c: 0 },
      e: { r: 0, c: overviewHeaders.length - 1 }
    }];

    overviewWorksheet['A1'] = {
      v: overviewTitle[0],
      s: {
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { sz: 14, bold: true, color: { rgb: 'FFFFFF' } }
      }
    };

    // Sheet 2: Detailed Data
    const detailTitle = [`Comparison Report Details - ${projectName}`];
    const detailHeaders = ['S.No.', 'Bar Code', 'Field', 'Question Number', 'Scanned Value', 'Extracted Value', 'Remarks'];
    const detailCleanData = detailData.map(({ key, 'Old Value': oldValue, 'Flag ID': flagId, 'Is Corrected': isCorrected, 'Updated By': updatedBy, 'Project ID': projectId, ...rest }) => rest);

    const detailWorksheet = XLSX.utils.json_to_sheet([], { header: detailHeaders });
    
    XLSX.utils.sheet_add_aoa(detailWorksheet, [detailTitle], { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(detailWorksheet, [detailHeaders], { origin: 'A2' });
    XLSX.utils.sheet_add_json(detailWorksheet, detailCleanData, { 
      header: detailHeaders, 
      skipHeader: true, 
      origin: 'A3' 
    });

    detailWorksheet['!merges'] = [{
      s: { r: 0, c: 0 },
      e: { r: 0, c: detailHeaders.length - 1 }
    }];

    detailWorksheet['A1'] = {
      v: detailTitle[0],
      s: {
        fill: { fgColor: { rgb: '70AD47' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { sz: 14, bold: true, color: { rgb: 'FFFFFF' } }
      }
    };

    // Add both sheets to workbook
    XLSX.utils.book_append_sheet(workbook, overviewWorksheet, 'Overview');
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, 'Details');

    XLSX.writeFile(workbook, `comparison_report_${projectName}.xlsx`);
  };

  // Get all unique field types from the data to create dynamic columns
  const getFieldTypes = () => {
    const fieldTypes = new Set();
    rawFlagData.forEach(item => {
      Object.keys(item.fieldCounts || {}).forEach(fieldType => {
        fieldTypes.add(fieldType);
      });
    });
    return Array.from(fieldTypes);
  };

  // Define overview table columns dynamically
  const getOverviewColumns = () => {
    const fieldTypes = getFieldTypes();
    
    const baseColumns = [
      {
        title: 'S.No.',
        dataIndex: 'S.No.',
        key: 'S.No.',
        width: 80,
        sorter: (a, b) => a['S.No.'] - b['S.No.'],
      },
      {
        title: 'Bar Code',
        dataIndex: 'Bar Code',
        key: 'Bar Code',
        sorter: (a, b) => a['Bar Code'].localeCompare(b['Bar Code']),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search Bar Code"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
              style={{ marginBottom: 8, display: 'block', width: 188 }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
                Search
              </Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
        onFilter: (value, record) =>
          record['Bar Code']?.toString().toLowerCase().includes(value.toLowerCase()),
        filterIcon: filtered => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
      },
      {
        title: 'Unmatched',
        dataIndex: 'Unmatched',
        key: 'Unmatched',
        width: 120,
        sorter: (a, b) => a['Unmatched'] - b['Unmatched'],
        render: (value) => <Tag color="red">{value}</Tag>
      }
    ];

    // Add dynamic columns for each field type
    const fieldTypeColumns = fieldTypes.map(fieldType => ({
      title: fieldType,
      dataIndex: fieldType,
      key: fieldType,
      width: 120,
      sorter: (a, b) => (a[fieldType] || 0) - (b[fieldType] || 0),
      render: (value) => value ? <Tag color="orange">{value}</Tag> : <Tag color="green">0</Tag>
    }));

    return [...baseColumns, ...fieldTypeColumns];
  };

  // Define detail table columns for expanded rows
  const detailColumns = [
    {
      title: 'Flag ID',
      dataIndex: 'Flag ID',
      key: 'Flag ID',
      width: 100,
    },
    {
      title: 'Field',
      dataIndex: 'Field',
      key: 'Field',
      width: 120,
    },
    {
      title: 'Question Number',
      dataIndex: 'Question Number',
      key: 'Question Number',
      width: 120,
      render: (value, record) => {
        if (record.Field === 'Answers' && value) {
          return <Tag color="blue">Q{value}</Tag>;
        }
        return value || '-';
      },
    },
    {
      title: 'Scanned Value',
      dataIndex: 'Scanned Value',
      key: 'Scanned Value',
      width: 120,
      render: (value, record) => {
        if (record.Field === 'Answers') {
          return <Tag color="green">{value}</Tag>;
        }
        return <span style={{ fontFamily: 'monospace' }}>{value}</span>;
      },
    },
    {
      title: 'Extracted Value',
      dataIndex: 'Extracted Value',
      key: 'Extracted Value',
      width: 120,
      render: (value, record) => {
        if (record.Field === 'Answers' && value) {
          // Check if scanned and extracted values are different
          const isDifferent = record['Scanned Value'] !== value;
          return <Tag color={isDifferent ? "red" : "orange"}>{value}</Tag>;
        }
        return value || '-';
      },
    },
    {
      title: 'Remarks',
      dataIndex: 'Remarks',
      key: 'Remarks',
      ellipsis: true,
    },
    {
      title: 'Is Corrected',
      dataIndex: 'Is Corrected',
      key: 'Is Corrected',
      width: 120,
      render: (value) => (
        <Tag 
          icon={value === 'Yes' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          color={value === 'Yes' ? 'success' : 'error'}
        >
          {value}
        </Tag>
      ),
    },
    {
      title: 'Updated By',
      dataIndex: 'Updated By',
      key: 'Updated By',
      width: 120,
    }
  ];

  // Expandable row render function
  const expandedRowRender = (record) => {
    const barCodeFlags = detailData.filter(detail => detail['Bar Code'] === record['Bar Code']);
    
    return (
      <Table
        columns={detailColumns}
        dataSource={barCodeFlags}
        pagination={false}
        size="small"
        style={{ margin: '0 48px' }}
      />
    );
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Dropdown menu with styled icons
  const exportMenu = {
    items: [
      {
        key: '1',
        icon: <FilePdfOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />,
        label: <span onClick={handlePDFAction} style={{ color: '#262626', fontWeight: 500 }}>Download PDF (Overview)</span>
      },
      {
        key: '2',
        icon: <FileExcelOutlined style={{ fontSize: '18px', color: '#52c41a' }} />,
        label: <span onClick={handleExcelAction} style={{ color: '#262626', fontWeight: 500 }}>Download Excel (2 Sheets)</span>
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
              Comparison Report
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
                Generate and view comparison reports for project: <Text strong>{projectName}</Text>
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
                  Fetch Comparison Data
                </Button>
                {reportGenerated && (
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

          {reportGenerated && (
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Barcodes"
                  value={overviewData.length}
                  prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Unmatched"
                  value={overviewData.reduce((sum, item) => sum + (item['Unmatched'] || 0), 0)}
                  prefix={<FlagOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Barcodes with Issues"
                  value={overviewData.filter(item => item['Unmatched'] > 0).length}
                  prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                />
              </Col>
            </Row>
          )}

          <Divider style={{ margin: '16px 0' }} />



          {reportGenerated && (
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <DatabaseOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Comparison Report Overview ({overviewData.length} barcodes)
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
                dataSource={overviewData}
                columns={getOverviewColumns()}
                expandable={{
                  expandedRowRender,
                  rowExpandable: (record) => record['Unmatched'] > 0,
                }}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: overviewData.length,
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

export default ComparisonReport;
