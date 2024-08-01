import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Popconfirm, Table, Typography, message, Select,Modal, notification } from 'antd';
import './Project.css';
import { useUserInfo } from '@/store/UserDataStore';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';

const apiurl = import.meta.env.VITE_API_URL;

function EditableCell({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  options = [],
  children,
  ...restProps
}) {
  let inputNode;
  if (inputType === 'number') {
    inputNode = <InputNumber />;
  } else if (inputType === 'select') {
    inputNode = (
      <Select mode="multiple" style={{ width: '100%' }}>
        {options.map(option => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    );
  } else {
    inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function Project() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const {userId} = useUserInfo();
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const database = useDatabase();

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

 

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiurl}/Projects/YourProject?WhichDatabase=${database}&userId=${userId}`);
      const fetchedData = response.data.map((item, index) => ({
        ...item,
        key: item.projectId.toString(),
        serialNo: index + 1,
      }));
    
      setData(fetchedData);
      // setFilteredData(fetchedData); // Update filteredData as well
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiurl}/Users?WhichDatabase=${database}`);
      const users = await response.json();
      setUsers(users.map(user => ({ value: user.userId, label: user.fullName })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo({
      order: sorter.order,
      columnKey: sorter.field,
    });
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      projectName: record.projectName,
      userAssigned: record.userAssigned || [],
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
    const lastRow = data[data.length - 1];
    if (lastRow && lastRow.projectName.trim() === '') {
      const newData = [...data];
      newData.pop();
      setData(newData);
      setHasUnsavedChanges(false);
    }
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
  
      if (index > -1) {
        const isDuplicate = newData.some((item, idx) => idx !== index && item.projectName === row.projectName);
        if (isDuplicate) {
          notification.error({
            message: 'Duplicate Project Name',
            description: 'Project name already exists. Please enter a unique name.',
          });
          return;
        }
  
        const item = newData[index];
        const updatedRow = {
          ...item,
          ...row,
          userAssigned: row.userAssigned.map(userName => users.find(user => user.label === userName)?.value || userName) // Convert user names to IDs
        };
  
        if (item.method === 'POST') {
          await addRow(updatedRow);
        } else {
          newData.splice(index, 1, updatedRow);
          await updateRow(updatedRow);
        }
        setData(newData);
        setEditingKey('');
        setHasUnsavedChanges(false);
      } else {
        const isDuplicate = newData.some((item) => item.projectName === row.projectName);
        if (isDuplicate) {
          notification.error({
            message: 'Duplicate Project Name',
            description: 'Project name already exists. Please enter a unique name.',
          });
          return;
        }
  
        const newRow = {
          ...row,
          userAssigned: row.userAssigned.map(userName => users.find(user => user.label === userName)?.value || userName) // Convert user names to IDs
        };
        await addRow(newRow);
        setData([...newData, newRow]);
        setEditingKey('');
        setHasUnsavedChanges(false);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  
  

  const updateRow = async (updatedRow) => {
    try {
      const response = await fetch(
        `${apiurl}/Projects/${updatedRow.projectId}?WhichDatabase=${database}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedRow),
        },
      );
      fetchData();
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };
  

  const addRow = async (newRow) => {
    try {
      const response = await fetch(`${apiurl}/Projects?WhichDatabase=${database}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRow),
      });
      if (!response.ok) {
        cancel();
        throw new Error('Failed to add new project');
      }
      fetchData();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error adding new project:', error);
    }
  };

  const showConfirmModal = (projectKey) => {
    handleConfirmModalOk(projectKey)
  };

  // final archive confirm 
  const handleConfirmModalOk = async (projectToArchive) => {
    if (projectToArchive) {
      try {
        const response = await fetch(
          `${apiurl}/Projects/${projectToArchive}/archive?userId=${userId}&WhichDatabase=${database}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
  
        if (response.ok) {
          fetchData()
          notification.success({
            message: 'Success',
            description: 'Project Archived successfully',
            duration:2
          });
          setData(data.filter((item) => item.key !== projectToArchive));
        } else {
          notification.error({
            message: 'Error',
            description: 'Failed to Archive project',
          });
        }
      } catch (error) {
        console.error('Error Archiving project:', error);
        notification.error({
          message: 'Error',
          description: 'Error Archiving project',
        });
      }
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filteredData = data.filter(item =>
      item.projectName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setData(filteredData);
  };

  const handleAdd = () => {
    const newRowKey = data.length + 1;
    const newData = {
      key: newRowKey.toString(),
      serialNo: newRowKey,
      projectName: '',
      userAssigned: [],
      method: 'POST',
    };
    setData([...data, newData]);
    setEditingKey(newRowKey.toString());
    setHasUnsavedChanges(true);
  };

  const columns = [
    {
      title: 'Serial No',
      dataIndex: 'serialNo',
      width: '10%',
      sorter: (a, b) => a.serialNo - b.serialNo,
      sortOrder: sortedInfo.columnKey === 'serialNo' && sortedInfo.order,
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      width: '50%',
      editable: true,
    },
    {
      title: 'User Assigned',
      dataIndex: 'userAssigned',
      width: '35%',
      editable: true,
      sorter: (a, b) => a.userAssigned.length - b.userAssigned.length,
      sortOrder: sortedInfo.columnKey === 'userAssigned' && sortedInfo.order,
      render: (_, record) => (
        <span>
          {Array.isArray(record.userAssigned) ? record.userAssigned.join(', ') : record.userAssigned}
        </span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
              type="primary"
            >
              Save
            </Button>
            <Button onClick={cancel}>Cancel</Button>
          </span>
        ) : (
          <span className='d-flex'>
            <Button
              onClick={() => edit(record)}
              style={{ marginRight: 8 }}
              type="link"
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to archive this project?"
              onConfirm={() => showConfirmModal(record.key)}
            >
              <Button type="link" danger>Archive</Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'serialNo' ? 'number' : col.dataIndex === 'userAssigned' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        options: col.dataIndex === 'userAssigned' ? users : [],
      }),
    };
  });

  return (
    <div className="mt-5">
      <div className="d-flex align-items-center justify-content-between w-100"  style={{ marginBottom: 16 }}>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{ marginBottom: 16 }}
        disabled={hasUnsavedChanges}
        >
        Add Project
      </Button>
        <Input
          placeholder="Search Project"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 100, marginRight: 8 }}
        />
      
        </div>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{ onChange: cancel }}
          onChange={handleChange}
        />
      </Form>
    </div>
  );
}

export default Project;


