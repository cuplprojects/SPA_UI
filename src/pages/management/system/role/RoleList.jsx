// import React, { useState, useEffect } from 'react';
// import { Button, Card, Table, Popconfirm, message, Switch, Modal, Form, Input } from 'antd';
// import axios from 'axios';
// import { Icon } from '@iconify/react';
// import editOutlined from '@iconify/icons-ant-design/edit-outlined';
// import deleteOutlined from '@iconify/icons-ant-design/delete-outlined';


// const apiurl = import.meta.env.VITE_API_URL;
// //const apiurl = import.meta.env.VITE_API_URL_PROD;

// const RoleList = () => {
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [roleModalVisible, setRoleModalVisible] = useState(false);
//   const [modalTitle, setModalTitle] = useState('New');
//   const [modalRole, setModalRole] = useState(null);

//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {

//         const response = await axios.get(`${apiurl}/Roles?WhichDatabase=Local`);

//         setRoles(response.data);
//       } catch (error) {
//         setError(error);
//         message.error('Failed to fetch roles');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRoles();
//   }, []);

//   const columns = [
//     {
//       title: 'Name',
//       dataIndex: 'roleName',
//       width: 300,
//     },
//     {
//       title: 'Status',
//       dataIndex: 'isActive',
//       align: 'center',
//       width: 120,
//       render: (isActive, record) => (
//         <Switch
//           checked={isActive}
//           onChange={(checked) => handleStatusChange(record.roleId, checked)}
//           checkedChildren="Enabled"
//           unCheckedChildren="Disabled"
//         />
//       ),
//     },
//     {
//       title: 'Actions',
//       key: 'operation',
//       align: 'center',
//       width: 100,
//       render: (_, record) => (
//         <div className="flex w-full justify-center text-gray">
//           <Button type="primary" onClick={() => onEdit(record)}>Edit</Button>
//           <Popconfirm
//             title="Delete the Role?"
//             onConfirm={() => onDelete(record.roleId)}
//             okText="Yes"
//             cancelText="No"
//             placement="left"
//           >
//             <Button danger icon={<Icon icon={deleteOutlined} />} style={{ marginLeft: 8 }} />
//           </Popconfirm>
//         </div>
//       ),
//     },
//   ];

//   const onCreate = () => {
//     setModalTitle('Create New');
//     setModalRole({
//       roleId: 0,
//       roleName: '',
//       isActive: true,
//     });
//     setRoleModalVisible(true);
//   };

//   const onEdit = (role) => {
//     setModalTitle('Edit');
//     setModalRole(role);
//     setRoleModalVisible(true);
//   };

//   const handleModalOk = async () => {
//     try {

//       if (modalRole.roleId !== 0) {
//         await axios.put(`${apiurl}/Roles/${roleModalProps.role.roleId}?WhichDatabase=Local`, modalRole, {

//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         setRoles((prevRoles) =>
//           prevRoles.map((role) => (role.roleId === modalRole.roleId ? modalRole : role))
//         );
//         message.success('Role updated successfully');
//       } else {

//         const response = await axios.post(`${apiurl}/Roles?WhichDatabase=Local`, modalRole, {

//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         setRoles((prevRoles) => [...prevRoles, response.data]);
//         message.success('Role created successfully');
//       }
//     } catch (error) {
//       console.error('Error saving role:', error.response?.data || error.message);
//       message.error('Failed to save role');
//     } finally {
//       setRoleModalVisible(false);
//     }
//   };

//   const handleModalCancel = () => {
//     setRoleModalVisible(false);
//   };

//   const onDelete = async (roleId) => {
//     try {

//       await axios.delete(`${apiurl}/${roleId}?WhichDatabase=Local`);

//       setRoles((prevRoles) => prevRoles.filter((role) => role.roleId !== roleId));
//       message.success('Role deleted successfully');
//     } catch (error) {
//       console.error('Error deleting role:', error.response?.data || error.message);
//       message.error('Failed to delete role');
//     }
//   };

//   const handleStatusChange = async (roleId, isActive) => {
//     try {
//       // Find the role to update
//       const roleToUpdate = roles.find((role) => role.roleId === roleId);
      
//       // Update the isActive status of the role
//       const updatedRole = { ...roleToUpdate, isActive };
      
//       // Send the updated role object to the API
//       await axios.put(`https://localhost:7290/api/Roles/${roleId}?WhichDatabase=Local`, updatedRole, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       // Update local state after successful update
//       setRoles((prevRoles) =>
//         prevRoles.map((role) => (role.roleId === roleId ? updatedRole : role))
//       );

//       message.success(`Role ${isActive ? 'enabled' : 'disabled'} successfully`);
//     } catch (error) {
//       if (error.response && error.response.status === 400) {
//         // Handle validation errors
//         console.error('Validation errors:', error.response.data.errors);
//         message.error('Validation errors occurred');
//       } else {
//         console.error('Error updating role status:', error.response?.data || error.message);
//         message.error('Failed to update role status');
//       }
//     }
//   };

//   return (
//     <Card
//       title="Role List"
//       extra={
//         <Button type="primary" onClick={onCreate}>
//           New
//         </Button>
//       }
//     >
//       <Table
//         rowKey="roleId"
//         size="small"
//         scroll={{ x: 'max-content' }}
//         pagination={false}
//         columns={columns}
//         dataSource={roles}
//       />
//       <Modal
//         title={modalTitle}
//         visible={roleModalVisible}
//         onOk={handleModalOk}
//         onCancel={handleModalCancel}
//         okText="Save"
//         cancelText="Cancel"
//       >
//         <Form layout="vertical">
//           <Form.Item label="Role Name">
//             <Input
//               value={modalRole?.roleName}
//               onChange={(e) => setModalRole({ ...modalRole, roleName: e.target.value })}
//             />
//           </Form.Item>
//           <Form.Item label="Status">
//             <Switch
//               checked={modalRole?.isActive}
//               onChange={(checked) => setModalRole({ ...modalRole, isActive: checked })}
//               checkedChildren="Enabled"
//               unCheckedChildren="Disabled"
//             />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </Card>
//   );
// };

// export default RoleList;
