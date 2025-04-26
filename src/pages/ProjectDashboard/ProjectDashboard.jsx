import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Checkbox, Typography, Statistic, Space, Divider } from 'antd';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useProjectActions, useProjectId } from '@/store/ProjectState';
import { useThemeToken } from '@/theme/hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ProjectOutlined,
  ImportOutlined,
  AuditOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import useFlags from '@/CustomHooks/useFlag';
import { handleDecrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import axios from 'axios';
import { useUserToken } from '@/store/UserDataStore';
import Color from 'color';


const apiUrl = import.meta.env.VITE_API_URL;

const ProjectDashboard = () => {
  // State variables
  const [projectName, setProjectName] = useState('');
  const projectId = useProjectId();
  const { setProjectId } = useProjectActions();
  const navigate = useNavigate();
  const { colorPrimary } = useThemeToken();
  const { totalCount, corrected, remaining, getFlags } = useFlags(projectId);
  const [dataCounts, setDataCounts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [fcName, setFCName] = useState('');
  const [recName, setRECName] = useState('');
  const [imcName, setIMCName] = useState('');
  const database = useDatabase();
  const token = useUserToken();

  useEffect(() => {
    // Fetch project details if projectId exists
    if (projectId) {
      fetchProjectDetails(projectId);
      fetchCounts(projectId);
      checkApiCompletion(projectId);
    }
  }, [projectId]); // Empty dependency array to run only once on component mount

  // const onClickProjectLogout = () => {
  //   setProjectId(0);
  //   navigate('/dashboard/workbench');
  // };

  useEffect(() => {
    getFlags();
  }, [projectId]);

  // Function to fetch project details from an API
  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await fetch(`${apiUrl}/Projects/${projectId}?WhichDatabase=${database}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }});
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProjectName(data.projectName);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  // Function to fetch counts
  const fetchCounts = async (projectId) => {
    try {
      const AllCount = await axios.get(`${apiUrl}/Projects/AllCounts?projectId=${projectId}&whichDatabase=${database}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }});

      setDataCounts([
        { name: 'OMR Images', count: AllCount?.data?.omrImages},
        { name: 'Scanned Data', count: AllCount.data?.scannedData },
        { name: 'Absentees Upload', count: AllCount.data?.absenteesUpload },
        { name: 'Keys Upload', count: AllCount.data?.keys },
        { name: 'Registration ', count: AllCount.data?.registration}
      ]);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // Helper function to fetch count from an API endpoint
  const fetchCount = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching count:', error);
      return 0;
    }
  };

  const checkApiCompletion = async (projectId) => {
    try {
      // Fetch data from all three APIs concurrently
      const fieldConfigcount = (await axios.get(`${apiUrl}/Projects/GetProjectCounts?ProjectId=${projectId}&CategoryName=FieldConfig&WhichDatabase=${database}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }})).data;
      const responseConfigcount = (await axios.get(`${apiUrl}/Projects/GetProjectCounts?ProjectId=${projectId}&CategoryName=ResponseConfig&WhichDatabase=${database}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }})).data;
      const imageConfigcount = (await axios.get(`${apiUrl}/Projects/GetProjectCounts?ProjectId=${projectId}&CategoryName=ImageConfig&WhichDatabase=${database}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }})).data;
      const completedStep1 =  fieldConfigcount> 0 ? 100 / 3 : 0;
      const completedStep2 = responseConfigcount > 0 ? 100 / 3 : 0;
      const completedStep3 = imageConfigcount > 0 ? 100 / 3 : 0;
      setFCName(fieldConfigcount > 0 ? 'Field Configurations' : '');
      setRECName(responseConfigcount > 0 ? 'Response Configurations' : '');
      setIMCName(imageConfigcount > 0 ? 'Image Configurations' : '');

      // Calculate progress based on completed steps
      const progressPercentage = completedStep1 + completedStep2 + completedStep3;
      setProgress(progressPercentage.toFixed(2));
    } catch (error) {
      console.error('Error checking API completion:', error);
    }
  };

  return (
    <div style={{ padding: '16px', height: '100%' }}>
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          border: '1px solid #d9d9d9',
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <Space align="center">
            <ProjectOutlined style={{ fontSize: '28px', color: colorPrimary }} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              {projectId}. {projectName}
            </Typography.Title>
          </Space>
          {/* <div className="text-end">
            <Button
              onClick={onClickProjectLogout}
              type="primary"
              icon={<LogoutOutlined />}
            >
              Project Logout
            </Button>
          </div> */}
        </div>
        <div className="mt-0">
        <Card
          title={
            <Space>
              <SettingOutlined style={{ color: colorPrimary }} />
              <Typography.Title level={4} style={{ margin: 0 }}>Project Configuration Status</Typography.Title>
            </Space>
          }
          style={{
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            border: '1px solid #d9d9d9',
          }}
        >
          <Progress
            percent={progress}
            status={progress === 100 ? 'success' : 'active'}
            strokeColor={colorPrimary}
            strokeWidth={12}
            style={{ marginBottom: '20px' }}
          />

          <Divider style={{ margin: '16px 0' }} />

          <div className="d-flex flex-wrap justify-content-around align-items-center">
            {fcName && (
              <Card
                style={{
                  margin: '8px',
                  borderRadius: '8px',
                  border: `2px solid ${colorPrimary}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px'
                }}
              >
                <Space>
                  <FileTextOutlined style={{ color: colorPrimary, fontSize: '18px' }} />
                  <span style={{ fontWeight: 500 }}>{fcName}</span>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                </Space>
              </Card>
            )}

            {recName && (
              <Card
                style={{
                  margin: '8px',
                  borderRadius: '8px',
                  border: `2px solid ${colorPrimary}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px'
                }}
              >
                <Space>
                  <FileTextOutlined style={{ color: colorPrimary, fontSize: '18px' }} />
                  <span style={{ fontWeight: 500 }}>{recName}</span>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                </Space>
              </Card>
            )}

            {imcName && (
              <Card
                style={{
                  margin: '8px',
                  borderRadius: '8px',
                  border: `2px solid ${colorPrimary}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px'
                }}
              >
                <Space>
                  <FileTextOutlined style={{ color: colorPrimary, fontSize: '18px' }} />
                  <span style={{ fontWeight: 500 }}>{imcName}</span>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                </Space>
              </Card>
            )}
          </div>
        </Card>
      </div>
      </Card>
      

      <Row>
        <Col md={7} className="pe-md-3">
          <Card
            title={
              <Space>
                <AuditOutlined style={{ color: colorPrimary }} />
                <Typography.Title level={4} style={{ margin: 0 }}>Audit Report</Typography.Title>
              </Space>
            }
            style={{
              height: '100%',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              border: '2px solid #d9d9d9',
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card
                bordered={true}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #ff4d4f',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#fff1f0'
                }}
              >
                <Statistic
                  title="Error Counts"
                  value={totalCount}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ExclamationCircleOutlined />}
                  suffix={<span style={{ fontSize: '14px', color: '#666' }}>issues</span>}
                />
              </Card>

              <Card
                bordered={true}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #52c41a',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#f6ffed'
                }}
              >
                <Statistic
                  title="Corrected Counts"
                  value={corrected}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                  suffix={<span style={{ fontSize: '14px', color: '#666' }}>fixed</span>}
                />
              </Card>

              <Card
                bordered={true}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #1677ff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#e6f4ff'
                }}
              >
                <Statistic
                  title="Remaining Counts"
                  value={remaining}
                  valueStyle={{ color: '#1677ff' }}
                  prefix={<WarningOutlined />}
                  suffix={<span style={{ fontSize: '14px', color: '#666' }}>pending</span>}
                />
              </Card>
            </Space>
          </Card>
        </Col>

        <Col md={5} className="mt-2 mt-md-0 pe-md-3">
          <Card
            title={
              <Space>
                <ImportOutlined style={{ color: colorPrimary }} />
                <Typography.Title level={4} style={{ margin: 0 }}>Import Status</Typography.Title>
              </Space>
            }
            style={{
              height: '100%',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              border: '1px solid #d9d9d9',
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataCounts} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value) => [`${value} items`, 'Count']}
                  contentStyle={{
                    borderRadius: '4px',
                    border: `2px solid ${colorPrimary}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                />
                <Bar
                  dataKey="count"
                  barSize={20}
                  radius={[0, 4, 4, 0]}
                >
                  {dataCounts.map((entry, index) => {
                    // Array of vibrant colors
                    const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      
    </div>
  );
};

export default ProjectDashboard;
