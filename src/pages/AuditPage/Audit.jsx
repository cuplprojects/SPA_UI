import React, { useEffect, useState } from 'react';
import { Col, Row, Card, Table, Pagination } from 'react-bootstrap';
import { Button, notification } from 'antd';
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

const APIURL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    getFlags();
    if (totalCount > 0) {
      setWIP(((corrected / totalCount) * 100).toFixed(3));
    }
  }, [corrected, totalCount, ProjectId]);

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

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 mr-3 mt-3 gap-2">
        {/* <AllotFlag remaining={remaining}/> */}
        <div className="d-flex align-items-center justify-content-end mb-3 mr-3 mt-3 gap-2">
          <AuditMissingRollNo getFlags={getFlags} />
          <Button type="primary" onClick={handleClickAudit} disabled={isAuditing}>
            {isAuditing ? 'Auditing' : 'Run Audit'}
          </Button>
        </div>
      </div>
      <Card style={{ height: 'auto' }}>
        <Row>
          <Col>
            <Row>
              <Col>
                <Row>
                  <Card className="ml-3 mr-3 mt-3">
                    <div className="justify-content-center align-items-center">
                      <ChartComponent
                        chartId={`chart-global`}
                        series={WIP}
                        labels={['Average Results']}
                      />
                      <div>
                        <p className="fs-2 text-center">Completion Status</p>
                      </div>
                    </div>
                  </Card>
                </Row>
                <Row>
                  <Card className="ml-3 mr-3 mt-3">
                    <div>
                      <StackedHorizontalBarChart data={remarksCounts} />
                    </div>
                    {/* Bootstrap-styled table */}
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Remark</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEntries.map((remark, index) => (
                          <tr key={index}>
                            <td>{remark.remark}</td>
                            <td>{remark.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-center mt-3">
                      <Pagination>
                        <Pagination.Prev
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        {getPaginationItems()}
                        <Pagination.Next
                          onClick={() =>
                            currentPage < totalPages && handlePageChange(currentPage + 1)
                          }
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  </Card>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col>
            <Card
              className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3"
              style={{ height: '60px', backgroundColor: '#ffd1d1' }}
            >
              <div>
                <h2 className="text-center">Error Counts: {totalCount}</h2>
              </div>
            </Card>

            <Card
              className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3"
              style={{ height: '60px', backgroundColor: '#95f595' }}
            >
              <div>
                <h2 className="text-center">Corrected Counts: {corrected}</h2>
              </div>
            </Card>

            <Card
              className="d-flex align-items-center fs-3 justify-content-center mb-5 mr-3 mt-3"
              style={{ height: '60px', backgroundColor: '#b4b4ff' }}
            >
              <div>
                <h2 className="text-center">Remaining Counts: {remaining}</h2>
              </div>
            </Card>

            <h2
              className="fs-3 mb-3 text-center"
              style={{ color: 'grey', textShadow: '0px 2px 4px grey' }}
            >
              Error Reports
            </h2>
            <Card className="mb-3 mr-3">
              <Row className="ml-4 mr-4 mt-4">
                {flags.map((flag, index) => (
                  <Col md={4} key={index}>
                    <Card
                      className="mb-4 cursor-pointer rounded shadow-sm"
                      onClick={() => ClickedOnErrorName(flag.fieldName)}
                      style={{ transition: 'transform 0.3s' }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <Card.Body className="text-center">
                        <h5 className="card-title">{flag.fieldName}</h5>
                        <p className="card-text text-muted">({flag.count})</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AuditButton;
