import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  DatabaseOutlined,
  UploadOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Navbar = ({ role }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  const defaultMenus = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'management',
      icon: <SettingOutlined />,
      label: 'Management',
    },
  ];

  const projectMenus = [
    {
      key: 'masters',
      icon: <DatabaseOutlined />,
      label: 'Masters',
    },
    {
      key: 'projectConfig',
      icon: <SettingOutlined />,
      label: 'Project Config',
    },
    {
      key: 'allImports',
      icon: <UploadOutlined />,
      label: 'All Imports',
    },
    {
      key: 'generateScore',
      icon: <CheckSquareOutlined />,
      label: 'Generate Score',
    },
    {
      key: 'audit',
      icon: <AuditOutlined />,
      label: 'Audit',
    },
    {
      key: 'correctionWindow',
      icon: <FileTextOutlined />,
      label: 'Correction Window',
    },
  ];

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    role.permission = 'PROJECT_PERMISSION_LIST';
  };

  return (
    <Sider collapsible>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}>
        {defaultMenus.map((menu) => (
          <Menu.Item key={menu.key} icon={menu.icon}>
            {menu.label}
          </Menu.Item>
        ))}
        {selectedProject &&
          projectMenus.map((menu) => (
            <Menu.Item key={menu.key} icon={menu.icon}>
              {menu.label}
            </Menu.Item>
          ))}
      </Menu>
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <button onClick={() => handleProjectClick('Project Alpha')}>Project Alpha</button>
        <button onClick={() => handleProjectClick('Project Beta')}>Project Beta</button>
        <button onClick={() => handleProjectClick('Project Delta')}>Project Delta</button>
      </div>
    </Sider>
  );
};

export default Navbar;
