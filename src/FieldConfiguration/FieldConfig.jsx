import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TabComponent.css'; // Ensure this file is created for custom styles


const FieldConfig = () => {
  return (
    <Container>
    <div className="tab" role="tabpanel">
      <Tabs defaultActiveKey="section1" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="section1" title="Section 1">
          <div role="tabpanel" className="tab-pane fade show active" id="Section1">
            <h3>Section 1</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce semper, magna a ultricies volutpat, mi eros viverra massa, vitae consequat nisi justo in tortor. Proin accumsan felis ac felis dapibus, non iaculis mi varius.
            </p>
          </div>
        </Tab>
        <Tab eventKey="section2" title="Section 2">
          <div role="tabpanel" className="tab-pane fade" id="Section2">
            <h3>Section 2</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce semper, magna a ultricies volutpat, mi eros viverra massa, vitae consequat nisi justo in tortor. Proin accumsan felis ac felis dapibus, non iaculis mi varius.
            </p>
          </div>
        </Tab>
        <Tab eventKey="section3" title="Section 3">
          <div role="tabpanel" className="tab-pane fade" id="Section3">
            <h3>Section 3</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce semper, magna a ultricies volutpat, mi eros viverra massa, vitae consequat nisi justo in tortor. Proin accumsan felis ac felis dapibus, non iaculis mi varius.
            </p>
          </div>
        </Tab>
      </Tabs>
    </div>
  </Container>
  );
}

export default FieldConfig;
