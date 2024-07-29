// // RoleModal.jsx

// import React, { useState, useEffect } from 'react';
// import { Modal, Form, Input, Switch } from 'antd';

// const RoleModal = ({ visible, title, role, onOk, onCancel }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!visible) {
//       form.resetFields();
//     }
//   }, [visible, form]);

//   const handleOk = async () => {
//     try {
//       const values = await form.validateFields();
//       setLoading(true);
//       onOk({ ...role, ...values });
//     } catch (errorInfo) {
//       console.log('Validation failed:', errorInfo);
//     }
//   };

//   return (
//     <Modal
//       open={visible}
//       title={title}
//       okText="Save"
//       cancelText="Cancel"
//       onCancel={onCancel}
//       onOk={handleOk}
//       confirmLoading={loading}
//     >
//       <Form form={form} layout="vertical" initialValues={role}>
//         <Form.Item
//           name="roleName"
//           label="Name"
//           rules={[{ required: true, message: 'Please enter role name' }]}
//         >
//           <Input />
//         </Form.Item>
//         <Form.Item name="isActive" label="Status" valuePropName="checked">
//           <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// };

// export default RoleModal;
