import React, { useEffect } from 'react';
import { App, Button, Form, Input, Typography } from 'antd';
import Card from '@/components/card';
import useChangePassword from '@/CustomHooks/useChangePassword'; // Adjust the import path as needed

const SecurityTab = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm(); // Get the form instance
  const { changePassword, loading, error, success } = useChangePassword(); // Use the custom hook

  const initFormValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: 'New password and confirm password do not match!',
        duration: 3,
      });
      return;
    }

    await changePassword(values.oldPassword, values.newPassword);
  };

  // Handle error and success display in the component
  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Update failed!',
        description: error,
        duration: 3,
      });
    }
    if (success) {
      notification.success({
        message: 'Password updated successfully!',
        duration: 3,
      });
      form.resetFields(); // Clear the form fields on success
    }
  }, [error, success, notification, form]);

  return (
    <Card className="!h-auto flex-col">
      <Typography.Title level={5}>Change Password</Typography.Title>
      <Form
        form={form} // Pass the form instance
        layout="vertical"
        initialValues={initFormValues}
        onFinish={handleSubmit}
        labelCol={{ span: 8 }}
        className="w-full"
      >
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={[{ required: true, message: 'Please input your old password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input your new password!' }, {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
            message:
              'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
          },]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[{ required: true, message: 'Please confirm your new password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <div className="flex w-full justify-end">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SecurityTab;
