import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
  message,
  Select,
  Modal,
  notification,
} from 'antd';
import './Project.css';
import { useUserInfo, useUserToken } from '@/store/UserDataStore';
import axios from 'axios';
import Draggable from 'react-draggable';
import { useDatabase } from '@/store/DatabaseStore';
import ImportProject from './ImportProject';

const apiurl = import.meta.env.VITE_API_URL;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  options,
  ...restProps
}) => {
  let inputNode;

  if (inputType === 'number') {
    inputNode = <InputNumber />;
  } else if (inputType === 'select') {
    inputNode = (
      <Select
        mode="multiple"
        options={options}
        placeholder="Select users"
        allowClear
      />
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
              message: `Please input/select ${title}!`,
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
};


function Project() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const { userId } = useUserInfo();
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const database = useDatabase();
  const [filteredData, setFilteredData] = useState([]);
  const token = useUserToken();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${apiurl}/Projects/YourProject?WhichDatabase=${database}&userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const fetchedData = response.data.map((item, index) => ({
        ...item,
        key: item.projectId.toString(),
        serialNo: index + 1,
      }));

      setData(fetchedData);
      setFilteredData(fetchedData); // Update filteredData as well
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiurl}/Users?WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = await response.json();
      setUsers(users.map((user) => ({ value: user.userId, label: user.fullName })));
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
    const lastRow = data[0];
    if (lastRow && lastRow.projectName.trim() === '') {
      const newData = [...data];
      newData.shift();
      setData(newData);
      setFilteredData(newData);
      setHasUnsavedChanges(false);
    }
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const isDuplicate = newData.some(
          (item) =>
            item.projectName === row.projectName &&
            item.key !== key // Exclude the current editing row
        )
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
          userAssigned: row.userAssigned.map(
            (userName) => users.find((user) => user.label === userName)?.value || userName,
          ), // Convert user names to IDs
        };

        if (item.method === 'POST') {
          await addRow(updatedRow);
        } else {
          newData.splice(index, 1, updatedRow);
          await updateRow(updatedRow);
        }
        setData(newData);
        setFilteredData(newData);
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
          userAssigned: row.userAssigned.map(
            (userName) => users.find((user) => user.label === userName)?.value || userName,
          ), // Convert user names to IDs
        };
        await addRow(newRow);
        setData([...newData, newRow]);
        setFilteredData([...newData, newRow]);
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
            Authorization: `Bearer ${token}`,
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


  const showConfirmModal = (projectKey) => {
    handleConfirmModalOk(projectKey);
  };

  const handleOk = async () => {
    try {
      const newRow = await form.validateFields();
      const newRowKey = data.length + 1;
      const userAssignedIds = newRow.userAssigned.map(
        (userLabel) => users.find((user) => user.label === userLabel)?.value || userLabel
      );

      const formattedRow = {
        ...newRow,
        key: newRowKey.toString(),
        serialNo: newRowKey,
        method: 'POST',
        userAssigned: userAssignedIds,
      };

      await addRow(formattedRow);
      setData([...data, formattedRow]);
      setFilteredData([...data, formattedRow]);
      setOpen(false);
      form.resetFields();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
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
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          fetchData();
          notification.success({
            message: 'Success',
            description: 'Project Archived successfully',
            duration: 2,
          });
          const newData = data.filter((item) => item.key !== projectToArchive);
          setData(newData);
          setFilteredData(newData);
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
    const { value } = e.target;
    setSearchTerm(value);
    if (value) {
      const filteredData = data.filter((item) =>
        item.projectName.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredData(filteredData);
    } else {
      setFilteredData(data); // Reset to full data when search term is cleared
    }
  };

  const handleAdd = () => {
    setOpen(true);
    setHasUnsavedChanges(true);
    setEditingKey('');
    form.resetFields();
  };

  const addRow = async (newProject) => {
    try {
      const response = await fetch(`${apiurl}/Projects?WhichDatabase=${database}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) throw new Error('Failed to add new project');

      fetchData();

      notification.success({
        message: 'Success',
        description: 'Project added successfully',
      });

      return await response.json();
    } catch (error) {
      console.error('Error adding project:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to add project',
      });
    }
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
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      sortOrder: sortedInfo.columnKey === 'projectName' && sortedInfo.order,
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
          {Array.isArray(record.userAssigned)
            ? record.userAssigned.join(', ')
            : record.userAssigned}
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
            <Button onClick={() => save(record.key)} style={{ marginRight: 8 }} type="primary">
              Save
            </Button>
            <Button onClick={cancel}>Cancel</Button>
          </span>
        ) : (
          <span className="d-flex">
            <Button onClick={() => edit(record)} style={{ marginRight: 8 }} type="link">
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to archive this project?"
              onConfirm={() => showConfirmModal(record.key)}
            >
              <Button type="link" danger>
                Archive
              </Button>
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
        inputType:
          col.dataIndex === 'serialNo'
            ? 'number'
            : col.dataIndex === 'userAssigned'
              ? 'select'
              : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        options: col.dataIndex === 'userAssigned' ? users : [],
      }),
    };
  });

  return (
    <div className="mt-5">
      <div
        className="d-flex align-items-center justify-content-between w-100"
        style={{ marginBottom: 16 }}
      >
        <Button
          onClick={handleAdd}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Add Project
        </Button>

        <ImportProject />

        <Input
          placeholder="Search Project"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 150, marginRight: 8 }}
          allowClear
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
          dataSource={filteredData}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: handlePaginationChange, // Handle page change
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          onChange={handleChange}
        />
      </Form>
      <Modal
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move',
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
          >
            Add New Project
          </div>
        }
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        modalRender={(modal) => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            nodeRef={draggleRef}
            onStart={(event, uiData) => onStart(event, uiData)}
          >
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[
              {
                required: true,
                message: 'Please input the project name!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="userAssigned"
            label="User Assigned"
            rules={[
              {
                required: true,
                message: 'Please input the project name!',
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select users"
              options={users}
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Project;
