import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Card, Button, Row, Col, Table, Typography, Modal, Dropdown, Menu } from 'antd';
import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';

const { Title } = Typography;

const apiurl = 'https://localhost:7290/api'; // Adjust API URL as needed

const PDFReport = ({ project, selectedFields, data, workedBy }) => (
  <Document>
    <Page size="A3" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Report for {project}</Text>
        {workedBy && <Text style={styles.subtitle}>worked by: {workedBy.label}</Text>}
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>S.No.</Text>
          {selectedFields.map(field => (
            <Text key={field.value} style={styles.tableColHeader}>{field.label}</Text>
          ))}
        </View>
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCol}>{index + 1}</Text>
            {selectedFields.map(field => (
              <Text key={field.value} style={styles.tableCol}>{item[field.value] || ''}</Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Helvetica',
    color: '#555',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderColor: '#ddd',
    borderWidth: 1,
    borderCollapse: 'collapse',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    flex: 1,
  },
  tableCol: {
    borderStyle: 'solid',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    color: '#333',
    flex: 1,
  },
});

const ReportForm = () => {
  const [project, setProject] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [workedBy, setWorkedBy] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);
  const [fieldsOptions, setFieldsOptions] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [data, setData] = useState([]);
  const [previewPDF, setPreviewPDF] = useState(false);
  const [previewExcel, setPreviewExcel] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [users, setUsers] = useState([]);
  const [downloadExcel, setDownloadExcel] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchFields(selectedProjectId);
      fetchUsersByProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedFields.length > 0) {
      fetchFieldData();
    }
  }, [selectedFields]);

  const fetchProjects = () => {
    fetch(`${apiurl}/Projects?WhichDatabase=Local`)
      .then(response => response.json())
      .then(data => {
        const options = data.map(project => ({
          value: project.projectId,
          label: project.projectName || 'Unnamed Project'
        }));
        setProjectOptions(options);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  };

  const fetchFields = (projectId) => {
    fetch(`${apiurl}/FieldConfigurations?WhichDatabase=Local&projectId=${projectId}`)
      .then(response => response.json())
      .then(data => {
        const options = data.map(field => ({
          value: field.fieldConfigurationId ? field.fieldConfigurationId.toString() : '',
          label: field.fieldName || 'Unnamed Field'
        }));
        setFieldsOptions(options);
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });
  };

  const fetchUsersByProject = (projectId) => {
    fetch(`${apiurl}/Users?WhichDatabase=Local&projectId=${projectId}`)
      .then(response => response.json())
      .then(users => {
        const options = users.map(user => ({
          value: user.userId,
          label: user.fullName
        }));
        setUsers(options);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  };

  const fetchFieldData = () => {
    const fieldPromises = selectedFields.map(field =>
      fetch(`${apiurl}/Correction/GetCorrectedOmrData/${field.value}`)
        .then(response => response.json())
        .then(data => {
          // Parse the correctedOmrData field
          const correctedData = JSON.parse(data.correctedOmrData || '{}');
          return {
            fieldId: field.value,
            data: correctedData
          };
        })
        .catch(error => {
          console.error(`Error fetching data for field ${field.value}:`, error);
          return { fieldId: field.value, data: {} };
        })
    );

    Promise.all(fieldPromises).then(results => {
      // Extract values for selected fields
      const tableData = results.map(result => {
        const rowData = {};
        selectedFields.forEach(field => {
          rowData[field.value] = result.data[field.label] || '';
        });
        return rowData;
      });

      setData(tableData);
    });
  };

  const handleProjectChange = (selectedOption) => {
    setProject(selectedOption.label);
    setSelectedProjectId(selectedOption.value);
  };

  const handleFieldChange = (selectedOption) => {
    setSelectedFields(selectedOption);
  };

  const handleUserChange = (selectedOption) => {
    setWorkedBy(selectedOption);
  };

  const handleExcelAction = () => {
    const headers = ['S.No.', ...selectedFields.map(field => field.label)];
    const tableData = data.map((item, index) => {
      const rowData = {
        'S.No.': index + 1
      };
      selectedFields.forEach(field => {
        rowData[field.label] = item[field.value] || '';
      });
      return rowData;
    });

    if (downloadExcel) {
      // Download Excel file
      const worksheet = XLSX.utils.json_to_sheet(tableData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, 'report.xlsx');
      setDownloadExcel(false); // Reset after download
    } else {
      // Preview Excel data
      setExcelData(tableData);
      setPreviewExcel(true);
    }
  };

  const handleMenuClick = (e) => {
    if (e.key === 'pdf') {
      setPreviewPDF(true);
    } else if (e.key === 'excel') {
      handleExcelAction();
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="pdf">
        <Button type="primary">Download PDF</Button>
      </Menu.Item>
      <Menu.Item key="excel">
        <Button type="primary">Download Excel</Button>
      </Menu.Item>
    </Menu>
  );

  const PDFReportModal = () => (
    <Modal
      title="PDF Preview"
      visible={previewPDF}
      footer={null}
      onCancel={() => setPreviewPDF(false)}
      width="80%"
      style={{ top: 20 }}
    >
      <PDFViewer style={{ width: '100%', height: '80vh' }}>
        <PDFReport 
          project={project} 
          selectedFields={selectedFields} 
          data={data} 
          workedBy={workedBy} 
        />
      </PDFViewer>
    </Modal>
  );

  const ExcelPreviewModal = () => (
    <Modal
      title="Excel Preview"
      visible={previewExcel}
      footer={[
        <Button key="download" type="primary" onClick={() => {
          setDownloadExcel(true);
          handleExcelAction();
        }}>
          Download Excel
        </Button>,
        <Button key="cancel" onClick={() => setPreviewExcel(false)}>
          Close
        </Button>,
      ]}
      onCancel={() => setPreviewExcel(false)}
      width="80%"
      style={{ top: 20 }}
    >
      <Table
        columns={[
          { title: 'S.No.', dataIndex: 'S.No.', key: 'S.No.' },
          ...selectedFields.map(field => ({
            title: field.label,
            dataIndex: field.label,
            key: field.label,
            render: (text) => text || '-' // Render '-' for empty values
          })),
        ]}
        dataSource={excelData}
        pagination={false}
      />
    </Modal>
  );

  return (
    <div>
      <Card title="Report Generator" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="primary">Export</Button>
          </Dropdown>
        </div>
        <Row gutter={16}>
          <Col span={8}>
            <label>Select Project</label>
            <Select
              options={projectOptions}
              onChange={handleProjectChange}
              placeholder="Select a project"
            />
          </Col>
          <Col span={8}>
            <label>Select Fields</label>
            <Select
              isMulti
              options={fieldsOptions}
              onChange={handleFieldChange}
              placeholder="Select fields"
            />
          </Col>
          <Col span={8}>
            <label>Worked By</label>
            <Select
              value={workedBy}
              options={users}
              onChange={handleUserChange}
              placeholder="Select user"
            />
          </Col>
        </Row>
        {data.length > 0 && (
          <Card title="Preview Data" style={{ marginTop: 16 }}>
            <Table
              columns={[
                { title: 'S.No.', dataIndex: 'sno', key: 'sno' },
                ...selectedFields.map(field => ({
                  title: field.label,
                  dataIndex: field.value,
                  key: field.value,
                  render: (text) => text || '-' // Render '-' for empty values
                })),
              ]}
              dataSource={data.map((row, index) => ({
                key: index,
                sno: index+1,
                ...selectedFields.reduce((acc, field) => ({
                  ...acc,
                  [field.value]: row[field.value] || '' // Ensure empty string for undefined values
                }), {}),
              }))}
              pagination={false}
              size="large"
            />
          </Card>
        )}
        {previewPDF && <PDFReportModal />}
        {previewExcel && <ExcelPreviewModal />}
      </Card>
    </div>
  );
};

export default ReportForm;
