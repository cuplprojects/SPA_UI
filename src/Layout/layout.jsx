import React, { useState } from 'react';
import './style.css';
import SettingsDropdown from './SettingsDropdown';

const Layout = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Dashboard');

  const handleToggleNavbar = () => {
    setNavbarOpen(!navbarOpen);
  };

  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
  };

  

  return (
    <div id="body-pd">
      <header className="header" id="header">
        <div className="header_toggle">
          <i
            style={{
              paddingLeft: navbarOpen ? "9rem" : "0px", transition: ".5s"
            }}
            className={`bx ${navbarOpen ? 'bx-x' : 'bx-menu'}`}
            id="header-toggle"
            onClick={handleToggleNavbar}
          />

        </div>
        <div className="display-flex align-items-center right-nav-comp ">
        <div>
            <SettingsDropdown handleLinkClick={handleLinkClick}/>
        </div>


        
          <div className="header_img">
            <img src="https://i.imgur.com/hczKIze.jpg" alt="" />
          </div>
        </div>
      </header>
      <div className={`l-navbar ${navbarOpen ? 'show' : ''}`} id="nav-bar">
        <nav className="nav">
          <div>
            <a href="#" className="nav_logo">
              <i className="bx bx-layer nav_logo-icon"></i>
              <span className="nav_logo-name">SPA</span>
            </a>
            <div className="nav_list">
              <a
                href="#"
                className={`nav_link ${activeLink === 'Dashboard' ? 'active' : ''}`}
                onClick={() => handleLinkClick('Dashboard')}
              >
                <i className="bx bx-grid-alt nav_icon"></i>
                <span className="nav_name">Dashboard</span>
              </a>
              <a
                href="#"
                className={`nav_link ${activeLink === 'Users' ? 'active' : ''}`}
                onClick={() => handleLinkClick('Users')}
              >
                <i className="bx bx-user nav_icon"></i>
                <span className="nav_name">Users</span>
              </a>
              <a
                href="#"
                className={`nav_link ${activeLink === 'Projects' ? 'active' : ''}`}
                onClick={() => handleLinkClick('Projects')}
              >
                <i className="bx bx-message-square-detail nav_icon"></i>
                <span className="nav_name">Projects</span>
              </a>
              <a
                href="#"
                className={`nav_link ${activeLink === 'Config' ? 'active' : ''}`}
                onClick={() => handleLinkClick('Config')}
              >
                <i className="bx bxs-category-alt nav_icon"></i>
                <span className="nav_name">Config</span>
              </a>
              <a
                href="#"
                className={`nav_link ${activeLink === 'Imports' ? 'active' : ''}`}
                onClick={() => handleLinkClick('Imports')}
              >
                <i className="bx bx-import nav_icon"></i>
                <span className="nav_name">Imports</span>
              </a>
              <a
                href="#"
                className={`nav_link ${activeLink === 'Files' ? 'active' : ''}`}
                onClick={() => handleLinkClick('Files')}
              >
                <i className="bx bx-folder nav_icon"></i>
                <span className="nav_name">Files</span>
              </a>
              <a
                href="#"
                className={`nav_link ${activeLink === 'Reports' ? 'active' : ''}`}
                onClick={() => handleLinkClick('Reports')}
              >
                <i className="bx bx-bar-chart-alt-2 nav_icon"></i>
                <span className="nav_name">Reports</span>
              </a>
              
            </div>
          </div>
          <a
            href="#"
            className={`nav_link ${activeLink === 'SignOut' ? 'active' : ''}`}
            onClick={() => handleLinkClick('SignOut')}
          >
            <i className="bx bx-log-out nav_icon"></i>
            <span className="nav_name">SignOut</span>
          </a>
        </nav>
      </div>
      <div className="height-100 bg-light">
        <h4>Main Components</h4>
      </div>
    </div>
  );
};

export default Layout;
