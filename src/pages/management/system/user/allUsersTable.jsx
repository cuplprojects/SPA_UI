import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Col,
  Input,
  Row,
  Select,
  notification,
  Modal,
  Popconfirm,
  Switch,
  Table,
} from 'antd';
import { useRouter } from '@/router/hooks';
import { Icon } from '@iconify/react';
import editOutlined from '@iconify/icons-ant-design/edit-outlined';
import deleteOutlined from '@iconify/icons-ant-design/delete-outlined';
import { handleEncrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

const GeneralTab = () => {
  const { push } = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    roleName: '',
    isActive: true,
  });

  const [userList, setUserList] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingLoading, setSavingLoading] = useState(false); // State for saving loading
  const [deletingLoading, setDeletingLoading] = useState(false); // State for deleting loading
  const database = useDatabase();
  const token = useUserToken();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsersAndRoles = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axios.get(`${apiurl}/Users?WhichDatabase=${database}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiurl}/Roles?WhichDatabase=${database}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const roleMap = rolesRes.data.reduce((acc, role) => {
        acc[role.roleId] = role.roleName;
        return acc;
      }, {});

      const usersWithRoleNames = usersRes.data.map((user) => ({
        ...user,
        roleName: roleMap[user.roleId],
        isActive: user.isActive,
      }));

      setUserList(usersWithRoleNames);
      setRoles(rolesRes.data);
      setFilteredUserList(usersWithRoleNames);
    } catch (error) {
      console.error('Error fetching users and roles:', error.message);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredData = userList.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.roleName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUserList(filteredData);
    } else {
      setFilteredUserList(userList);
    }
  }, [searchTerm, userList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedData = filteredUserList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRoleChange = (value) => {
    const selectedRole = roles.find((role) => role.roleId === value);
    setUserData((prev) => ({ ...prev, roleId: value, roleName: selectedRole?.roleName }));
  };

  const handleStatusChange = async (checked, userId) => {
    try {
      const user = userList.find((user) => user.userId === userId);
      if (!user) throw new Error('User not found');

      const updatedUser = { ...user, isActive: checked };
      const datatobesentencrypted = { cyphertextt: handleEncrypt(JSON.stringify(updatedUser)) };

      await axios.put(
        `${apiurl}/Users/${userId}?WhichDatabase=${database}`,
        datatobesentencrypted,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setUserList((prev) =>
        prev.map((user) => (user.userId === userId ? { ...user, isActive: checked } : user)),
      );

      notification.success({ message: 'User status updated successfully!', duration: 3 });
    } catch (error) {
      console.error('Error updating user status:', error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.userId);
    setUserData(user);
  };

  const handleSave = async (userId) => {
    setSavingLoading(true); // Set loading state to true
    try {
      const datatobesend = { cyphertextt: handleEncrypt(JSON.stringify(userData)) };
      await axios.put(`${apiurl}/Users/${userId}?WhichDatabase=${database}`, datatobesend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUserId(null);
      setUserData({
        firstName: '',
        lastName: '',
        email: '',
        roleId: '',
        roleName: '',
        isActive: false,
      });
      notification.success({ message: 'User updated successfully!', duration: 3 });
      fetchUsersAndRoles(); // Refetch users to update the list
    } catch (error) {
      notification.error({
        message: 'Error updating user',
        description: error.message
      })
      console.error('Error updating user:', error.message);
    } finally {
      setSavingLoading(false); // Set loading state to false
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setUserData({
      firstName: '',
      lastName: '',
      email: '',
      roleId: '',
      roleName: '',
      isActive: false,
    });
  };

  const showDeleteConfirm = (userId) => {
    setUserIdToDelete(userId);
    setDeleteModalVisible(true);
  };

    const handleChanges = (pagination, filters, sorter) => {
    setSortedInfo({
      order: sorter.order,
      columnKey: sorter.field,
    });
  };

  const handleDelete = async () => {
    setDeletingLoading(true); // Set loading state to true
    try {
      await axios.delete(`${apiurl}/Users/${userIdToDelete}?WhichDatabase=${database}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notification.success({ message: 'User deleted successfully!', duration: 3 });
      fetchUsersAndRoles(); // Refetch users to update the list
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting user:', error.message);
    } finally {
      setDeletingLoading(false); // Set loading state to false
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const columns = [
    {
      title: 'SN.',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
      sorter: (a, b) => a.index - b.index,
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text, record) =>
        editingUserId === record.userId ? (
          <Input name="firstName" value={userData.firstName} onChange={handleChange} />
        ) : (
          text
        ),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      render: (text, record) =>
        editingUserId === record.userId ? (
          <Input name="lastName" value={userData.lastName} onChange={handleChange} />
        ) : (
          text
        ),
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) =>
        editingUserId === record.userId ? (
          <Input name="email" value={userData.email} onChange={handleChange} />
        ) : (
          text
        ),
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (text, record) =>
        editingUserId === record.userId ? (
          <Select value={userData.roleId} onChange={handleRoleChange} style={{ width: 120 }}>
            {roles.map((role) => (
              <Select.Option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </Select.Option>
            ))}
          </Select>
        ) : (
          text
        ),
      sorter: (a, b) => a.roleName.localeCompare(b.roleName),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(checked, record.userId)}
        />
      ),
      sorter: (a, b) => a.isActive - b.isActive,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          {editingUserId === record.userId ? (
            <>
              <Button
                type="primary"
                onClick={() => handleSave(record.userId)}
                loading={savingLoading} // Add loading state
              >
                Save
              </Button>
              <Button type="default" onClick={handleCancel} style={{ marginLeft: 8 }}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                icon={<Icon icon={editOutlined} />}
                onClick={() => handleEdit(record)}
                style={{ marginRight: 8 }}
              ></Button>
              {/* <Popconfirm
                title="Are you sure you want to delete this user?"
                onConfirm={() => showDeleteConfirm(record.userId)}
                okText="Yes"
                cancelText="No"
              >
                <Button icon={<Icon icon={deleteOutlined} />} danger />
              </Popconfirm> */}
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Input className='w-50'
            placeholder="Search by name, email, or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={() => push('/management/user/AddUser')}
            icon={<Icon icon={editOutlined} />}
          >
            Add User
          </Button>
        </Col>
      </Row>
      <Table
        dataSource={filteredUserList}
        columns={columns}
        rowKey="userId"
        style={{ marginTop: 16 }}
        bordered
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: handlePaginationChange, // Handle page change
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        onChange={handleChanges}
      />
      <Modal
        title="Delete User"
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        confirmLoading={deletingLoading} // Add loading state
      >
        <p>Are you sure you want to delete this user?</p>
      </Modal>
    </>
  );
};

export default GeneralTab;
