import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, message, Dropdown, Menu, Input, Table } from 'antd';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { fetchUserName } from '@/CustomHooks/useUserName';

const { Title } = Typography;
const apiUrl = import.meta.env.VITE_API_URL;

const ReportForm = () => {
  const [projectName, setProjectName] = useState('');
  const [data, setData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const projectId = useProjectId();
  const database = useDatabase();

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/Projects/1?WhichDatabase=${database}`);
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
    try {
      const response = await fetch(`${apiUrl}/Flags/ByProject/${projectId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const flagData = await response.json();
      console.log('Fetched Flag Data:', flagData); // Debugging statement

      const updatedData = await Promise.all(flagData.map(async (item, index) => {
        const updatedByName = await fetchUserName(item?.updatedByUserId, database);
        return {
          key: index + 1,
          'S.No.': index + 1,
          'Field': item.field,
          'Old Value': item.fieldNameValue,
          'Remarks': item.remarks,
          'Bar Code': item.barCode,
          'Updated By': updatedByName || '', // Ensure there's always a value
        };
      }));

      console.log('Updated Data:', updatedData); // Debugging statement
      setData(updatedData);
      setReportGenerated(true);
    } catch (error) {
      console.error('Error fetching flag data:', error);
    }
  };

  const handleMenuClick = (e) => {
    switch (e.key) {
      case 'pdf':
        handlePDFAction();
        break;
      case 'excel':
        handleExcelAction();
        break;
      default:
        message.error('Invalid option');
    }
  };

  const handlePDFAction = () => {
    const doc = new jsPDF();
  
    // Title
    doc.text(`Flag Report for ${projectName}`, 14, 16);
  
    // Columns and Rows
    const tableColumn = ['S.No.', 'Field', 'Old Value', 'Remarks', 'Bar Code', 'Updated By'];
    const tableRows = data.map(item => [
      item['S.No.'],
      item['Field'],
      item['Old Value'],
      item['Remarks'],
      item['Bar Code'],
      item['Updated By']
    ]);
  
    // Add Table
    doc.autoTable({
      head: [tableColumn], // Header columns
      body: tableRows,    // Row data
      startY: 30,         // Position below title
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
        // Page Numbering
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
    doc.save('flag_report.pdf');
  };
  ;

  const handleExcelAction = () => {
    // Prepare title, headers, and data
    const title = [`Flag Report for ${projectName}`];
    const headers = ['S.No.', 'Field', 'Old Value', 'Remarks', 'Bar Code', 'Updated By'];
    const cleanData = data.map(({ key, ...rest }) => rest); // Remove the 'key' field
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet([], { header: headers });
  
    // Insert title
    XLSX.utils.sheet_add_aoa(worksheet, [title], { origin: 'A1' });
    
    // Insert headers
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A2' });
    
    // Add data
    XLSX.utils.sheet_add_json(worksheet, cleanData, { header: headers, skipHeader: true, origin: 'A3' });
    
    // Merge title cells
    worksheet['!merges'] = [
      {
        s: { r: 0, c: 0 }, // Start cell (row 0, column 0)
        e: { r: 0, c: headers.length - 1 } // End cell (row 0, last column)
      }
    ];
    
    // Style the title cell
    worksheet['A1'] = {
      v: title[0], // Cell value
      s: {
        fill: {
          fgColor: { rgb: 'ff000' } // Background color (e.g., yellow)
        },
        alignment: {
          horizontal: 'center', // Center the text horizontally
          vertical: 'center' // Center the text vertically
        },
        font: {
          sz: 14, // Font size
          bold: true // Optional: make font bold
        }
      }
    };
  
    // Set column width (optional)
    // worksheet['!cols'] = headers.map(() => ({ wch: 20 })); // Adjust width as needed
  
    // Create a new workbook and append the worksheet to it
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Generate the Excel file and trigger a download
    XLSX.writeFile(workbook, 'flag_report.xlsx');
  };
    

  const columns = [
    { title: 'S.No.', dataIndex: 'S.No.', key: 'S.No.' },
    { title: 'Field', dataIndex: 'Field', key: 'Field' },
    { title: 'Old Value', dataIndex: 'Old Value', key: 'Old Value' },
    { title: 'Remarks', dataIndex: 'Remarks', key: 'Remarks' },
    { title: 'Bar Code', dataIndex: 'Bar Code', key: 'Bar Code' },
    { title: 'Updated By', dataIndex: 'Updated By', key: 'Updated By' }
  ];

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Card title="Generate Report" style={{ width: '100%' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input value={projectName} style={{ width: '100%' }} disabled />
        </Col>
        <Col span={8}>
          <Button type="primary" onClick={fetchFlagData}>Fetch Flag Data</Button>
        </Col>
      </Row>
      {reportGenerated && (
        <>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={24} className='text-end'>
              <Dropdown
                overlay={
                  <Menu onClick={handleMenuClick}>
                    <Menu.Item key="pdf">Download PDF</Menu.Item>
                    <Menu.Item key="excel">Download Excel</Menu.Item>
                  </Menu>
                }
              >
                <Button type="primary">Download Report</Button>
              </Dropdown>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Table
                dataSource={data}
                columns={columns}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: data.length,
                  onChange: handleTableChange,
                }}
                bordered
              />
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
};

export default ReportForm;
