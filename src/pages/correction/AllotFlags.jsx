import { Button, Modal, Input, Form, Select } from 'antd';
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API requests
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserInfo, useUserToken } from '@/store/UserDataStore';
import { useFlagData, useFlagActions } from '@/store/useFlagStore'; // Import Zustand store for flags
const apiUrl = import.meta.env.VITE_API_URL;
const { Option } = Select;

const AllotFlag = ({ fieldNames }) => {
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [form] = Form.useForm(); // Form instance for handling form inputs
  const projectId = useProjectId();
  const database = useDatabase();
  const { userId } = useUserInfo();
  const flagData = useFlagData();
  const { setFlagData } = useFlagActions();
  const token = useUserToken();

  const fetchFlags = async (values) => {
    try {
      const response = await axios.get(`${apiUrl}/Correction/GetFlagsByCategoryChosingParameters`, {
        params: {
          WhichDatabase: database,
          ProjectID: projectId,
          FieldName: values.FieldName,
          rangeStart: values.rangeStart,
          rangeEnd: values.rangeEnd,
          userId: userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFlagData(response.data); // Assuming API returns { flags: [], remainingFlags: number }
      setShowAllotModal(false);
    } catch (error) {
      console.error('Error fetching flags:', error);
    }
  };

  const handleOpenModal = () => {
    setShowAllotModal(true);
  };

  const handleCloseModal = () => {
    setShowAllotModal(false);
  };

  const handleSubmit = (values) => {
    fetchFlags(values); // Fetch flags with user input
    handleCloseModal(); // Close the modal after submitting
  };

  return (
    <div>
      <Button type="primary" onClick={handleOpenModal}>
        Allot Flags
      </Button>
      <Modal
        title="Allot Modal"
        open={showAllotModal}
        onCancel={handleCloseModal}
        footer={null} // Disable default footer buttons
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="FieldName"
            label="Field Category"
            rules={[{ required: true, message: 'Please select a Field Name' }]}
          >
            <Select placeholder="Select Field Category">
              {fieldNames.map((field, index) => (
                <Option key={index} value={field.fieldName}>
                  {field.fieldName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="rangeStart"
            label="Range Start"
            rules={[{ required: true, message: 'Please enter Range Start' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="rangeEnd"
            label="Range End"
            rules={[{ required: true, message: 'Please enter Range End' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item className='text-end'>
            <Button type="default" onClick={handleCloseModal} style={{ marginRight: '8px' }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Fetch Flags
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllotFlag;
