import React, { useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import './ProjectConfiguration.css'; // Ensure this file is created for custom styles
import FieldConfiguration from './FieldConfig/FieldConfiguration';
import ResponseConfiguration from './ResponseConfig/ResponseConfiguration';
import { useThemeToken } from '@/theme/hooks';
import AnnotationPage from '../functions/imageannotation/components/AnnotationPage';

const ProjectConfig = () => {
  const { colorPrimary } = useThemeToken();
  const [activeKey, setActiveKey] = useState('section1');

  return (
    <Container>
      <div className="tab" role="tabpanel">
        <Tabs
          defaultActiveKey="section1"
          id="uncontrolled-tab-example"
          className="mb-3"
          type="primary"
          activeKey={activeKey}
          onSelect={(k) => setActiveKey(k)}
        >
          <Tab eventKey="section1" title="Field Configuration">
            <div role="tabpanel" className={`tab-pane ${activeKey === 'section1' && 'show active'}`} id="Section1">
              <FieldConfiguration />
            </div>
          </Tab>
          <Tab eventKey="section2" title="Response Configuration">
            <div role="tabpanel" className={`tab-pane ${activeKey === 'section2' && 'show active'}`} id="Section2">
              <ResponseConfiguration/>
            </div>
          </Tab>
          <Tab eventKey="section3" title="Image Annotation">
            <AnnotationPage/>
          </Tab>
        </Tabs>
      </div>
      <style jsx>
        {`
          .tab .nav-tabs .nav-link.active {
            color: ${colorPrimary} !important;
          }
          .tab .nav-tabs .nav-link:hover,
          .tab .nav-tabs .nav-link.active {
            color: #222;
            background: #fff;
            border: none;
          }
          .tab .nav-tabs .nav-link::before,
          .tab .nav-tabs .nav-link::after {
            content: "";
            background-color: #d1d1d1;
            height: 7px;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;
            transition: all 0.5s ease 0s;
          }
          .tab .nav-tabs .nav-link::after {
            background-color: ${colorPrimary} !important;
            height: 100%;
            opacity: 0;
          }
        `}
      </style>
    </Container>
  );
};

export default ProjectConfig;
