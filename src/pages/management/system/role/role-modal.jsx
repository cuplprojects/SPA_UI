import React, { useEffect, useState } from 'react';
import { Form, Modal, Input, Radio, Tree, message } from 'antd';
import { flattenTrees } from '@/utils/tree';
import { PERMISSION_LIST } from '@/_mock/assets'; // Ensure this import is correct

const PERMISSIONS = PERMISSION_LIST;

const RoleModal = ({ title, show, formValue, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [checkedKeys, setCheckedKeys] = useState([]);

  useEffect(() => {
    form.setFieldsValue({ ...formValue });

    // Flatten permissions tree and get checked keys from form value
    const initialCheckedKeys = flattenTrees(PERMISSIONS, 'children')
      .filter((permission) => formValue.permissionList.includes(permission.id))
      .map((permission) => permission.id);

    // Add the default key `20` if not already present
    const defaultCheckedKeys = Array.from(new Set([...initialCheckedKeys, '20'])); // Ensures key `20` is always included
    setCheckedKeys(defaultCheckedKeys);
  }, [formValue, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedRole = {
        ...values,
        roleId: formValue.roleId, // Ensure roleId is included in the updated role object
        permissionList: checkedKeys,
      };
      await onOk(updatedRole);
      message.success('Role saved successfully');
    } catch (error) {
      message.error('Failed to save role');
    }
  };

  const onTreeCheck = (checkedKeysValue) => {
    // Ensure key `20` is always included
    const newCheckedKeys = Array.from(new Set([...checkedKeysValue, '20']));
    setCheckedKeys(newCheckedKeys);
  };

  return (
    <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel}>
      <Form form={form} initialValues={formValue} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="Name" name="roleName" rules={[{ required: true, message: 'Please enter name' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Status" name="isActive" rules={[{ required: true, message: 'Please select status' }]}>
          <Radio.Group>
            <Radio value={true}>Enable</Radio>
            <Radio value={false}>Disable</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Permission" name="permissionList">
          <Tree
            checkable
            checkedKeys={checkedKeys}
            onCheck={onTreeCheck}
            treeData={PERMISSIONS}
            fieldNames={{ key: 'id', children: 'children', title: 'name' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
