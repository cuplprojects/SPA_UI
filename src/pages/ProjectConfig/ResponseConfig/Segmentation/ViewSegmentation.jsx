import React, { useEffect, useState } from 'react';
import { Table, notification, Button, Popconfirm } from 'antd';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import { useUserToken } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

const expandedRowRender = (record) => {
  const nestedColumns = [
    {
      title: 'Section Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Question',
      dataIndex: 'numQuestions',
      key: 'numQuestions',
    },
    {
      title: 'Marks Per Correct Question',
      dataIndex: 'marksCorrect',
      key: 'marksCorrect',
    },
    {
      title: 'Question From',
      dataIndex: 'startQuestion',
      key: 'startQuestion',
    },
    {
      title: 'Question To',
      dataIndex: 'endQuestion',
      key: 'endQuestion',
    },
    {
      title: 'Negative Marking',
      dataIndex: 'negativeMarking',
      key: 'negativeMarking',
    },
    {
      title: 'Marks for Wrong Answer',
      dataIndex: 'marksWrong',
      key: 'marksWrong',
    },
    {
      title: 'Total Marks',
      dataIndex: 'totalMarks',
      key: 'totalMarks',
    },
  ];

  const nestedData = record.sections.map((section) => ({
    key: section.name, // Ensure 'key' is unique within the section data
    name: section.name,
    numQuestions: section.numQuestions,
    marksCorrect: section.marksCorrect,
    startQuestion: section.startQuestion,
    endQuestion: section.endQuestion,
    negativeMarking: section.negativeMarking ? 'Yes' : 'No',
    marksWrong: section.marksWrong,
    totalMarks: section.totalMarks,
  }));

  return <Table columns={nestedColumns} dataSource={nestedData} pagination={false} bordered/>;
};

const ViewSegmentation = ({ courseName,data , fetchData, onCancel }) => {
  
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false); // Use boolean for toggle
  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();

  const columns = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    
    {
      title: 'Select',
      dataIndex: 'select',
      render: (_, record) => (
        showCheckboxes ? (
          <input
            type="checkbox"
            checked={selectedRowKeys.includes(record.key)}
            onChange={() => handleSelect(record.key)}
          />
        ) : null
      ),
    },
  ];

  const handleSelect = (key) => {
    setSelectedRowKeys((prevSelectedKeys) =>
      prevSelectedKeys.includes(key)
        ? prevSelectedKeys.filter((k) => k !== key)
        : [...prevSelectedKeys, key]
    );
  };

  const handleDeleteResponse = async () => {
    try {
      const deleteRequests = selectedRowKeys.map((key) => {
        return axios.delete(`${apiurl}/ResponseConfigs/${key}?WhichDatabase=${database}`,{
          headers:{
          Authorization : `Bearer ${token}`
        }});
      });

      await Promise.all(deleteRequests);
      setSelectedRowKeys([]);
      setShowCheckboxes(false); // Hide checkboxes after deletion
      fetchData();
      notification.success({
        message: 'Selected data deleted',
        duration: 3,
      });
      onCancel();
    } catch (error) {
      notification.error({
        message: 'Error deleting data',
        description: error.response ? error.response.data : error.message,
        duration: 3,
      })
      console.error('Error deleting response:', error.response ? error.response.data : error.message);
    }
  };

  const onExpand = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record.key] : []);
  };

  return (
    <>
      <div className='text-end mb-2'>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => setShowCheckboxes((prev) => !prev)}
        >
          {showCheckboxes ? 'Cancel' : 'Delete Section'}
        </Button>
        {showCheckboxes && (
          
            <Button
              danger
              icon={<DeleteOutlined />}
              style={{marginLeft: 3}}
              onClick={handleDeleteResponse}
            >
              Confirm Delete
            </Button>
       
        )}
      </div>
      <Table
        columns={columns}
        dataSource={data}
        onExpand={onExpand}
        expandedRowKeys={expandedRowKeys}
        expandable={{
          expandedRowRender,
        }}
        rowKey="key"
        bordered
      />
    </>
  );
};

export default ViewSegmentation;
