import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Predefined color palette for consistency
const colorPalette = [
  '#1890ff', // Ant Design primary blue
  '#52c41a', // Ant Design success green
  '#faad14', // Ant Design warning yellow
  '#f5222d', // Ant Design error red
  '#722ed1', // Ant Design purple
  '#13c2c2', // Ant Design cyan
  '#eb2f96', // Ant Design pink
  '#fa8c16', // Ant Design orange
  '#a0d911', // Ant Design lime
  '#2f54eb'  // Ant Design geekblue
];

const StackedHorizontalBarChart = ({ data }) => {
  let transformedData = {
    name: 'Error Distribution'  // More descriptive name
  };

  // Iterate over 'data' and add each item to 'transformedData'
  if (data) {
    data.forEach((item, index) => {
      transformedData[item.remark] = item.count;
    });
  }

  return (
    <div className="chart-container">
      <h4 style={{ textAlign: 'center', marginBottom: '16px', color: '#595959' }}>Error Type Distribution</h4>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          layout="vertical"
          data={[transformedData]}
          margin={{ top: 10, right: 30, bottom: 20, left: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tickLine={false} axisLine={{ stroke: '#d9d9d9' }} />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={{ stroke: '#d9d9d9' }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '10px' }}
          />
          {Object.keys(transformedData).map((key, index) => {
            if (key !== 'name') {
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={colorPalette[index % colorPalette.length]}
                  name={key}
                  radius={[0, 4, 4, 0]} // Rounded corners on right side
                />
              );
            }
            return null;
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StackedHorizontalBarChart;
