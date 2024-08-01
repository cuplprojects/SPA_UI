import React, { useState, useCallback } from 'react';
import { Select, Button, Table, Spin, Input, Space } from 'antd';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';
import { useProjectId } from '@/store/ProjectState';
import { useUserInfo } from '@/store/UserDataStore';
import useProject from '@/CustomHooks/useProject';

const { Option } = Select;
const apiUrl = import.meta.env.VITE_API_URL;

const fieldTitleMapping = {
  rollNumber: 'Roll Number',
  candidateName: 'Candidate Name',
  fathersName: "Father's Name",
  courseName: 'Course Name',
  omrDataBarCode: 'OMR Data Bar Code',
  marksObtained: 'Marks Obtained',
  // Add more mappings as needed
};

const ReportForm = () => {
  const { userId } = useUserInfo();
  const database = useDatabase();
  const projectId = useProjectId();
  const { projectName } = useProject(projectId);
  const [reportData, setReportData] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [orderByFields, setOrderByFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataKeys, setDataKeys] = useState([]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const postdata = {
        fields: ['registrationData', 'score'],
      };
      const response = await axios.post(
        `${apiUrl}/Report/GetFilteredData?WhichDatabase=${database}&ProjectId=${projectId}`,
        postdata,
      );

      const structuredData = response.data.map((item) => {
        const omrData = JSON.parse(item.omrData);
        return {
          ...item,
          ...item.registrationData,
          ...omrData,
        };
      });

      setReportData(structuredData);
      setDataKeys(Object.keys(structuredData[0] || {}));
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
    setLoading(false);
  };

  const handleShowTable = () => {
    const dynamicColumns = selectedFields.map((field) => ({
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
              icon="search"
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
      filterIcon: (filtered) => <span style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record[field].toString().toLowerCase().includes(value.toLowerCase()),
    }));

    setColumns(dynamicColumns);
  };

  const sortData = (data) => {
    if (orderByFields.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const field of orderByFields) {
        if (a[field] < b[field]) return -1;
        if (a[field] > b[field]) return 1;
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
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `report_${projectName}.xlsx`);
  };

  return (
    <div>
      <Button onClick={fetchReportData} type="primary" style={{ marginBottom: '20px' }}>
        Fetch Data
      </Button>

      {reportData.length > 0 && (
        <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Select
              mode="multiple"
              style={{ flex: '1 1 300px', minWidth: '300px' }}
              placeholder="Select fields to show"
              onChange={setSelectedFields}
            >
              {dataKeys.map((key) => (
                <Option key={key} value={key}>
                  {fieldTitleMapping[key] || key}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              style={{ flex: '1 1 300px', minWidth: '300px' }}
              placeholder="Select fields to order by"
              onChange={setOrderByFields}
            >
              {dataKeys.map((key) => (
                <Option key={key} value={key}>
                  {fieldTitleMapping[key] || key}
                </Option>
              ))}
            </Select>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Button onClick={handleShowTable} type="primary">
                Show Table
              </Button>
              <Button onClick={downloadPDF} type="primary">
                Download PDF
              </Button>
              <Button onClick={downloadExcel} type="primary">
                Download Excel
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Spin size="large" style={{ marginTop: '20px' }} />
      ) : (
        columns.length > 0 && (
          <Table
            dataSource={sortData(reportData)}
            columns={columns}
            rowKey="id"
            style={{ marginTop: '20px' }}
          />
        )
      )}
    </div>
  );
};

export default ReportForm;
