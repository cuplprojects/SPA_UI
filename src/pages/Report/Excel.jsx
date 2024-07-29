import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from 'antd';

const ExcelExport = ({ data, selectedFields }) => {
  const handleExcelExport = () => {
    const worksheetData = data.map(item => {
      const rowData = { key: item.key };
      selectedFields.forEach(field => {
        rowData[field.label] = item[field.value];
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'report.xlsx');
  };

  return (
    <Button type="primary" onClick={handleExcelExport}>
      Download Excel
    </Button>
  );
};

export default ExcelExport;
