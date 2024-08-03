import { App, Button, Col, Form, Input, Row, Space, Switch, Select,notification } from 'antd';
import Card from '@/components/card';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { handleEncrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

export default function GeneralTab() {

  const [form] = Form.useForm(); // Create form instance
const database = useDatabase();
  const [roles, setRoles] = useState([]);
  const isSubmitting = useRef(false); // Ref to track submission state
  const token = useUserToken();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${apiurl}/Roles?WhichDatabase=${database}`,{
          headers:{
          Authorization : `Bearer ${token}`
        }}); // Adjust the API endpoint as needed
        setRoles(res.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (values) => {
    if (isSubmitting.current) {
      return; // Ignore subsequent submissions
    }
    isSubmitting.current = true; // Set the flag to true
    try {
      const datatobesend = {
        cyphertextt : handleEncrypt(JSON.stringify(values))
      };
      await axios.post(`${apiurl}/Users?WhichDatabase=${database}`, datatobesend,{
        headers:{
        Authorization : `Bearer ${token}`
      }});
      form.resetFields(); // Reset form fields
      notification.success({
        message: 'User added successfully!',
        duration: 3,
      });
    } catch (error) {
      console.log(error.message);
    } finally {
      isSubmitting.current = false; // Reset the flag
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
              isActive: true
            }} // Set initialValues to populate the form
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
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name="roleId"
                  rules={[
                    { required: true, message: 'Please select a role!' },
                  ]}
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
              <Button type="primary" htmlType="submit">
                ADD
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
