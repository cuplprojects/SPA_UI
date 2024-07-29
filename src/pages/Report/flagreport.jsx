import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Dropdown, Menu, message, Select } from 'antd';
import axios from 'axios';
import { PDFViewer } from '@react-pdf/renderer';
import PDFReport from './PdfReport';
import { useUserInfo } from '@/store/UserDataStore';
import { useDatabase } from '@/store/DatabaseStore';

const apiUrl = import.meta.env.VITE_API_URL; // Adjust API URL as needed

const ReportForm = () => {
  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [data, setData] = useState([]);
  const [previewType, setPreviewType] = useState(null);
  const { userId } = useUserInfo();
  const database = useDatabase();

  // Fetch Projects Onload
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch data when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchFlagsByProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Fetch Projects function
  const fetchProjects = () => {
    axios
      .get(`${apiUrl}/Projects/YourProject?WhichDatabase=${database}&userId=${userId}`)
      .then((response) => {
        const options = response.data.map((project) => ({
          value: project.projectId,
          label: project.projectName || 'Unnamed Project',
        }));
        setProjectOptions(options);
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  };

  // Fetch flags by the project ID
  const fetchFlagsByProject = (projectId) => {
    axios
      .get(`${apiUrl}/Flags/GetFlagbyProject/${projectId}`)
      .then((response) => {
        setData(response.data || []);
      })
      .catch((error) => {
        console.error('Error fetching flags:', error);
      });
  };

  // Handle project change
  const handleProjectChange = (value) => {
    setSelectedProjectId(value);
  };

  // Handle menu click for preview
  const handleMenuClick = (e) => {
    if (e.key === 'pdf') {
      setPreviewType('pdf');
    } else {
      message.error('Invalid option');
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="pdf">Open PDF Report</Menu.Item>
    </Menu>
  );

  return (
    <Card title="Report Form" style={{ width: '100%' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Select
            placeholder="Select Project"
            onChange={handleProjectChange}
            style={{ width: '100%' }}
          >
            {projectOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Dropdown overlay={menu}>
        <Button type="primary">Actions</Button>
      </Dropdown>
      {data.length > 0 && previewType === 'pdf' && (
        <PDFViewer width="100%" height={600}>
          <PDFReport data={data || []} />
        </PDFViewer>
      )}
    </Card>
  );
};

export default ReportForm;




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
//   message,
// } from 'antd';
// import { PDFViewer } from '@react-pdf/renderer';
// import * as XLSX from 'xlsx';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import axios from 'axios';
// import { useUserInfo } from '@/store/UserDataStore';
// import PDFReport from './PdfReport';

// const { Title } = Typography;
// const apiUrl = import.meta.env.VITE_API_URL; // Adjust API URL as needed

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
//   const { userId } = useUserInfo();
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [workedBy, setWorkedBy] = useState(null);
//   const [projectOptions, setProjectOptions] = useState([]);
//   const [fieldsOptions, setFieldsOptions] = useState([
//     { value: 'remarks', label: 'Remarks' },
//     { value: 'updatedBy', label: 'Updated By' },
//     { value: 'fieldNameValue', label: 'Field Name Value' },
//     { value: 'field', label: 'Field' },
//     { value: 'barCode', label: 'Bar Code' },
//     { value: 'jectId', label: 'Project ID' },
//     { value: 'isCorreprocted', label: 'Is Corrected' },
//     { value: 'updatedByUserId', label: 'Updated By User ID' },
//     // Add other common fields here
//   ]);
//   const [selectedFields, setSelectedFields] = useState([]);
//   const [data, setData] = useState([]);
//   const [previewType, setPreviewType] = useState(null);
//   const [excelData, setExcelData] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [selectedField, setSelectedField] = useState(null);

//   // Fetch Projects Onload
//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   // Fetch users on project selection
//   useEffect(() => {
//     if (selectedProjectId) {
//       fetchUsersByProject(selectedProjectId);
//     }
//   }, [selectedProjectId]);

//   // Fetch field data on field selection
//   useEffect(() => {
//     if (selectedFields.length > 0) {
//       fetchFieldData();
//     }
//   }, [selectedFields, selectedProjectId]);

//   // Fetch Projects function
//   const fetchProjects = () => {
//     axios
//       .get(`${apiUrl}/Projects/YourProject?WhichDatabase=Local&userId=${userId}`)
//       .then((response) => {
//         const options = response.data.map((project) => ({
//           value: project.projectId,
//           label: project.projectName || 'Unnamed Project',
//         }));
//         setProjectOptions(options);
//       })
//       .catch((error) => {
//         console.error('Error fetching projects:', error);
//       });
//   };

//   // Fetch users by the project Id
//   const fetchUsersByProject = (projectId) => {
//     fetch(`${apiUrl}/Projects/users/${projectId}?WhichDatabase=Local`)
//       .then((response) => response.json())
//       .then((users) => {
//         const options = users.map((user) => ({
//           value: user.userId,
//           label: user.fullName,
//         }));
//         setUsers(options);
//       })
//       .catch((error) => {
//         console.error('Error fetching users:', error);
//       });
//   };

//   // Fetch Field Data function
//   const fetchFieldData = () => {
//     axios
//       .get(`${apiUrl}/Flags`)
//       .then((response) => {
//         console.log("Fetched data:", response.data);
//         setData(response.data || []);
//       })
//       .catch((error) => {
//         console.error('Error fetching field data:', error);
//       });
//   };

//   // Handle project change
//   const handleProjectChange = (selectedOption) => {
//     setProject(selectedOption.label);
//     setSelectedProjectId(selectedOption.value);
//   };

//   // Handle user change
//   const handleUserChange = (selectedOption) => {
//     setWorkedBy(selectedOption.value);
//   };

//   // Select fields to be printed on the screen or Report
//   const handleFieldChange = (selectedOptions) => {
//     setSelectedFields(selectedOptions || []);
//   };

//   // Select the option to perform download or preview action
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

//   // Move field in the list
//   const moveField = (fromIndex, toIndex) => {
//     const updatedFields = [...selectedFields];
//     const [movedField] = updatedFields.splice(fromIndex, 1);
//     updatedFields.splice(toIndex, 0, movedField);
//     setSelectedFields(updatedFields);
//   };

//   // Handle Excel Action
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

//   // Handle save operation
//   const handleSave = (row) => {
//     // Save logic
//   };

//   // Handle field selection
//   const handleFieldSelect = (fieldValue) => {
//     setSelectedField((prevSelectedField) => (prevSelectedField === fieldValue ? null : fieldValue));
//   };

//   return (
//     <Card title="Standard Report" style={{ width: '100%' }}>
//       <Row gutter={16} style={{ marginBottom: 16 }}>
//         <Col span={8}>
//           <Select
//             placeholder="Select Project"
//             options={projectOptions}
//             onChange={handleProjectChange}
//             style={{ width: '100%' }}
//           />
//         </Col>
//         <Col span={8}>
//           <Select
//             placeholder="Select User"
//             options={users}
//             onChange={handleUserChange}
//             style={{ width: '100%' }}
//           />
//         </Col>
//         <Col span={8}>
//           <Select
//             placeholder="Select Fields"
//             options={fieldsOptions}
//             onChange={handleFieldChange}
//             style={{ width: '100%' }}
//             isMulti
//           />
//         </Col>
//       </Row>
//       <Row gutter={16}>
//         <Col span={24}>
//           <Table
//             components={{
//               body: {
//                 cell: EditableCell,
//               },
//             }}
//             rowClassName={() => 'editable-row'}
//             dataSource={data || []}
//             columns={
//               selectedFields && selectedFields.length > 0
//                 ? selectedFields.map((field, index) => ({
//                     title: field.label,
//                     dataIndex: field.value,
//                     key: field.value,
//                     editable: true,
//                     onCell: (record) => ({
//                       record,
//                       editable: true,
//                       dataIndex: field.value,
//                       title: field.label,
//                       handleSave: handleSave,
//                     }),
//                   }))
//                 : []
//             }
//           />
//         </Col>
//       </Row>
//       <Dropdown
//         overlay={
//           <Menu onClick={handleMenuClick}>
//             <Menu.Item key="pdf">Download PDF</Menu.Item>
//             <Menu.Item key="excel">Download Excel</Menu.Item>
//             <Menu.Item key="html">Preview HTML</Menu.Item>
//           </Menu>
//         }
//       >
//         <Button type="primary">Actions</Button>
//       </Dropdown>
//       {previewType === 'pdf' && (
//         <PDFViewer width="100%" height={600}>
//           <PDFReport data={data || []} />
//         </PDFViewer>
//       )}
//     </Card>
//   );
// };

// export default ReportForm;

// import React, { useState, useEffect } from 'react';
// import { Card, Button, Row, Col, Select, message, Dropdown, Menu } from 'antd';
// import axios from 'axios';
// import { PDFViewer } from '@react-pdf/renderer';
// import PDFReport from './PdfReport';
// import { useUserInfo } from '@/store/UserDataStore';

// const { Option } = Select;
// const apiUrl = import.meta.env.VITE_API_URL; // Adjust API URL as needed

// // Main Component
// const ReportForm = () => {
//   const [projectOptions, setProjectOptions] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [data, setData] = useState([]);
//   const [previewType, setPreviewType] = useState(null);
//   const { userId } = useUserInfo();

//   // Fetch Projects Onload
//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   // Fetch flags when project changes
//   useEffect(() => {
//     if (selectedProjectId) {
//       fetchFlagsByProject(selectedProjectId);
//     }
//   }, [selectedProjectId]);

//   // Fetch Projects function
//   const fetchProjects = () => {
//     axios
//       .get(`${apiUrl}/Projects/YourProject?WhichDatabase=Local&userId=${userId}`)
//       .then((response) => {
//         const options = response.data.map((project) => ({
//           value: project.projectId,
//           label: project.projectName || 'Unnamed Project',
//         }));
//         setProjectOptions(options);
//       })
//       .catch((error) => {
//         console.error('Error fetching projects:', error);
//       });
//   };

//   // Fetch flags by the project ID
//   const fetchFlagsByProject = (projectId) => {
//     axios
//       .get(`${apiUrl}/Flags/GetFlagbyProject/${projectId}`)
//       .then((response) => {
//         setData(response.data || []);
//         console.log(response.data);
//       })
//       .catch((error) => {
//         console.error('Error fetching flags:', error);
//       });
//   };

//   // Handle project change
//   const handleProjectChange = (value) => {
//     setSelectedProjectId(value);
//   };

//   // Handle menu click for preview
//   const handleMenuClick = (e) => {
//     if (e.key === 'pdf') {
//       setPreviewType('pdf');
//     } else {
//       message.error('Invalid option');
//     }
//   };

//   return (
//     <Card title="Report Form" style={{ width: '100%' }}>
//       <Row gutter={16} style={{ marginBottom: 16 }}>
//         <Col span={24}>
//           <Select
//             placeholder="Select Project"
//             onChange={handleProjectChange}
//             style={{ width: '100%' }}
//           >
//             {projectOptions.map((option) => (
//               <Option key={option.value} value={option.value}>
//                 {option.label}
//               </Option>
//             ))}
//           </Select>
//         </Col>
//       </Row>
//       <Dropdown
//         overlay={
//           <Menu onClick={handleMenuClick}>
//             <Menu.Item key="pdf">Open PDF Report</Menu.Item>
//           </Menu>
//         }
//       >
//         <Button type="primary">Actions</Button>
//       </Dropdown>
//       {d(
//         <div>
//           <h1>Report</h1>
//         </div>,
//       )}
//       {data.length > 0 && previewType === 'pdf' && (
//         <PDFViewer width="100%" height={600}>
//           <PDFReport data={data || []} />
//         </PDFViewer>
//       )}
//     </Card>
//   );
// };

// export default ReportForm;
