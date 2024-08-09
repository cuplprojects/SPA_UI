import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa'; // Icons for visual appeal
import { useThemeToken } from '@/theme/hooks';
import useFlags from '@/CustomHooks/useFlag';

const ProjectCard = ({ project, onClickProjectId, loading }) => {
  const themeToken = useThemeToken();
  const { totalCount, corrected, remaining } = useFlags(project?.projectId);

  return (
    <Col md={6} lg={3} className="mb-4 col-12">
      <Card
        className="h-100 text-center border-light shadow-lg"
        onClick={!loading ? () => onClickProjectId(project.projectId) : null}
        style={{
          cursor: loading ? 'default' : 'pointer',
          borderRadius: '12px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
        }}
        onMouseOver={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.9)';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
        }}
      >
        <Card.Body>
          <Card.Title className="fs-5 fw-bold text-capitalize mb-4" style={{ color: themeToken.colorPrimaryActive }}>
            {loading ? <Skeleton width={100} /> : project.projectName}
          </Card.Title>
          <div className="text-start">
            <Row>
              <Col xs={12} className="mb-3">
                <p className="d-flex align-items-center mb-0 text-danger gap-2">
                  <FaExclamationCircle className="me-2" />
                  <strong>Total Flags: </strong> {loading ? <Skeleton width={30} /> : totalCount}
                </p>
              </Col>
              <Col xs={12} className="mb-3">
                <p className="d-flex align-items-center mb-0 text-success gap-2">
                  <FaCheckCircle className="me-2" />
                  <strong>Corrected Flags: </strong> {loading ? <Skeleton width={30} /> : corrected}
                </p>
              </Col>
              <Col xs={12} className="mb-3">
                <p className="d-flex align-items-center mb-0 text-warning gap-2">
                  <FaExclamationTriangle className="me-2" />
                  <strong>Remaining Flags: </strong> {loading ? <Skeleton width={30} /> : remaining}
                </p>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProjectCard;
