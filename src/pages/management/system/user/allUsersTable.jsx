import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Col, Input, Row, Select, notification, Modal, Popconfirm, Switch } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from '@/router/hooks';
import { Icon } from '@iconify/react';
import editOutlined from '@iconify/icons-ant-design/edit-outlined';
import deleteOutlined from '@iconify/icons-ant-design/delete-outlined';
import { handleEncrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';

const apiurl = import.meta.env.VITE_API_URL;

export default function GeneralTab() {
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
  const [roles, setRoles] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const database = useDatabase();

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get(`${apiurl}/Users?WhichDatabase=${database}`),
          axios.get(`${apiurl}/Roles?WhichDatabase=${database}`),
        ]);

        const roleMap = rolesRes.data.reduce((acc, role) => {
          acc[role.roleId] = role.roleName;
          return acc;
        }, {});

        const usersWithRoleNames = usersRes.data.map(user => ({
          ...user,
          roleName: roleMap[user.roleId],
          isActive: user.isActive,
        }));

        setUserList(usersWithRoleNames);
        setRoles(rolesRes.data);
      } catch (error) {
        console.error('Error fetching users and roles:', error.message);
      }
    };

    fetchUsersAndRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    const selectedRole = roles.find(role => role.roleId === value);
    setUserData((prev) => ({ ...prev, roleId: value, roleName: selectedRole?.roleName }));
  };

  const handleStatusChange = async (checked, userId) => {
    try {
      const user = userList.find(user => user.userId === userId);

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = { ...user, isActive: checked };

      const datatobesentencrypted = {
        cyphertextt: handleEncrypt(JSON.stringify(updatedUser))
      }

      await axios.put(`${apiurl}/Users/${userId}?WhichDatabase=${database}`, datatobesentencrypted);
      
      setUserList((prev) =>
        prev.map((user) => (user.userId === userId ? { ...user, isActive: checked } : user))
      );

      notification.success({
        message: 'User status updated successfully!',
        duration: 3,
      });
    } catch (error) {
      console.error('Error updating user status:', error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.userId);
    setUserData(user);
  };

  const handleSave = async (userId) => {
    try {
      const datatobesend = {
        cyphertextt: handleEncrypt(JSON.stringify(userData))
      }
      console.log(datatobesend)
      await axios.put(`${apiurl}/Users/${userId}?WhichDatabase=${database}`, datatobesend);
      setEditingUserId(null);
      setUserData({
        firstName: '',
        lastName: '',
        email: '',
        roleId: '',
        roleName: '',
        isActive: false,
      });
      notification.success({
        message: 'User updated successfully!',
        duration: 3,
      });
      const res = await axios.get(`${apiurl}/Users?WhichDatabase=${database}`);
      setUserList(res.data);
    } catch (error) {
      console.error('Error updating user:', error.message);
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

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiurl}/Users/${userIdToDelete}?WhichDatabase=${database}`);
      notification.success({
        message: 'User deleted successfully!',
        duration: 3,
      });
      const res = await axios.get(`${apiurl}/Users?WhichDatabase=${database}`);
      setUserList(res.data);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  return (
    <Row>
      <Col span={24}>
        <Col span={24} style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <Button type="primary" onClick={() => push('/management/user/AddUser')}>Add User</Button>
        </Col>
        <div className="card">
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">SN.</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, index) => (
                  <tr key={user.userId}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      {editingUserId === user.userId ? (
                        <Input name="firstName" value={userData.firstName} onChange={handleChange} />
                      ) : (
                        user.firstName
                      )}
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <Input name="lastName" value={userData.lastName} onChange={handleChange} />
                      ) : (
                        user.lastName
                      )}
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <Input name="email" value={userData.email} onChange={handleChange} />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <Select
                          value={userData.roleId}
                          onChange={handleRoleChange}
                          style={{ width: 120 }}
                        >
                          {roles.map((role) => (
                            <Select.Option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        user.roleName
                      )}
                    </td>
                    <td>
                      <Switch
                        checked={user.isActive}
                        onChange={(checked) => handleStatusChange(checked, user.userId)}
                      />
                    </td>
                    <td>
                      {editingUserId === user.userId ? (
                        <>
                          <Button type="primary" onClick={() => handleSave(user.userId)} style={{ marginRight: 8 }}>Save</Button>
                          <Button onClick={handleCancel}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button type="primary" icon={<Icon icon={editOutlined} />} onClick={() => handleEdit(user)} />
                          <Popconfirm
                            title="Are you sure you want to delete this user?"
                            onConfirm={() => showDeleteConfirm(user.userId)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button danger icon={<Icon icon={deleteOutlined} />} style={{ marginLeft: 8 }} />
                          </Popconfirm>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Col>
      <Modal
        title="Confirm Deletion"
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText="Yes, Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this user?</p>
      </Modal>
    </Row>
  );
}
