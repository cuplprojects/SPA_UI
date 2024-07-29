import React, { useState, useEffect } from 'react';
import { Table, Typography, Input, Modal, notification } from 'antd';
import './../Masters/Projects/Project.css';
import { useUserInfo } from '@/store/UserDataStore';
import { useDatabase } from '@/store/DatabaseStore';

const apiurl = import.meta.env.VITE_API_URL;

function Archive() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [projectToUnarchive, setProjectToUnarchive] = useState(null);
  const { userId } = useUserInfo();
  const database = useDatabase();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${apiurl}/Projects/ArchivedByUser?userId=${userId}&WhichDatabase=${database}`,
      );
      const data = await response.json();
      const processedData = data.map((item) => ({
        ...item,
        key: item.projectId.toString(),
      }));
      setData(processedData);
      setFilteredData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const showConfirmModal = (projectId) => {
    setProjectToUnarchive(projectId);
    setConfirmModalVisible(true);
  };

  const handleConfirmModalOk = async () => {
    if (projectToUnarchive) {
      try {
        const response = await fetch(
          `${apiurl}/Projects/${projectToUnarchive}/unarchive?userId=${userId}&WhichDatabase=${database}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          fetchData();
          notification.success({
            message: 'Success',
            description: 'Project unarchived successfully',
          });
          setData(data.filter((item) => item.projectId !== projectToUnarchive));
          setFilteredData(filteredData.filter((item) => item.projectId !== projectToUnarchive));
        } else {
          notification.error({
            message: 'Error',
            description: 'Failed to unarchive project',
          });
        }
      } catch (error) {
        console.error('Error unarchiving project:', error);
        notification.error({
          message: 'Error',
          description: 'Error unarchiving project',
        });
      } finally {
        setConfirmModalVisible(false);
      }
    }
  };

  const handleConfirmModalCancel = () => {
    setConfirmModalVisible(false);
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo({
      order: sorter.order,
      columnKey: sorter.field,
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filteredData = data.filter((item) =>
      item.projectName.toLowerCase().includes(e.target.value.toLowerCase()),
    );
    setFilteredData(filteredData);
  };

  const columns = [
    {
      title: 'Serial No',
      dataIndex: 'projectId',
      width: '10%',
      sorter: (a, b) => a.projectId - b.projectId,
      sortOrder: sortedInfo.columnKey === 'projectId' && sortedInfo.order,
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      width: '35%',
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      sortOrder: sortedInfo.columnKey === 'projectName' && sortedInfo.order,
    },
    {
      title: 'User Assigned',
      dataIndex: 'userAssigned',
      width: '35%',
      render: (_, record) => (
        <span>
          {Array.isArray(record.userAssigned)
            ? record.userAssigned.join(', ')
            : record.userAssigned}
        </span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (_, record) => (
        <Typography.Link onClick={() => showConfirmModal(record.projectId)}>Unarchive</Typography.Link>
      ),
    },
  ];

  return (
    <div className="mt-5">
      <div
        className="d-flex align-items-center justify-content-between w-100"
        style={{ marginBottom: 16 }}
      >
        <Input
          placeholder="Search Project"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 200, marginRight: 8 }}
        />
      </div>
      <Table
        bordered
        dataSource={filteredData}
        columns={columns}
        rowKey="key"
        onChange={handleChange}
      />
      <Modal
        title="Confirm Unarchive"
        open={confirmModalVisible}
        onOk={handleConfirmModalOk}
        onCancel={handleConfirmModalCancel}
      >
        <p>Are you sure you want to unarchive this project?</p>
      </Modal>
    </div>
  );
}

export default Archive;
