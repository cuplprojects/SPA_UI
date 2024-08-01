import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Popconfirm, notification } from 'antd';
import axios from 'axios';
import { IconButton, Iconify } from '@/components/icon';
import RoleModal from './role-modal';
import { useDatabase } from '@/store/DatabaseStore';


const apiUrl = import.meta.env.VITE_API_URL;

const DEFAULT_ROLE_VALUE = {
  roleId: 0,
  roleName: '',
  isActive: true,
  permissionList: [],
};

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const database = useDatabase();

  useEffect(() => {
    getRoles();
  }, []);

  const getRoles = async () => {
    try {
      const response = await axios.get(`${apiUrl}/Roles?WhichDatabase=${database}`);
      setRoles(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Error getting roles',
        duration: 2,
      });
    }
  };

  const [roleModalProps, setRoleModalProps] = useState({
    formValue: { ...DEFAULT_ROLE_VALUE },
    title: 'New',
    show: false,
    onOk: async (role) => {
      try {
        if (role.roleId) {
          // Update existing role
          await axios.put(`${apiUrl}/Roles/${role.roleId}?WhichDatabase=${database}`, role);
          notification.success({
            message: 'Success',
            description: 'Role updated successfully',
            duration: 2
          });
        } else {
          // Add new role
          await axios.post(`${apiUrl}/Roles?WhichDatabase=${database}`, role);
          notification.success({
            message: 'Success',
            description: 'Role added successfully',
            duration: 2,
          });
        }
        getRoles(); // Refresh roles
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Failed to save role',
          duration: 2,
        });
      } finally {
        setRoleModalProps((prev) => ({ ...prev, show: false }));
      }
    },
    onCancel: () => {
      setRoleModalProps((prev) => ({ ...prev, show: false }));
    },
  });
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'roleId',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'roleName',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      align: 'center',
      width: 100,
      render: (status) => <span>{status === false ? 'Disable' : 'Enable'}</span>,
    },
    {
      title: 'Action',
      key: 'operation',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray">
          <IconButton onClick={() => onEdit(record)}>
            <Iconify icon="solar:pen-bold-duotone" size={18} />
          </IconButton>
          <Popconfirm
            title="Delete the Role?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => onDelete(record.roleId)}
            placement="left"
          >
            <IconButton>
              <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
            </IconButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onCreate = () => {
    setRoleModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Create New',
      formValue: { ...DEFAULT_ROLE_VALUE },
    }));
  };

  const onEdit = (formValue) => {
    setRoleModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Edit',
      formValue: { ...formValue }, // Pass the record to edit
    }));
  };

  const onDelete = async (roleId) => {
    try {
      await axios.delete(`${apiUrl}/Roles/${roleId}?WhichDatabase=${database}`);
      setRoles((prevRoles) => prevRoles.filter((role) => role.roleId !== roleId));
      message.success('Role deleted successfully');
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to delete role',
        duration: 2,
      });
    }
  };

  return (
    <Card
      title="Role List"
      extra={
        <Button type="primary" onClick={onCreate}>
          New
        </Button>
      }
    >
      <Table rowKey="roleId" size="small" pagination={false} columns={columns} dataSource={roles} />
      <RoleModal {...roleModalProps} />
    </Card>
  );
};

export default RolePage;
