import { App, Button, Col, Form, Input, Row, Select, notification } from 'antd';
import Card from '@/components/card';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { handleEncrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

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

export default function GeneralTab() {
  const [form] = Form.useForm(); // Create form instance
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button loading
  const database = useDatabase();
  const token = useUserToken();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axios.get(`${apiurl}/Roles?WhichDatabase=${database}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error.message);
      }
    };

    fetchRoles();
  }, [database, token]);

  const handleSubmit = async (values) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true); // Show loading state

    try {
      const datatobesend = {
        cyphertextt: handleEncrypt(JSON.stringify({ ...values, isActive: true })), // Set isActive to true
      };
      await axios.post(`${apiurl}/Users?WhichDatabase=${database}`, datatobesend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      form.resetFields(); // Reset form fields
      notification.success({
        message: 'User added successfully!',
        duration: 3,
      });
    } catch (error) {
      console.error('Error adding user:', error.message);
    } finally {
      setIsSubmitting(false); // Hide loading state
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24} lg={16}>
        <Card>
          <Form
            form={form} // Attach the form instance
            layout="vertical"
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              roleId: '',
              isActive: true, // Default value for isActive
            }}
            labelCol={{ span: 8 }}
            className="w-full"
            onFinish={handleSubmit} // Added onFinish event handler
          >
            <Row gutter={16}>
              <Col span={12}>
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
              </Col>
              <Col span={12}>
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
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
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
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name="roleId"
                  rules={[{ required: true, message: 'Please select a role!' }]}
                >
                  <Select>
                    {roles.map((role) => (
                      <Select.Option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex w-full justify-end">
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                ADD
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
