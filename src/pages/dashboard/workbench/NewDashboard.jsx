import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProjectActions } from '@/store/ProjectState';
import { useThemeToken } from '@/theme/hooks';
import Color from 'color';
import ProjectCard from './ProjectCard'; // Adjust the import path as needed
import { useUserInfo, useUserToken } from '@/store/UserDataStore';
import { useDatabase } from '@/store/DatabaseStore';

const apiurl = import.meta.env.VITE_API_URL;

const NewDashboard = () => {
  const themeToken = useThemeToken();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]); // State to store fetched projects
  const [loading, setLoading] = useState(true); // State to manage loading
  const { setProjectId } = useProjectActions();
  const { userId } = useUserInfo();
  const database = useDatabase();
  const token = useUserToken();

  // Define background gradient using the theme tokens
  const bg = `linear-gradient(135deg, ${Color(themeToken.colorPrimaryHover).alpha(0.2)}, ${Color(
    themeToken.colorPrimary,
  ).alpha(0.2)})`;

  useEffect(() => {
    if (token) {
      fetchProjects(); // Fetch projects when component mounts
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      // Fetch projects from API
      const response = await axios.get(
        `${apiurl}/Projects/ByUser/${userId}?WhichDatabase=${database}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setProjects(response.data); // Update projects state with fetched data
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };

  const onClickProjectId = (projectId) => {
    // Set projectId in localStorage
    setProjectId(projectId);

    // Navigate to ProjectDashboard after setting localStorage
    setTimeout(() => {
      navigate('/ProjectDashboard');
    }, 500); // 500 milliseconds (0.5 seconds)
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <Card className="shadow-sm" style={{ background: bg }}>
            <Card.Body>
              <Card.Title
                className="mb-4 text-center"
                style={{ color: themeToken.colorPrimaryActive }}
              >
                Recent Projects
              </Card.Title>
              <Row>
                {loading
                  ? // Render skeletons while loading
                    Array.from({ length: 4 }).map((_, index) => (
                      <ProjectCard key={index} loading={true} />
                    ))
                  : // Render project cards when data is loaded
                    projects.map((project) => (
                      <ProjectCard
                        key={project.projectId}
                        project={project}
                        onClickProjectId={onClickProjectId}
                        loading={false}
                      />
                    ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewDashboard;
