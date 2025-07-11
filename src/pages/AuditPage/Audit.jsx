import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Pagination, Button, notification, Spin, Typography, Space, Statistic } from 'antd';
import { Dropdown } from 'react-bootstrap';
import { AuditOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
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
import { CheckOutlined } from '@ant-design/icons';

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
  const [steps, setSteps] = useState('')
  const [regData, setRegData] = useState(0);
  const [extractedData, setExtractedData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ambiguous, setAmbiguous] = useState([]);

  const orderedAuditSteps = [
    "RangeAudit",
    "ContainsCharacterAudit",
    "DuplicateRollNumberAudit",
    "RegistrationAudit",
    "MissingRollNumbers",
    "MismatchedWithExtracted",
    "MultipleResponses",
  ];

  useEffect(() => {
    getFlags();
    fetchAmbiguous();
    fetchAudit(ProjectId);
    if (totalCount > 0) {
      setWIP(((corrected / totalCount) * 100).toFixed(3));
    }
    fetchRegData(ProjectId); // Fetch registration data
    fetchExtractedData(ProjectId)
  }, [corrected, totalCount, ProjectId, database]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  const handleClickAudit = async () => {
    try {
      setIsAuditing(true);
      const response = await fetch(`${APIURL}/Audit/audit?WhichDatabase=${database}&ProjectID=${ProjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

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

  const fetchExtractedData = async (ProjectId) => {
    try {
      const response = await axios.get(`${APIURL}/Projects/GetProjectCounts?ProjectId=${ProjectId}&CategoryName=ExtractedOMRData&WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setExtractedData(response.data);
    } catch (error) {
      console.error('Error fetching extracted data:', error);
    }
  };

  const fetchAmbiguous = async () => {
    try {
      const response = await axios.get(`${APIURL}/Ambiguity/ContainsMarkingRule/${ProjectId}`)
      setAmbiguous(response.data)
    }
    catch (err) {
      console.error("Failed to get Ambiguous question")
    }
  }

  const fetchAudit = async (ProjectId) => {
    try {
      const response = await axios.get(`${APIURL}/Audit?WhichDatabase=${database}&ProjectId=${ProjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(response.data)
      setSteps(response.data)
    }
    catch (err) {
      console.error("Failed to get Audit steps")
    }
  }
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
      MissingRollNumbers: 'MissingRollNumbers',
      MismatchedWithExtracted: 'MismatchedWithExtracted',
      MultipleResponses: 'MultipleResponses',
    };

    const selectedApi = apiEndpoints[eventKey];
    if (selectedApi) {
      const url = `${baseUrl}/${selectedApi}?WhichDatabase=${database}&ProjectId=${ProjectId}`
      setLoading(true);
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        getFlags(); // Call your function to handle the response data
        fetchAudit(ProjectId);
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

  const completedSteps = Array.isArray(steps)
    ? steps.map(s => s.split(' ')[0].trim()) // Extract step name from string
    : [];

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Dropdown onSelect={handleSelect}>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {loading ? (
              <Spinner animation="border" size="sm" /> // Spinner while loading
            ) : (
              'Audit'
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {orderedAuditSteps.map((step, index) => {
              const prevStepCompleted = index === 0 || completedSteps.includes(orderedAuditSteps[index - 1]);
              const isCompleted = completedSteps.includes(step);
              const isEnabled = prevStepCompleted && remaining === 0;

              // Conditional visibility rules
              if (step === "RegistrationAudit" && regData <= 1) return null;
              if (step === "MissingRollNumbers" && (regData <= 1 || remaining > 0)) return null;
              if (step === "MismatchedWithExtracted" && extractedData <= 1) return null;
              if (step === "MultipleResponses" && ambiguous <= 1) return null;

              return (
                <Dropdown.Item
                  key={step}
                  eventKey={step}
                  disabled={!isEnabled || loading}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{step.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {isCompleted && <CheckOutlined style={{ color: 'green' }} />}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>

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

//  <Card style={{ height: 'auto' }}>
//         <Row>
//           <Col>
//             <Row>
//               <Col>
//                 <Row>
//                   <Card className="ml-3 mr-3 mt-3">
//                     <div className="justify-content-center align-items-center">
//                       <ChartComponent
//                         chartId={`chart-global`}
//                         series={WIP}
//                         labels={['Average Results']}
//                       />
//                       <div>
//                         <p className="fs-2 text-center">Completion Status</p>
//                       </div>
//                     </div>
//                   </Card>
//                 </Row>
//                 <Row>
//                   <Card className="ml-3 mr-3 mt-3">
//                     <div>
//                       <StackedHorizontalBarChart data={remarksCounts} />
//                     </div>
//                     {/* Bootstrap-styled table */}
//                     <Table striped bordered hover responsive>
//                       <thead>
//                         <tr>
//                           <th>Remark</th>
//                           <th>Count</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {currentEntries.map((remark, index) => (
//                           <tr key={index}>
//                             <td>{remark.remark}</td>
//                             <td>{remark.count}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </Table>
//                     {/* Pagination Controls */}
//                     <div className="d-flex justify-content-center mt-3">
//                       <Pagination>
//                         <Pagination.Prev
//                           onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
//                           disabled={currentPage === 1}
//                         />
//                         {getPaginationItems()}
//                         <Pagination.Next
//                           onClick={() =>
//                             currentPage < totalPages && handlePageChange(currentPage + 1)
//                           }
//                           disabled={currentPage === totalPages}
//                         />
//                       </Pagination>
//                     </div>
//                   </Card>
//                 </Row>
//               </Col>
//             </Row>
//           </Col>
//           <Col>
//             <Card
//               className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3"
//               style={{ height: '60px', backgroundColor: '#ffd1d1' }}
//             >
//               <div>
//                 <h2 className="text-center">Error Counts: {totalCount}</h2>
//               </div>
//             </Card>

//             <Card
//               className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3"
//               style={{ height: '60px', backgroundColor: '#95f595' }}
//             >
//               <div>
//                 <h2 className="text-center">Corrected Counts: {corrected}</h2>
//               </div>
//             </Card>

//             <Card
//               className="d-flex align-items-center fs-3 justify-content-center mb-5 mr-3 mt-3"
//               style={{ height: '60px', backgroundColor: '#b4b4ff' }}
//             >
//               <div>
//                 <h2 className="text-center">Remaining Counts: {remaining}</h2>
//               </div>
//             </Card>

//             <h2
//               className="fs-3 mb-3 text-center"
//               style={{ color: 'grey', textShadow: '0px 2px 4px grey' }}
//             >
//               Error Reports
//             </h2>
//             <Card className="mb-3 mr-3">
//               <Row className="ml-4 mr-4 mt-4">
//                 {flags.map((flag, index) => (
//                   <Col md={4} key={index}>
//                     <Card
//                       className="mb-4 cursor-pointer rounded shadow-sm"
//                       onClick={() => ClickedOnErrorName(flag.fieldName)}
//                       style={{ transition: 'transform 0.3s' }}
//                       onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
//                       onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
//                     >
//                       <Card.Body className="text-center">
//                         <h5 className="card-title">{flag.fieldName}</h5>
//                         <p className="card-text text-muted">({flag.count})</p>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                 ))}
//               </Row>
//             </Card>
//           </Col>
//         </Row>
//       </Card>