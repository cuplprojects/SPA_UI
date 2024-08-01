import React from 'react';
import { Tabs } from 'antd';
import ReportForm from './ReportForm';
import Flagreport from './flagreport';




const onChange = (key) => {
  console.log(key);
};
const Report = () => (
  <Tabs onChange={onChange} type="card">
    <Tabs.TabPane tab="General Report" key="1">
      <ReportForm />
    </Tabs.TabPane>
    <Tabs.TabPane tab="Flag Report" key="2">
      <Flagreport/>
    </Tabs.TabPane>
  </Tabs>
);
export default Report;