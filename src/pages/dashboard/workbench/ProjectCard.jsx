// src/components/ProjectCard.jsx
import useFlags from '@/CustomHooks/useFlag';
import { useThemeToken } from '@/theme/hooks';
import Color from 'color';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { FaCheckCircle, FaExclamation, FaExclamationCircle, FaExclamationTriangle, FaFlag } from 'react-icons/fa'; // Icons for visual appeal

const ProjectCard = ({ project, onClickProjectId }) => {
  const themeToken = useThemeToken();
  const { totalCount, corrected, remaining } = useFlags(project.projectId);

  // Total flags are simply the length of the flags array

  return (
    <Col md={6} lg={3} className="mb-4 col-12">
      <Card
        className="h-100 text-center border-light shadow-lg"
        onClick={() => onClickProjectId(project.projectId)}
        style={{
          cursor: 'pointer',
          borderRadius: '12px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.9)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
        }}
      >
        <Card.Body>
          <Card.Title className="fs-5 fw-bold text-capitalize mb-4"  style={{ color: themeToken.colorPrimaryActive }}>
            {project.projectName}
          </Card.Title>
          <div className="text-start">
            <Row>
              <Col xs={12} className="mb-3">
                <p className="d-flex align-items-center mb-0 text-danger gap-2">
                  <FaExclamationCircle className="me-2 " /> 
                  <strong>Total Flags: </strong> {totalCount}
                </p>
              </Col>
              <Col xs={12} className="mb-3">
                <p className="d-flex align-items-center mb-0 text-success gap-2">
                  <FaCheckCircle className="me-2" />
                  <strong>Corrected Flags: </strong> {corrected}
                </p>
              </Col>
              <Col xs={12} className="mb-3">
                <p className="d-flex align-items-center mb-0 text-warning gap-2">
                  <FaExclamationTriangle className="me-2" />
                  <strong>Remaining Flags: </strong> {remaining}
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
