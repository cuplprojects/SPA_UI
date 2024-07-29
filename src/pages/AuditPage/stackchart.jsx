import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
 Tooltip,
 
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const StackedHorizontalBarChart = ({ data }) => {
  let transformedData = {
    name: 'Total'  // Assuming 'name' is hardcoded as 'Total'
  };

  // Iterate over 'data' and add each item to 'transformedData'
  if (data) {
    data.forEach((item, index) => {
      transformedData[item.remark] = item.count;
    });
  }

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart
        layout="vertical"
        data={[transformedData]}  // Wrap transformedData in an array since BarChart expects an array of data objects
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
       < Tooltip/>
   
        {Object.keys(transformedData).map((key, index) => {
          if (key !== 'name') {
            return <Bar key={key} dataKey={key} stackId="a" fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />;
          }
          return null;
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StackedHorizontalBarChart;
