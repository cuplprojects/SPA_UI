import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import {
  Card,
  Button,
  Row,
  Col,
  Table,
  Typography,
  Dropdown,
  Menu,
  Input,
  List,
  message,
  Avatar,
  Tooltip,
} from 'antd';
import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import { useUserInfo } from '@/store/UserDataStore';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;
const apiUrl = import.meta.env.VITE_API_URL; // Adjust API URL as needed

// DraggableField Component
const DraggableField = ({ field, index, moveField, isSelected, onSelect }) => {
  const [, ref] = useDrag({
    type: 'FIELD',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'FIELD',
    hover: (item) => {
      if (item.index !== index) {
        moveField(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      style={{
        padding: '8px',
        border: isSelected ? '2px solid #1890ff' : '1px solid #ddd',
        marginBottom: '4px',
        cursor: 'move',
        backgroundColor: isSelected ? '#e6f7ff' : '#fff',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
      onClick={() => onSelect(field.value)}
    >
      {field.label}
    </div>
  );
};

// EditableCell Component
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
  };

  const save = async () => {
    try {
      const values = await form.current.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Input
        ref={inputRef}
        defaultValue={record[dataIndex]}
        onPressEnter={save}
        onBlur={save}
        style={{ borderRadius: '4px' }}
      />
    ) : (
      <div style={{ paddingRight: 24, cursor: 'pointer' }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

// Main Component
const ReportForm = () => {
  const [project, setProject] = useState('');
  const { userId } = useUserInfo();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [workedBy, setWorkedBy] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);
  const [fieldsOptions, setFieldsOptions] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [data, setData] = useState([]);
  const [previewType, setPreviewType] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  // Fetch Projects Onload
  useEffect(() => {
    fetchProjects();
  }, []);

  // fetch users and fields on that project
  useEffect(() => {
    if (selectedProjectId) {
      fetchUsersByProject(selectedProjectId);
      fetchFields(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedFields.length > 0) {
      fetchFieldData();
    }
  }, [selectedFields]);

  // fetch Project function
  const fetchProjects = () => {
    axios
      .get(`${apiUrl}/Projects/YourProject?WhichDatabase=Local&userId=${userId}`)
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

  // fetch uses by the project Id
  const fetchUsersByProject = (projectId) => {
    fetch(`${apiUrl}/Projects/users/${projectId}?WhichDatabase=Local`)
      .then((response) => response.json())
      .then((users) => {
        const options = users.map((user) => ({
          value: user.userId,
          label: user.fullName,
        }));
        setUsers(options);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  };

  // Fetch the Fields from Fieldconfig of the Project
  const fetchFields = (projectId) => {
    fetch(`${apiUrl}/FieldConfigurations/GetByProjectId/${projectId}?WhichDatabase=Local`)
      .then((response) => response.json())
      .then((data) => {
        const options = data.map((field) => ({
          value: field.fieldConfigurationId ? field.fieldConfigurationId.toString() : '',
          label: field.fieldName || 'Unnamed Field',
        }));
        options.unshift({ value: 'select_all', label: 'Select All' }); // Add "Select All" option
        setFieldsOptions(options);
      })
      .catch((error) => {
        console.error('Error fetching fields:', error);
      });
  };

  // geting data to be printed on the report as of now it is taking the data of corrected fields
  // It will chnange as per report requirenment
  const fetchFieldData = () => {
    fetch(`${apiUrl}/Correction/GetAllCorrectedOmrData?WhichDatabase=Local`)
      .then((response) => response.json())
      .then((data) => {
        const tableData = data.map((item, index) => {
          const correctedData = JSON.parse(item.correctedOmrData || '{}');
          const rowData = {};
          selectedFields.forEach((field) => {
            rowData[field.value] = correctedData[field.label] || '';
          });
          return { key: index + 1, ...rowData };
        });
        setData(tableData);
      })
      .catch((error) => {
        console.error('Error fetching field data:', error);
      });
  };

  // handle project change when I select the project
  const handleProjectChange = (selectedOption) => {
    setProject(selectedOption.label);
    setSelectedProjectId(selectedOption.value);
  };

  // select Change the Field to be print on the screen or Report
  const handleFieldChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === 'select_all')) {
      setSelectedFields(fieldsOptions.filter((option) => option.value !== 'select_all'));
    } else {
      setSelectedFields(selectedOptions);
    }
  };

  // Select The option to be perform select download pdf or htmlView or Excel
  const handleMenuClick = (e) => {
    switch (e.key) {
      case 'pdf':
        setPreviewType('pdf');
        break;
      case 'excel':
        handleExcelAction();
        break;
      case 'html':
        setPreviewType('html');
        break;
      default:
        message.error('Invalid option');
    }
  };

  const moveField = (fromIndex, toIndex) => {
    const updatedFields = [...selectedFields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setSelectedFields(updatedFields);
  };

  const handleExcelAction = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        ...item,
        key: item.key,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'report.xlsx');
  };

  const handleSave = (row) => {
    // Save logic
  };

  const handleFieldSelect = (fieldValue) => {
    setSelectedField((prevSelectedField) => (prevSelectedField === fieldValue ? null : fieldValue));
  };

  return (
    <Card title="Generate Report" style={{ width: '100%' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Select
            options={projectOptions}
            onChange={handleProjectChange}
            placeholder="Select Project"
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={16}>
          <Select
            options={fieldsOptions}
            onChange={handleFieldChange}
            isMulti
            placeholder="Select Fields"
            value={selectedFields}
            style={{ width: '100%' }}
          />
        </Col>
        
      </Row>
      <Row>
       
      </Row>
      <Row gutter={16} style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Col>
          <Dropdown
            overlay={
              <Menu onClick={handleMenuClick}>
                <Menu.Item key="pdf">Generate PDF</Menu.Item>
                <Menu.Item key="excel">Download Excel</Menu.Item>
                <Menu.Item key="html">Download Html</Menu.Item>
              </Menu>
            }
          >
            <Button type="primary" size="large">
              Export
            </Button>
          </Dropdown>
        </Col>
      </Row>
      {previewType === 'pdf' && (
        <PDFViewer width="100%" height="600">
          <PDFReport
            project={project}
            selectedFields={selectedFields}
            data={data}
            workedBy={workedBy}
          />
        </PDFViewer>
      )}
      {previewType === 'html' && (
        <div style={{ marginTop: 16, padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
          <Title level={4}>HTML View</Title>
          <DndProvider backend={HTML5Backend}>
            <div
              className="d-flex"
              style={{ marginBottom: 16, padding: '10px', borderRadius: '8px', width: '100%' }}
            >
              <List
                bordered
                dataSource={selectedFields}
                renderItem={(item, index) => (
                  <DraggableField
                    key={item.value}
                    field={item}
                    index={index}
                    moveField={moveField}
                    isSelected={item.value === selectedField}
                    onSelect={handleFieldSelect}
                  />
                )}
                style={{ background: '#fff', borderRadius: '8px', width: '25%' }}
              />
            </div>
            <Table
              dataSource={data}
              columns={[
                { title: 'S.No.', dataIndex: 'key', key: 'key', editable: false },
                ...selectedFields.map((field) => ({
                  title: field.label,
                  dataIndex: field.value,
                  key: field.value,
                  editable: true,
                })),
              ]}
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              rowClassName="editable-row"
              pagination={false}
              bordered
              style={{ background: '#fff', borderRadius: '8px' }}
              onCell={(record, rowIndex) => ({
                record,
                editable: true,
                handleSave: handleSave,
              })}
            />
          </DndProvider>
        </div>
      )}
    </Card>
  );
};

export default ReportForm;
