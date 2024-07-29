import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, Tag, Popconfirm, Row, Col } from 'antd';
import axios from 'axios';
import { useMessage } from './../../../utils/alerts/MessageContext'; // Adjust the path based on your setup

const { TextArea } = Input;
const { Option } = Select;

const MessagePage = () => {
  const showMessage = useMessage(); // Accessing showMessage function from MessageContext
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentMessage, setCurrentMessage] = useState(null);
  const [filters, setFilters] = useState({ module: '', operation: '', status: '' });

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [filters, messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('https://localhost:7290/api/Messages');
      setMessages(response.data);
      setFilteredMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const filterMessages = () => {
    setFilteredMessages(
      messages.filter(
        (msg) =>
          (!filters.module || msg.module.toLowerCase().includes(filters.module.toLowerCase())) &&
          (!filters.operation || msg.operation === filters.operation) &&
          (!filters.status || msg.status === filters.status),
      ),
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleEdit = (message) => {
    setCurrentMessage(message);
    form.setFieldsValue(message);
    setVisible(true);
  };

  const handleAddOrUpdate = () => {
    form.validateFields().then(async (values) => {
      try {
        if (currentMessage) {
          await axios.put(`https://localhost:7290/api/Messages/${values.id}`, values);
          showMessage('Message', 'update', 'success');
        } else {
          await axios.post('https://localhost:7290/api/Messages', values);
          showMessage('Message', 'create', 'success');
        }
        fetchMessages();
        setVisible(false);
      } catch (error) {
        console.error('Failed to add/update message:', error);
        showMessage('Message', 'update', 'error');
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://localhost:7290/api/Messages/${id}`);
      fetchMessages();
      showMessage('success', 'Message deleted successfully.');
    } catch (error) {
      console.error('Failed to delete message:', error);
      showMessage('error', 'Failed to delete message.');
    }
  };

  const handleAdd = () => {
    setVisible(true);
    setCurrentMessage(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Module', dataIndex: 'module', key: 'module' },
    { title: 'Operation', dataIndex: 'operation', key: 'operation' },
    { title: 'English Title', dataIndex: 'enUsTitle', key: 'enUsTitle' },
    { title: 'English Description', dataIndex: 'enUsDescription', key: 'enUsDescription' },
    { title: 'Hindi Title', dataIndex: 'hiInTitle', key: 'hiInTitle' },
    { title: 'Hindi Description', dataIndex: 'hiInDescription', key: 'hiInDescription' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'success':
            color = 'green';
            break;
          case 'error':
            color = 'red';
            break;
          case 'warning':
            color = 'orange';
            break;
          case 'info':
            color = 'blue';
            break;
          default:
            color = 'gray';
        }
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this message?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="text-end">
        <Button type="primary" onClick={handleAdd} style={{ marginBottom: '1rem' }}>
          Add New Message
        </Button>
      </div>
      <Row gutter={16} style={{ marginBottom: '1rem' }}>
        <Col span={6}>
          <Input
            placeholder="Filter by Module"
            value={filters.module}
            onChange={(e) => handleFilterChange('module', e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filter by Operation"
            value={filters.operation}
            onChange={(value) => handleFilterChange('operation', value)}
            style={{ width: '100%' }}
          >
            <Option value="">All</Option>
            <Option value="create">Create</Option>
            <Option value="read">Read</Option>
            <Option value="update">Update</Option>
            <Option value="delete">Delete</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filter by Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            style={{ width: '100%' }}
          >
            <Option value="">All</Option>
            <Option value="success">Success</Option>
            <Option value="error">Error</Option>
            <Option value="warning">Warning</Option>
            <Option value="info">Info</Option>
          </Select>
        </Col>
      </Row>

      <Table dataSource={filteredMessages} columns={columns} rowKey="id" />

      <Modal
        title={currentMessage ? 'Edit Message' : 'Add New Message'}
        open={visible}
        onCancel={handleCancel}
        onOk={handleAddOrUpdate}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="module"
            label="Module"
            rules={[{ required: true, message: 'Please enter module' }]}
          >
            <Input disabled={!!currentMessage} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operation"
                label="Operation"
                rules={[{ required: true, message: 'Please select operation' }]}
              >
                <Select disabled={!!currentMessage}>
                  <Option value="create">Create</Option>
                  <Option value="read">Read</Option>
                  <Option value="update">Update</Option>
                  <Option value="delete">Delete</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select disabled={!!currentMessage}>
                  <Option value="success">Success</Option>
                  <Option value="error">Error</Option>
                  <Option value="warning">Warning</Option>
                  <Option value="info">Info</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="enUsTitle"
            label="English Title"
            rules={[{ required: true, message: 'Please enter English title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="enUsDescription"
            label="English Description"
            rules={[{ required: true, message: 'Please enter English description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="hiInTitle"
            label="हिंदी शीर्षक"
            rules={[{ required: true, message: 'Please enter Hindi title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="hiInDescription"
            label="हिंदी विवरण"
            rules={[{ required: true, message: 'Please enter Hindi description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagePage;
