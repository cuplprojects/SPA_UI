import { Button, Modal, Input, Form } from 'antd';
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API requests
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserInfo } from '@/store/UserDataStore';

const AllotFlag = ({fieldName, setFlagData}) => {
  const [showAllotmodal, setShowAllotmodal] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [form] = Form.useForm(); // Form instance for handling form inputs
  const projectId = useProjectId();
  const database = useDatabase();
  const { userId } = useUserInfo();

  const fetchFlags = async (values) => {
    try {
      const response = await axios.get(
        'https://localhost:7290/api/Correction/GetFlagsByCategoryChosingParameters',
        {
          params: {
            WhichDatabase: database,
            ProjectID: projectId,
            FieldName: values.FieldName,
            rangeStart: values.rangeStart,
            rangeEnd: values.rangeEnd,
            userId: userId,
          },
        },
      );
      // Adjust this according to your API response structure
      setFlagData(response.data)
      setRemaining(response.data.remainingFlags);
    } catch (error) {
      console.error('Error fetching flags:', error);
    }
  };

  const handleOpenModal = () => {
    setShowAllotmodal(true);
  };

  const handleCloseModal = () => {
    setShowAllotmodal(false);
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
        open={showAllotmodal}
        onCancel={handleCloseModal}
        footer={null} // Disable default footer buttons
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="FieldName"
            label="Field Name"
            rules={[{ required: true, message: 'Please enter Field Name' }]}
          >
            <Input />
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
         
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Fetch Flags
            </Button>
            <Button type="default" onClick={handleCloseModal} style={{ marginLeft: '8px' }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
        <p className="text-danger">
          Total Remaining flags: <span className="fw-bold">{remaining}</span>
        </p>
      </Modal>
    </div>
  );
};

export default AllotFlag;
