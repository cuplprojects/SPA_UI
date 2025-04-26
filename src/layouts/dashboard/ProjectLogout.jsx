import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useProjectActions, useProjectId } from '@/store/ProjectState';
import { PoweroffOutlined } from '@ant-design/icons'; // Import the icon

const ProjectLogout = () => {
  const projectId = useProjectId(); // Always call this hook
  const navigate = useNavigate(); // Always call this hook
  const { setProjectId } = useProjectActions(); // Always call this hook

  const onClickProjectLogout = () => {
    setProjectId(0); // Update the state
    navigate('/dashboard'); // Navigate to the new route
  };

  return (
    <div className="fixed-bottom m-3 mx-5">
      {projectId > 0 && (
        <Button
          onClick={onClickProjectLogout}
          type="primary"
          icon={<PoweroffOutlined />} // Add the icon here
        >
          Project Logout
        </Button>
      )}
    </div>
  );
};

export default ProjectLogout;
