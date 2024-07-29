import React from 'react';
import { App, Button, Form, Input, Typography } from 'antd';
import Card from '@/components/card';
import useChangePassword from '@/CustomHooks/useChangePassword'; // Adjust the import path as needed

const SecurityTab = () => {
  const { notification } = App.useApp();
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

    try {
      await changePassword(values.oldPassword, values.newPassword);

      if (success) {
        notification.success({
          message: 'Update success!',
          duration: 3,
        });
      } else {
        notification.error({
          message: 'Update failed!',
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Update failed!',
        description: error.message,
        duration: 3,
      });
    }
  };

  return (
    <Card className="!h-auto flex-col">
      <Typography.Title level={5}>Change Password</Typography.Title>
      <Form
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
          rules={[{ required: true, message: 'Please input your new password!' }]}
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
