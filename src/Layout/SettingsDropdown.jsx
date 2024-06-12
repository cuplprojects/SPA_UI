import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

const SettingsDropdown = ({ handleLinkClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle
        as="span"
        variant="success"
        id="dropdown-basic"
        onClick={toggleDropdown}
      >
        <i className="bx bx-cog" style={{ color: '#0065BD', cursor: 'pointer' }}></i>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleLinkClick('Settings')}>
          Settings
        </Dropdown.Item>
        {/* Add more Dropdown.Items as needed */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SettingsDropdown;
