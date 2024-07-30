import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Table, Typography,message } from 'antd';
import Draggable from 'react-draggable';
import './../Projects/Project.css';
import { useDatabase } from '@/store/DatabaseStore';


const apiurl = import.meta.env.VITE_API_URL;


const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
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
};

const Field = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [open, setOpen] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const database = useDatabase();

  const isEditing = (record) => record.key === editingKey;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiurl}/Fields?WhichDatabase=${database}`);
      const data = await response.json();
     const formattedData = data.map((item, index) => ({ ...item, key: index.toString(), serialNo: index + 1 }));
      setData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const edit = (record) => {
    form.setFieldsValue({
      fieldName: record.fieldName,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    const lastRow = data[data.length - 1];
    if (lastRow && lastRow.projectName.trim() === '') {
      // Remove the last row if Project Name is blank
      const newData = [...data];
      newData.pop();
      setData(newData);
      setFilteredData(newData)
      setHasUnsavedChanges(false);
    }
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
  
      if (index > -1) {
        // Editing existing row
        const isDuplicate = newData.some((item, idx) => idx !== index && item.fieldName === row.fieldName);
        if (isDuplicate) {
          message.error('Field name already exists. Please enter a unique name.');
          return;
        }
  
        const item = newData[index];
        if (item.method === 'POST') {
          await fetchData();
        } else {
          newData.splice(index, 1, { ...item, ...row });
          await updateRow(newData[index]);
        }
      } else {
        // Adding new row
        const isDuplicate = newData.some((item) => item.fieldName === row.fieldName);
        if (isDuplicate) {
          message.error('Field name already exists. Please enter a unique name.');
          return;
        }
  
        await addRow(row);
        newData.push(row);
      }
  
      setData(newData); // Update state with new data
      setFilteredData(newData)
      setEditingKey('');
      setHasUnsavedChanges(false);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  

  const updateRow = async (updatedRow) => {
    try {
      const response = await fetch(`${apiurl}/Fields/${updatedRow.fieldId}?WhichDatabase=${database}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRow),
      });
      if (!response.ok) {
        throw new Error('Failed to update field');
      }
      fetchData();
      // Handle success
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const addRow = async (newRow) => {
    try {
      const response = await fetch(`${apiurl}/Fields?WhichDatabase=${database}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRow),
      });
      if (!response.ok) {
        throw new Error('Failed to add new field');
      }
      fetchData();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error adding new field:', error);
    }
  };

  const handleAdd = () => {
    setOpen(true);
    setHasUnsavedChanges(true);
  };

  const handleOk = async () => {
    try {
      const newRow = await form.validateFields();
      const newRowKey = data.length + 1;
      newRow.key = newRowKey.toString();
      newRow.serialNo = newRowKey;
      newRow.method = 'POST';

      await addRow(newRow);
      setData([...data, newRow]);
      setFilteredData([...data, newRow])
      setOpen(false);
      form.resetFields();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

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
  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setSortedInfo({
      order: sorter.order,
      columnKey: sorter.field,
    });
  };
  const columns = [
    {
      title: 'Serial No',
      dataIndex: 'serialNo',
      width: '15%',
      sorter: (a, b) => a.serialNo - b.serialNo,
      sortOrder: sortedInfo.columnKey === 'serialNo' && sortedInfo.order,
    },
    {
      title: 'Field Name',
      dataIndex: 'fieldName',
      width: '70%',
      editable: true,
      sorter: (a, b) => a.fieldName.length - b.fieldName.length,
      sortOrder: sortedInfo.columnKey === 'fieldName' && sortedInfo.order,
      render: (_, record) => (
        <span>{record.fieldName}</span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <div>
            {editable ? (
              <span>
                <Typography.Link
                  onClick={() => save(record.key)}
                  style={{ marginRight: 8 }}
                >
                  Save
                </Typography.Link>
                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                  <a>Cancel</a>
                </Popconfirm>
              </span>
            ) : (
              <Typography.Link
                disabled={editingKey !== '' && editingKey !== record.key}
                onClick={() => edit(record)}
              >
                Edit
              </Typography.Link>
            )}
          </div>
        );
      },
    }
  ];


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filtered = data.filter(item =>
      item.fieldName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredData(filtered);
  };


  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'fieldId' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className='mt-5'>
      <div className="d-flex align-items-center justify-content-between w-100" style={{ marginBottom: 16 }}>
        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
          Add Field
        </Button>
        <Input
          placeholder="Search Field"
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
          dataSource={filteredData}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
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
            Add New Field
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
            name="fieldName"
            label="Field Name"
            rules={[
              {
                required: true,
                message: 'Please input the field name!',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Field;
