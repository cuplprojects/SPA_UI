import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useDatabase } from '@/store/DatabaseStore';

const { Title, Text } = Typography;
const apiurl = import.meta.env.VITE_API_URL;
const RegisterPage = () => {
  const location = useLocation();
  const [form] = Form.useForm();
  const selectedPlan = location.state?.selectedPlan || localStorage.getItem('selectedPlan');
  const [loading, setLoading] = useState(false);
  const database = useDatabase();

  const validateName = (_, value) => {
    if (!value || /^[a-zA-Z. ]*$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter valid name.');
  };

  const validateEmail = (_, value) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!value || emailPattern.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid email address!');
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiurl}/Users/WithoutEncryption?WhichDatabase=${database}`,
        {
          ...values,
          plan: selectedPlan,
          tenantId: 0 // Always send tenantId: 0
        },
      );

      localStorage.setItem('token', response.data.token);
      localStorage.removeItem('selectedPlan');
      form.resetFields(); // Reset form fields
      notification.success({
        message: 'User added successfully!',
        duration: 3,
      });
      window.location.href = '/dashboard';
    } catch (error) {
      message.error('Registration failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: '24px', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <Title level={3}>Register Your Organization</Title>

      {selectedPlan && (
        <Text type="secondary">Selected Plan: <strong>{selectedPlan}</strong></Text>
      )}
      <Form
        form={form} // Attach the form instance
        layout="vertical"
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          roleId: '1',
          organization: '',
          tenantId: 0,
          plan: selectedPlan,
          isActive: true, // Default value for isActive
        }}
        labelCol={{ span: 8 }}
        style={{ marginTop: 24 }}
        onFinish={onFinish} // Added onFinish event handler
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[
            { required: true, message: 'Please enter your first name!' },
            { validator: validateName }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[
            { required: true, message: 'Please enter your last name!' },
            { validator: validateName }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { validator: validateEmail }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Organization Name"
          name="organization"
          rules={[{ required: true, message: 'Please enter your organization name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register & Subscribe
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;
