import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Pagination,
  Button,
  notification,
  Dropdown,
  Menu,
  Spin,
  Typography,
  Space,
  Statistic
} from 'antd';
import {
  AuditOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import ChartComponent from './ChartComponent';
import { useProjectId } from '@/store/ProjectState';
import StackedHorizontalBarChart from './stackchart';
import useFlags from '@/CustomHooks/useFlag';
import AuditMissingRollNo from './AuditMissingRollNo';
import { useSelectedFieldActions } from '@/store/SelectedFiieldState';
import { useNavigate } from 'react-router-dom';
import AllotFlag from '../correction/AllotFlags';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import axios from 'axios';

const APIURL = import.meta.env.VITE_API_URL;
const baseUrl = `${APIURL}/Audit`;

const AuditButton = () => {
  const ProjectId = useProjectId();
  const { flags, remarksCounts, corrected, remaining, totalCount, getFlags } = useFlags(ProjectId);
  // const WIP = ((corrected / totalCount) * 100).toFixed(3);
  const [WIP, setWIP] = useState(0);
 const [isAuditing, setIsAuditing] = useState(false);
  const { setSelectedField } = useSelectedFieldActions();
  const navigate = useNavigate();
  const database = useDatabase();
  const token = useUserToken();
  const [selectedAudit, setSelectedAudit] = useState('');
  const [regData, setRegData] = useState(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getFlags();
    if (totalCount > 0) {
      setWIP(((corrected / totalCount) * 100).toFixed(3));
    }
    fetchRegData(ProjectId); // Fetch registration data
  }, [corrected, totalCount, ProjectId, database]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  const handleClickAudit = async () => {
    try {
      setIsAuditing(true);
      const response = await fetch(`${APIURL}/Audit/audit?WhichDatabase=${database}&ProjectID=${ProjectId}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }});

      setIsAuditing(false);
      notification.success({
        message: 'Audit Cycle Complete!',
        duration: 3,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      getFlags(); // Re-fetch flags after auditing
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while performing the audit.');
    }
  };

  const fetchRegData = async (ProjectId) => {
    try {
      const response = await axios.get(`${APIURL}/Projects/GetProjectCounts?ProjectId=${ProjectId}&CategoryName=Registration&WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRegData(response.data);
    } catch (error) {
      console.error('Error fetching registration data:', error);
    }
  };

  const ClickedOnErrorName = (fieldName) => {
    setSelectedField(fieldName);
    navigate('/correction');
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = remarksCounts.slice(indexOfFirstEntry, indexOfLastEntry);

  // Calculate total pages
  const totalPages = Math.ceil(remarksCounts.length / entriesPerPage);

  // Pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination display logic
  const getPaginationItems = () => {
    const items = [];
    const maxPageNumbersToShow = 5; // Number of page numbers to show
    const half = Math.floor(maxPageNumbersToShow / 2);

    // Ensure currentPage is within bounds
    const startPage = Math.max(
      1,
      Math.min(currentPage - half, totalPages - maxPageNumbersToShow + 1),
    );
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>,
      );
      if (startPage > 2) items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>,
      );
    }

    return items;
  };

  const handleSelect = async (eventKey) => {
    const apiEndpoints = {
      RangeAudit: 'RangeAudit',
      RegistrationAudit: 'RegistrationAudit',
      DuplicateRollNumberAudit: 'DuplicateRollNumberAudit',
      ContainsCharacterAudit: 'ContainsCharacterAudit',
      MissingRollNumbers: 'MissingRollNumbers'
    };

    const selectedApi = apiEndpoints[eventKey];
    if (selectedApi) {
      const url = `${baseUrl}/${selectedApi}?WhichDatabase=${database}&ProjectId=${ProjectId}`;
      setLoading(true);
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        getFlags(); // Call your function to handle the response data
        notification.success({
          message: 'Audit Data Fetched Successfully!',
          description: `The data for ${eventKey} has been fetched successfully.`,
          duration: 3,
        });
        console.log(response.data); // Handle the data from the API here
      } catch (error) {
        notification.error({
          message: 'Error Fetching Data',
          description: 'There was an error fetching the data. Please try again.',
          duration: 3,
        });
        console.error('Error fetching data:', error);
      }
      finally {
        // Stop loading after the API call completes
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Dropdown
          menu={{
            items: [
              { key: 'RangeAudit', label: 'Range Audit' },
              { key: 'ContainsCharacterAudit', label: 'Contains Character Audit' },
              { key: 'DuplicateRollNumberAudit', label: 'Duplicate Roll Number Audit' },
              { key: 'RegistrationAudit', label: 'Registration Audit', disabled: regData <= 1 },
              { key: 'MissingRollNumbers', label: 'Missing Roll Numbers', disabled: regData <= 1 }
            ],
            onClick: ({ key }) => handleSelect(key)
          }}
        >
          <Button type="primary" icon={<AuditOutlined />}>
            {loading ? <Spin indicator={<LoadingOutlined style={{ marginRight: 8 }} spin />} /> : null}
            Audit
          </Button>
        </Dropdown>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<Typography.Title level={4} style={{ margin: 0 }}>Completion Status</Typography.Title>}
            bordered={true}
            style={{
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
              height: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <ChartComponent
                chartId={`chart-global`}
                series={WIP}
                labels={['']}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card
              bordered={true}
              style={{
                borderRadius: '8px',
                border: '1px solid #ffccc7',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#fff1f0'
              }}
            >
              <Statistic
                title="Error Counts"
                value={totalCount}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>

            <Card
              bordered={true}
              style={{
                borderRadius: '8px',
                border: '1px solid #b7eb8f',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#f6ffed'
              }}
            >
              <Statistic
                title="Corrected Counts"
                value={corrected}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>

            <Card
              bordered={true}
              style={{
                borderRadius: '8px',
                border: '1px solid #91caff',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#f0f5ff'
              }}
            >
              <Statistic
                title="Remaining Counts"
                value={remaining}
                valueStyle={{ color: '#1890ff' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Space>
        </Col>
         <Col xs={24}>
          <Card
            title={
              <Typography.Title level={4} style={{ margin: 0 }}>
                Error Reports
              </Typography.Title>
            }
            bordered={true}
            style={{
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Row gutter={[16, 16]}>
              {flags.map((flag, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card
                    hoverable
                    onClick={() => ClickedOnErrorName(flag.fieldName)}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Typography.Title level={5}>{flag.fieldName}</Typography.Title>
                      <Typography.Text type="secondary">({flag.count})</Typography.Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title={<Typography.Title level={4} style={{ margin: 0 }}>Error Analysis</Typography.Title>}
            bordered={true}
            style={{
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <StackedHorizontalBarChart data={remarksCounts} />

            <Table
              dataSource={currentEntries}
              rowKey={(record) => record.remark}
              pagination={false}
              style={{ marginTop: '16px' }}
              bordered
              columns={[
                {
                  title: 'Remark',
                  dataIndex: 'remark',
                  key: 'remark',
                },
                {
                  title: 'Count',
                  dataIndex: 'count',
                  key: 'count',
                  width: '100px',
                  align: 'center'
                }
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <Pagination
                current={currentPage}
                total={remarksCounts.length}
                pageSize={entriesPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </Col>

       
      </Row>
    </div>
  );
};

export default AuditButton;
