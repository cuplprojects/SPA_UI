import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Checkbox } from 'antd';
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
} from 'recharts';
import { CheckCircleOutlined } from '@ant-design/icons'; // Import Ant Design icon
import useFlags from '@/CustomHooks/useFlag';
import { handleDecrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import axios from 'axios';
import { useUserToken } from '@/store/UserDataStore';


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
    <div>
      <div className="d-flex align-items-center justify-content-between">
        <div className="fs-1 ml-3">
          <p>
            <strong>
              {projectId}. {projectName}
            </strong>
          </p>
        </div>
        {/* <div className="text-end">
          <Button
            onClick={onClickProjectLogout}
            style={{ backgroundColor: colorPrimary, color: 'white' }}
          >
            Project Logout
          </Button>
        </div> */}
      </div>

      <div className="mt-4">
        <div>
          <Row>
            <Col>
              <Row gutter={16}>
                <Col span={24}>
                  <Card>
                    <div className="fs-4 text-center">Import Status</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dataCounts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col>
              <Card>
                <p className="fs-3 text-center">Audit Report</p>
                <Card
                  className="d-flex align-items-center fs-4 justify-content-between mb-1 mr-3 mt-3 "
                  style={{ height: '60px', backgroundColor: '#F9D9D3' }}
                >
                  <div className="">
                    <h2 className="text-center">Error Counts: {totalCount}</h2>
                  </div>
                </Card>

                <Card
                  className="d-flex align-items-center fs-4 justify-content between mb-1 mr-3 mt-3"
                  style={{ height: '60px', backgroundColor: '#CCEAE0' }}
                >
                  <div className="">
                    <h2 className="text-center ">Corrected Counts: {corrected}</h2>
                  </div>
                </Card>

                <Card
                  className="d-flex align-items-center fs-4 justify-content between mb-1 mr-3 mt-3"
                  style={{ height: '60px', backgroundColor: '#CCEDF3' }}
                >
                  <div className="">
                    <h2 className="text-center ">Remaining Counts: {remaining}</h2>
                  </div>
                </Card>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <div className="mt-4">
        <Card>
          <div className="fs-4 text-center">Project Configuration Status</div>
          <Progress percent={progress} status={progress === 100 ? 'success' : 'normal'} />

          <div className="mt-2">
            <span className="mr-5">
              {fcName && (
                <span>
                  {fcName}
                  <Checkbox checked={true} style={{ marginRight: 5, marginLeft: 5 }} />
                </span>
              )}
            </span>
            <span className="mr-5">
              {recName && (
                <span>
                  {recName}
                  <Checkbox checked={true} style={{ marginRight: 5, marginLeft: 5 }} />
                </span>
              )}
            </span>
            <span>
              {imcName && (
                <span>
                  {imcName}
                  <Checkbox checked={true} style={{ marginRight: 5, marginLeft: 5 }} />
                </span>
              )}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;
