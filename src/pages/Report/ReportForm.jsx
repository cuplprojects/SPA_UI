// import React, { useState, useEffect, useRef } from 'react';
// import Select from 'react-select';
// import {
//   Card,
//   Button,
//   Row,
//   Col,
//   Table,
//   Typography,
//   Dropdown,
//   Menu,
//   Input,
//   List,
//   message,
//   Checkbox,
// } from 'antd';
// import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
// import * as XLSX from 'xlsx';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { useProjectActions, useProjectId } from '@/store/ProjectState';
// // Import the custom CSS file (Remove this line if you are including styles inline)

// const { Title } = Typography;
// const APIURL = import.meta.env.VITE_API_URL;

// // PDF Report Component
// const PDFReport = ({ project, selectedFields, data, workedBy }) => (
//   <Document>
//     <Page size="A3" style={pdfStyles.page}>
//       <View style={pdfStyles.header}>
//         <Text style={pdfStyles.title}>Report for {project}</Text>
//         {workedBy && <Text style={pdfStyles.subtitle}>Worked by: {workedBy.label}</Text>}
//       </View>
//       <View style={pdfStyles.table}>
//         <View style={pdfStyles.tableRow}>
//           <Text style={pdfStyles.tableColHeader}>S.No.</Text>
//           {selectedFields.map((field) => (
//             <Text key={field.value} style={pdfStyles.tableColHeader}>
//               {field.label}
//             </Text>
//           ))}
//         </View>
//         {data.map((item, index) => (
//           <View key={index} style={pdfStyles.tableRow}>
//             <Text style={pdfStyles.tableCol}>{index + 1}</Text>
//             {selectedFields.map((field) => (
//               <Text key={field.value} style={pdfStyles.tableCol}>
//                 {item[field.value] || ''}
//               </Text>
//             ))}
//           </View>
//         ))}
//       </View>
//     </Page>
//   </Document>
// );

// const pdfStyles = StyleSheet.create({
//   page: {
//     flexDirection: 'column',
//     backgroundColor: '#f5f5f5',
//     padding: 20,
//   },
//   header: {
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   title: {
//     fontSize: 26,
//     fontFamily: 'Helvetica-Bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 18,
//     fontFamily: 'Helvetica',
//     color: '#555',
//   },
//   table: {
//     display: 'table',
//     width: '100%',
//     borderStyle: 'solid',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderCollapse: 'collapse',
//     marginTop: 10,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     borderBottomStyle: 'solid',
//   },
//   tableColHeader: {
//     borderStyle: 'solid',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     padding: 10,
//     fontWeight: 'bold',
//     backgroundColor: '#f0f0f0',
//     textAlign: 'center',
//     fontFamily: 'Helvetica-Bold',
//     color: '#333',
//     flex: 1,
//   },
//   tableCol: {
//     borderStyle: 'solid',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     padding: 10,
//     textAlign: 'center',
//     fontFamily: 'Helvetica',
//     color: '#333',
//     flex: 1,
//   },
// });

// // DraggableField Component
// const DraggableField = ({ field, index, moveField, isSelected, onSelect }) => {
//   const [, ref] = useDrag({
//     type: 'FIELD',
//     item: { index },
//   });

//   const [, drop] = useDrop({
//     accept: 'FIELD',
//     hover: (item) => {
//       if (item.index !== index) {
//         moveField(item.index, index);
//         item.index = index;
//       }
//     },
//   });

//   return (
//     <div
//       ref={(node) => ref(drop(node))}
//       style={{
//         padding: '8px',
//         border: isSelected ? '2px solid #1890ff' : '1px solid #ddd',
//         marginBottom: '4px',
//         cursor: 'move',
//         backgroundColor: isSelected ? '#e6f7ff' : '#fff',
//         borderRadius: '4px',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//       }}
//       onClick={() => onSelect(field.value)}
//     >
//       {field.label}
//     </div>
//   );
// };

// // EditableCell Component
// const EditableCell = ({
//   title,
//   editable,
//   children,
//   dataIndex,
//   record,
//   handleSave,
//   ...restProps
// }) => {
//   const [editing, setEditing] = useState(false);
//   const inputRef = useRef(null);
//   const form = useRef(null);

//   useEffect(() => {
//     if (editing) {
//       inputRef.current.focus();
//     }
//   }, [editing]);

//   const toggleEdit = () => {
//     setEditing(!editing);
//   };

//   const save = async () => {
//     try {
//       const values = await form.current.validateFields();
//       toggleEdit();
//       handleSave({ ...record, ...values });
//     } catch (errInfo) {
//       console.log('Save failed:', errInfo);
//     }
//   };

//   let childNode = children;

//   if (editable) {
//     childNode = editing ? (
//       <Input
//         ref={inputRef}
//         defaultValue={record[dataIndex]}
//         onPressEnter={save}
//         onBlur={save}
//         style={{ borderRadius: '4px' }}
//       />
//     ) : (
//       <div style={{ paddingRight: 24, cursor: 'pointer' }} onClick={toggleEdit}>
//         {children}
//       </div>
//     );
//   }

//   return <td {...restProps}>{childNode}</td>;
// };

// // Main Component
// const ReportForm = () => {
//   const [project, setProject] = useState('');
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [workedBy, setWorkedBy] = useState(null);
//   const [projectOptions, setProjectOptions] = useState([]);
//   const [fieldsOptions, setFieldsOptions] = useState([]);
//   const [selectedFields, setSelectedFields] = useState([]);
//   const [data, setData] = useState([]);
//   const [previewType, setPreviewType] = useState(null);
//   const [excelData, setExcelData] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [selectedField, setSelectedField] = useState(null); // New state for selected field
//   const [projectName, setProjectName] = useState('');
//   const projectId = useProjectId();
//   const { setProjectId } = useProjectActions();
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [includeScore, setIncludeScore] = useState(false); // New state for checkbox
//   const [scoresData, setScoresData] = useState({}); // State for scores data

//   useEffect(() => {
//     fetchProjectDetails(projectId);
//     fetchUsersByProject(projectId);
//     fetchFields(projectId);

//   }, []);

//   useEffect(() => {
//     if (includeScore) {
//       fetchScoresData();
//     }
//   }, [includeScore]);

//   useEffect(() => {
//     if (selectedFields.length > 0) {
//       fetchFieldData();
//     }
//   }, [selectedFields]);

//   const fetchScoresData = () => {
//     fetch(`https://localhost:7290/api/Scores/GetScores?projectId=${projectId}`)
//       .then((response) => response.json())
//       .then((data) => {
//         setScoresData(data);
//       });
//   };

//   // Function to fetch project details from an API
//   const fetchProjectDetails = async (projectId) => {
//     try {
//       const response = await fetch(`${APIURL}/Projects/${projectId}?WhichDatabase=Local`);
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       const data = await response.json();
//       setProjectName(data.projectName);
//     } catch (error) {
//       console.error('Error fetching project details:', error);
//     }
//   };

//   const fetchFields = (projectId) => {
//     fetch(
//       `https://localhost:7290/api/FieldConfigurations/GetByProjectId/${projectId}?WhichDatabase=Local`,
//     )
//       .then((response) => response.json())
//       .then((data) => {
//         const options = data.map((field) => ({
//           value: field.fieldConfigurationId ? field.fieldConfigurationId.toString() : '',
//           label: field.fieldName || 'Unnamed Field',
//         }));
//         options.unshift({ value: 'select_all', label: 'Select All' }); // Add "Select All" option
//         setFieldsOptions(options);
//         console.log(options)
//       })
//       .catch((error) => {
//         console.error('Error fetching fields:', error);
//       });
//   };

//   const fetchUsersByProject = async (projectId) => {
//     try {
//       const response = await fetch(
//         `https://localhost:7290/api/Projects/users/${projectId}?WhichDatabase=Local`,
//       );
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       const data = await response.json();

//       const options = data.map((user) => ({
//         value: user.userId,
//         label: user.fullName,
//       }));

//       setUsers(options);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const fetchFieldData = () => {
//     fetch(`${APIURL}/Correction/GetAllCorrectedOmrData?WhichDatabase=Local`)
//       .then((response) => response.json())
//       .then((data) => {
//         const tableData = data.map((item, index) => {
//           const correctedData = JSON.parse(item.correctedOmrData || '{}');
//           const rowData = {};
//           selectedFields.forEach((field) => {
//             rowData[field.value] = correctedData[field.label] || '';
//           });
//           return { key: index + 1, ...rowData };
//         });
//         setData(tableData);
//       })
//       .catch((error) => {
//         console.error('Error fetching field data:', error);
//       });
//   };

//   const handleFieldChange = (selectedOptions) => {
//     if (selectedOptions.some((option) => option.value === 'select_all')) {
//       setSelectedFields(fieldsOptions.filter((option) => option.value !== 'select_all'));
//     } else {
//       setSelectedFields(selectedOptions);
//     }
//   };

//   const handleUserChange = (selectedOption) => {
//     setWorkedBy(selectedOption);
//   };

//   const handleMenuClick = (e) => {
//     switch (e.key) {
//       case 'pdf':
//         setPreviewType('pdf');
//         break;
//       case 'excel':
//         handleExcelAction();
//         break;
//       case 'html':
//         setPreviewType('html');
//         break;
//       default:
//         message.error('Invalid option');
//     }
//   };

//   const moveField = (fromIndex, toIndex) => {
//     const updatedFields = [...selectedFields];
//     const [movedField] = updatedFields.splice(fromIndex, 1);
//     updatedFields.splice(toIndex, 0, movedField);
//     setSelectedFields(updatedFields);
//   };

//   const handleExcelAction = () => {
//     const worksheet = XLSX.utils.json_to_sheet(
//       data.map((item) => ({
//         ...item,
//         key: item.key,
//       })),
//     );
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//     XLSX.writeFile(workbook, 'report.xlsx');
//   };

//   const handleSave = (row) => {
//     const newData = [...data];
//     const index = newData.findIndex((item) => row.key === item.key);
//     if (index > -1) {
//       const item = newData[index];
//       newData.splice(index, 1, { ...item, ...row });
//       setData(newData);
//     } else {
//       newData.push(row);
//       setData(newData);
//     }
//   };

//   const handleCheckboxChange = (e) => {
//     setIncludeScore(e.target.checked);
//   };

//   const handleFieldSelect = (fieldValue) => {
//     setSelectedField((prevSelectedField) => (prevSelectedField === fieldValue ? null : fieldValue));
//   };

//   return (
//     <Card title="Generate Report" style={{ width: '100%' }}>
//       <Row gutter={16} style={{ marginBottom: 16 }}>
//         <Col span={8}>
//           <Input
//             value={projectName}
//             //onChange={handleProjectChange}
//             //placeholder="Select Project"
//             style={{ width: '100%' }}
//             disabled
//           />
//         </Col>
//         <Col span={8}>
//           <Select
//             options={fieldsOptions}
//             onChange={handleFieldChange}
//             isMulti
//             placeholder="Select Fields"
//             value={selectedFields}
//             style={{ width: '100%', fontWeight: 'bold' }}
//           />
//           <Checkbox checked={includeScore} onChange={handleCheckboxChange}>
//             Include Scores
//           </Checkbox>
//         </Col>
//         <Col span={8}>
//           <ul style={{ listStyleType: 'none', padding: 0 }}>
//             {users.map((user) => (
//               <span key={user.value} style={{ marginBottom: '5px' }}>
//                 {user.label} , &nbsp;
//               </span>
//             ))}
//           </ul>
//         </Col>
//       </Row>
//       <Row gutter={16} style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
//         <Col>
//           <Dropdown
//             overlay={
//               <Menu onClick={handleMenuClick}>
//                 <Menu.Item key="pdf">Generate PDF</Menu.Item>
//                 <Menu.Item key="excel">Download Excel</Menu.Item>
//                 <Menu.Item key="html">Download Html</Menu.Item>
//               </Menu>
//             }
//           >
//             <Button type="primary" size="large">
//               Export
//             </Button>
//           </Dropdown>
//         </Col>
//       </Row>
//       {previewType === 'pdf' && (
//         <PDFViewer width="100%" height="600">
//           <PDFReport
//             project={project}
//             selectedFields={selectedFields}
//             data={data}
//             workedBy={workedBy}
//           />
//         </PDFViewer>
//       )}
//       {previewType === 'html' && (
//         <div style={{ marginTop: 16, padding: '20px', background: '#dddddd', borderRadius: '8px' }}>
//           <DndProvider backend={HTML5Backend}>
//             <div
//               style={{
//                 marginBottom: 16,
//                 padding: '10px',
//                 borderRadius: '8px',
//                 width: '100%',
//                 background: '#dddddd',
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // Adjust based on item size
//                 gap: '16px', // Spacing between items
//                 overflowX: 'auto', // Allows horizontal scrolling if needed
//               }}
//             >
//               {selectedFields.map((item, index) => (
//                 <DraggableField
//                   key={item.value}
//                   field={item}
//                   index={index}
//                   moveField={moveField}
//                   isSelected={item.value === selectedField}
//                   onSelect={handleFieldSelect}
//                 />
//               ))}
//             </div>

//             <Table
//               dataSource={data}
//               columns={[
//                 { title: 'S.No.', dataIndex: 'key', key: 'key', editable: false },
//                 ...selectedFields.map((field) => ({
//                   title: field.label,
//                   dataIndex: field.value,
//                   key: field.value,
//                   editable: true,
//                 })),
//               ]}
//               components={{
//                 body: {
//                   cell: EditableCell,
//                 },
//               }}
//               rowClassName="editable-row"
//               pagination={false}
//               bordered
//               className="custom-table" // Add custom className
//               onCell={(record, rowIndex) => ({
//                 record,
//                 editable: true,
//                 handleSave: handleSave,
//               })}
//               style={{
//                 borderCollapse: 'collapse',
//                 width: '100%',
//                 backgroundColor: '#dddddd',
//               }}
//             />
//           </DndProvider>
//         </div>
//       )}
//       <style>
//         {`
//           .custom-table .ant-table-thead > tr > th {
//             background-color: #D6EEEE !important; /* Header background color */
//           }

//           .custom-table .ant-table-tbody > tr > td {
//             background-color: #D6EEEE !important; /* Row background color */
//           }

//           .custom-table .ant-table-tbody > tr:nth-child(odd) > td {
//             background-color: #D6EEEE !important; /* Alternate row background color */
//           }
//         `}
//       </style>
//     </Card>
//   );
// };

// export default ReportForm;
import { useDatabase } from '@/store/DatabaseStore';
import { useProjectId } from '@/store/ProjectState';
import { useUserInfo } from '@/store/UserDataStore';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

const ReportForm = () => {
  const [reportData, setReportData] = useState();
  const { userId } = useUserInfo();
  const database = useDatabase();
  const projectId = useProjectId();

  useEffect(() => {
    getReportData();
  });

  const getReportData = async () => {
    const postdata = {
      fields: ['registrationData', 'score'],
    };
    const res = await axios.post(
      `${apiUrl}/Report/GetFilteredData?WhichDatabase=${database}&ProjectId=${projectId}`,
      postdata,
    );
    const data = res.data;
    console.log(data);
  };

  return <div></div>;
};

export default ReportForm;
