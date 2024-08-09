import React, { useState, useEffect } from 'react';
import { Select, Button, Table, Spin, Input, Space, Dropdown, Menu, notification } from 'antd';
import { DownOutlined, SaveOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';
import { useProjectId } from '@/store/ProjectState';
import { useUserInfo, useUserToken } from '@/store/UserDataStore';
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
    if (selectedFields.length > 0 || fieldOrder.length > 0) {
      handleFieldChange(selectedFields.length > 0 ? selectedFields : fieldOrder);
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

        // Map through the response data and structure it as desired
        const structuredData = response.data.map((item) => {
            // Destructure and exclude omrData and registrationData
            const { omrData, registrationData, ...rest } = item;

            // Return the desired structure
            return {
                ...rest, // Spread the remaining fields
                ...registrationData // Spread the fields from registrationData directly
            };
        });
        setReportData(structuredData);
        setDataKeys(Object.keys(structuredData[0] || {})); // Update dataKeys here
    } catch (error) {
        console.error('Error fetching report data:', error);
    }
    setLoading(false);
};


const handleFieldChange = (fields) => {
  const updatedFieldOrder = fieldOrder.filter(field => fields.includes(field));
  setFieldOrder(updatedFieldOrder);  //if there is any remove in the selected fields then only call

  const orderedFields = updatedFieldOrder.length > 0 ? updatedFieldOrder : fields;
  const dynamicColumns = orderedFields.map((field) => ({
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
  setSortableFields(fields);
};

  

  const handleFieldOrderChange = (order) => {
    setFieldOrder(order);
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
    if (fieldOrder.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const field of fieldOrder) {
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
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${projectName}.xlsx`;
    link.click();
  };

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Button type="primary" onClick={downloadPDF} style={{ width: '100%' }}>
          Download PDF
        </Button>
      </Menu.Item>
      <Menu.Item key="2">
        <Button type="primary" onClick={downloadExcel} style={{ width: '100%' }}>
          Download Excel
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Button type="primary" onClick={fetchReportData} style={{ marginRight: '10px' }}>
          Fetch Report Data
        </Button>

        <Button
          type="primary"
          onClick={() => setShowData(!showData)}
        >
          {showData ? 'Hide Data' : 'Show Data'}
        </Button>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          {
            assignedUsers.length > 0 && (
              <>
                <div style={{ marginRight: '8px', fontWeight: 'bold' }}>Worked by:</div>
                <p>{assignedUsers.map(user => user.fullName).join(', ')}</p>
              </>
            )
          }
        </div>

        <Dropdown overlay={menu} trigger={['click']} style={{ marginLeft: 'auto' }}>
          <Button type="primary">
            Export <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <Select
          mode="multiple"
          style={{ flex: '1 1 300px', minWidth: '300px' }}
          placeholder="Select fields to show"
          value={selectedFields}
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
          placeholder="Select fields to order"
          value={fieldOrder}
          onChange={handleFieldOrderChange}
        >
          {sortableFields.map((key) => (
            <Option key={key} value={key}>
              {fieldTitleMapping[key] || key}
            </Option>
          ))}
        </Select>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveOrder}
          style={{ flex: '1 1 20px', minWidth: '20px' }}
        >
          Save as configuration
        </Button>
      </div>

      {loading ? (
        <Spin tip="Loading..." style={{ marginTop: '20px' }} />
      ) : (
        showData && (
          <Table
            columns={columns}
            dataSource={sortData(reportData)}
            rowKey="id" // Ensure you have a unique key for each row
            style={{ marginTop: '20px' }}
            bordered
          />
        )
      )}
    </div>
  );
};

export default ReportForm;




// import React, { useState, useCallback } from 'react';
// import { Select, Button, Table, Spin, Input, Space } from 'antd';
// import { saveAs } from 'file-saver';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import * as XLSX from 'xlsx';
// import axios from 'axios';
// import { useDatabase } from '@/store/DatabaseStore';
// import { useProjectId } from '@/store/ProjectState';
// import { useUserInfo } from '@/store/UserDataStore';
// import useProject from '@/CustomHooks/useProject';

// const { Option } = Select;
// const apiUrl = import.meta.env.VITE_API_URL;

// const fieldTitleMapping = {
//   rollNumber: 'Roll Number',
//   candidateName: 'Candidate Name',
//   fathersName: "Father's Name",
//   courseName: 'Course Name',
//   omrDataBarCode: 'OMR Data Bar Code',
//   marksObtained: 'Marks Obtained',
//   // Add more mappings as needed
// };

// const ReportForm = () => {
//   const { userId } = useUserInfo();
//   const database = useDatabase();
//   const projectId = useProjectId();
//   const { projectName } = useProject(projectId);
//   const [reportData, setReportData] = useState([]);
//   const [selectedFields, setSelectedFields] = useState([]);
//   const [orderByFields, setOrderByFields] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [columns, setColumns] = useState([]);
//   const [dataKeys, setDataKeys] = useState([]);

//   const fetchReportData = async () => {
//     setLoading(true);
//     try {
//       const postdata = {
//         fields: ['registrationData', 'score'],
//       };
//       const response = await axios.post(
//         `${apiUrl}/Report/GetFilteredData?WhichDatabase=${database}&ProjectId=${projectId}`,
//         postdata,
//       );

//       const structuredData = response.data.map((item) => {
//         const omrData = JSON.parse(item.omrData);
//         return {
//           ...item,
//           ...item.registrationData,
//           ...omrData,
//         };
//       });

//       setReportData(structuredData);
//       setDataKeys(Object.keys(structuredData[0] || {}));
//     } catch (error) {
//       console.error('Error fetching report data:', error);
//     }
//     setLoading(false);
//   };

//   const handleShowTable = () => {
//     const dynamicColumns = selectedFields.map((field) => ({
//       title: fieldTitleMapping[field] || field,
//       dataIndex: field,
//       key: field,
//       sorter: (a, b) => {
//         if (typeof a[field] === 'string' && typeof b[field] === 'string') {
//           return a[field].localeCompare(b[field]);
//         } else if (typeof a[field] === 'number' && typeof b[field] === 'number') {
//           return a[field] - b[field];
//         }
//         return 0;
//       },
//       filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
//         <div style={{ padding: 8 }}>
//           <Input
//             placeholder={`Search ${fieldTitleMapping[field] || field}`}
//             value={selectedKeys[0]}
//             onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//             onPressEnter={() => confirm()}
//             style={{ marginBottom: 8, display: 'block' }}
//           />
//           <Space>
//             <Button
//               type="primary"
//               onClick={() => confirm()}
//               icon="search"
//               size="small"
//               style={{ width: 90 }}
//             >
//               Search
//             </Button>
//             <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
//               Reset
//             </Button>
//           </Space>
//         </div>
//       ),
//       filterIcon: (filtered) => <span style={{ color: filtered ? '#1890ff' : undefined }} />,
//       onFilter: (value, record) =>
//         record[field].toString().toLowerCase().includes(value.toLowerCase()),
//     }));

//     setColumns(dynamicColumns);
//   };

//   const sortData = (data) => {
//     if (orderByFields.length === 0) return data;

//     return [...data].sort((a, b) => {
//       for (const field of orderByFields) {
//         if (a[field] < b[field]) return -1;
//         if (a[field] > b[field]) return 1;
//       }
//       return 0;
//     });
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF();

//     const totalPagesExp = '{total_pages_count_string}';

//     doc.setFontSize(12);
//     doc.setFont('Helvetica', 'normal');

//     const text = `Report For Group ${projectName}`;
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const textWidth = doc.getStringUnitWidth(text) * doc.internal.scaleFactor;
//     const xPosition = (pageWidth - textWidth) / 2;

//     doc.text(text, xPosition, 20);

//     const sortedData = sortData(reportData);

//     const tableColumn = ['Serial No.', ...columns.map((col) => col.title)];
//     const tableRows = sortedData.map((data, index) => [
//       index + 1,
//       ...selectedFields.map((field) => data[field]),
//     ]);

//     doc.autoTable({
//       head: [tableColumn],
//       body: tableRows,
//       startY: 30,
//       styles: {
//         fontSize: 6,
//         cellPadding: 2,
//         lineColor: [44, 62, 80],
//         lineWidth: 0.2,
//         textColor: [0, 0, 0],
//       },
//       headStyles: {
//         fontSize: 8,
//         fillColor: [22, 160, 133],
//         textColor: [255, 255, 255],
//         lineColor: [44, 62, 80],
//         lineWidth: 0.2,
//         halign: 'center',
//         valign: 'middle',
//       },
//       theme: 'striped',
//       margin: { top: 20 },
//       didDrawPage: (data) => {
//         const pageCount = doc.internal.getNumberOfPages();
//         const pageSize = doc.internal.pageSize;
//         const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
//         const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

//         doc.setFontSize(8);
//         const pageNumberText = `Page ${data.pageNumber} of ${totalPagesExp}`;
//         const textWidth = doc.getStringUnitWidth(pageNumberText) * doc.internal.scaleFactor;
//         const xPosition = pageWidth - textWidth - 10;
//         const yPosition = pageHeight - 10;

//         doc.text(pageNumberText, xPosition, yPosition);
//       },
//     });

//     if (typeof doc.putTotalPages === 'function') {
//       doc.putTotalPages(totalPagesExp);
//     }

//     doc.save(`report_${projectName}.pdf`);
//   };

//   const downloadExcel = () => {
//     const sortedData = sortData(reportData);

//     const filteredData = sortedData.map((data) => {
//       const rowData = {};
//       selectedFields.forEach((field) => {
//         rowData[fieldTitleMapping[field] || field] = data[field];
//       });
//       return rowData;
//     });

//     const ws = XLSX.utils.json_to_sheet(filteredData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Report');
//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `report_${projectName}.xlsx`);
//   };

//   return (
//     <div>
//       <Button onClick={fetchReportData} type="primary" style={{ marginBottom: '20px' }}>
//         Fetch Data
//       </Button>

//       {reportData.length > 0 && (
//         <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
//             <Select
//               mode="multiple"
//               style={{ flex: '1 1 300px', minWidth: '300px' }}
//               placeholder="Select fields to show"
//               onChange={setSelectedFields}
//             >
//               {dataKeys.map((key) => (
//                 <Option key={key} value={key}>
//                   {fieldTitleMapping[key] || key}
//                 </Option>
//               ))}
//             </Select>
//             <Select
//               mode="multiple"
//               style={{ flex: '1 1 300px', minWidth: '300px' }}
//               placeholder="Select fields to order by"
//               onChange={setOrderByFields}
//             >
//               {dataKeys.map((key) => (
//                 <Option key={key} value={key}>
//                   {fieldTitleMapping[key] || key}
//                 </Option>
//               ))}
//             </Select>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
//               <Button onClick={handleShowTable} type="primary">
//                 Show Table
//               </Button>
//               <Button onClick={downloadPDF} type="primary">
//                 Download PDF
//               </Button>
//               <Button onClick={downloadExcel} type="primary">
//                 Download Excel
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {loading ? (
//         <Spin size="large" style={{ marginTop: '20px' }} />
//       ) : (
//         columns.length > 0 && (
//           <Table
//             dataSource={sortData(reportData)}
//             columns={columns}
//             rowKey="id"
//             style={{ marginTop: '20px' }}
//           />
//         )
//       )}
//     </div>
//   );
// };

// export default ReportForm;
