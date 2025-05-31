import React, { useState, useEffect } from 'react';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Upload, Button, Table, notification, Modal } from 'antd';
import { useProjectId } from '@/store/ProjectState';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ViewScore from './ViewScore';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';
import { useNavigate } from 'react-router-dom';
import { handleEncrypt } from '@/Security/Security';
import { e } from '@/Security/ParamSecurity';
import { useUserToken } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

const GenerateScore = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState({});
  const [courseNames, setCourseNames] = useState([]); // State to store all course names
  const [showScores, setShowScores] = useState(false);
  const [scores, setScores] = useState(null);
  const [courseCounts, setCourseCounts] = useState({}); // State to store course counts
  const ProjectId = useProjectId();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [fileInfo, setFileInfo] = useState({});
  const [keycount, setkeycount] = useState([]);
  const [updateLoading, setUpdateLoading] = useState({});
  const [updateFile, setUpdateFile] = useState(null);
  const database = useDatabase();
  const navigate = useNavigate(); // Initialize useNavigate
  const token = useUserToken();
  const [globalFile, setGlobalFile] = useState(null);
  const [sectionNames, setSectionNames] = useState([]);
  const [fieldnames, setFieldnames] = useState([]);

  useEffect(() => {
    getdata();
    fetchSections();
  }, [ProjectId]); // Run these effects whenever ProjectId changes

  const getdata = () => {
    fetchCourseNames();
    fetchCourseCounts();
    fetchKeyCounts();
  };
  const fetchCourseNames = async () => {
    try {
      const response = await fetch(
        `${apiurl}/ResponseConfigs/unique?whichDatabase=${database}&ProjectId=${ProjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch course names');
      }
      const result = await response.json();
      setCourseNames(result);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch course names!',
        duration: 3,
      });
    }
  };
  const fetchKeyCounts = async () => {
    try {
      const response = await fetch(
        `${apiurl}/Key/counts?WhichDatabase=${database}&projectId=${ProjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch key count');
      }
      const result = await response.json();
      const counts = {};
      result.forEach((item) => {
        counts[item.courseName] = item.count;
      });
      setkeycount(counts);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch course counts!',
        duration: 3,
      });
    }
  };

  // Function to fetch course counts
  const fetchCourseCounts = async () => {
    try {
      const response = await fetch(
        `${apiurl}/Score/count?WhichDatabase=${database}&projectId=${ProjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch course counts');
      }
      const result = await response.json();
      const counts = {};
      result.forEach((item) => {
        counts[item.courseName] = item.count;
      });
      setCourseCounts(counts);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch course counts!',
        duration: 3,
      });
    }
  };

  const handleApplyGlobalKey = async () => {
    if (!globalFile) {
      notification.error({
        message: 'Please select a file to apply for all courses!',
        duration: 3,
      });
      return;
    }
    const formData = new FormData();
    formData.append('file', globalFile.file);
    try {
      setLoading(true);
      const promises = courseNames.map((courseName) => {
        const data = new FormData();
        data.append('file', globalFile.file);
        return axios.post(
          `${apiurl}/Key/upload?WhichDatabase=${database}&ProjectId=${ProjectId}&courseName=${courseName}`,
          data,
          {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
          },
        );
      });

      await Promise.all(promises);
      fetchKeyCounts();
      notification.success({ message: 'File uploaded successfully for all courses!', duration: 3 });
      setGlobalFile(null);
    } catch (error) {
      notification.error({ message: 'Error applying key for all courses!', duration: 3 });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessScore = async (courseName) => {
    try {
      setProcessing((prev) => ({ ...prev, [courseName]: true }));
      const response = await fetch(
        `${apiurl}/Score/omrdata/${ProjectId}/details?courseName=${encodeURIComponent(
          courseName,
        )}&WhichDatabase=${database}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to process scores');
      }
      const result = await response.json();
      setScores(result);
      getdata();
      notification.success({
        message: 'Score has been processed!',
        duration: 3,
      });
      setProcessing((prev) => ({ ...prev, [courseName]: false }));
    } catch (error) {
      notification.error({
        message: 'Failed to process scores!',
        duration: 3,
      });
      setProcessing((prev) => ({ ...prev, [courseName]: false }));
    }
  };

  const handleFileChange = (file, courseName) => {
    if (file) {
      setFile({ file, courseName });
      setFileInfo((prev) => ({
        ...prev,
        [courseName]: { name: file.name }, // Store file info for the specific course
      }));
    }
  };

  const handleUpdateFileChange = (file, courseName) => {
    if (file) {
      setUpdateFile({ file, courseName });
      setFileInfo((prev) => ({
        ...prev,
        [courseName]: { name: file.name }, // Store file info for the specific course
      }));
    }
  };

  const fetchSections = async (courseName) => {
    try {
      const response = await fetch(
        `${apiurl}/ResponseConfigs/SectionName?projectId=${ProjectId}&courseName=${encodeURIComponent(courseName)}&WhichDatabase=${database}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setSectionNames(result.sectionNames);
      setFieldnames(result.fieldnames);
      return result.sectionNames;
    } catch (error) {
      notification.error({
        message: 'Failed to fetch data!',
        duration: 3,
      });
      return [];
    }
  };



  const downloadExcelTemplate = (sectionNames, fieldnames) => {
    if (!sectionNames.length || !fieldnames.length) return;

    const fieldValues = fieldnames; // ['A', 'B', 'C', 'D']
    console.log(fieldValues)
    // First row (merged section headers)
    const headerRow = [];
    sectionNames.forEach((section) => {
      for (let i = 0; i < fieldValues.length; i++) {
        headerRow.push(i === 0 ? section.name : null); // only put section name in first of 4 columns
      }
    });

    // Second row (field names)
    const secondRow = [];
    sectionNames.forEach(() => {
      secondRow.push(...fieldValues); // A, B, C, D
    });

    const data = [headerRow, secondRow];

    // Create worksheet and merges
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add merges for section headers
    const merges = [];
    let colIndex = 0;
    sectionNames.forEach(() => {
      merges.push({
        s: { r: 0, c: colIndex }, // start cell (row 0, col X)
        e: { r: 0, c: colIndex + fieldValues.length - 1 }, // end cell (row 0, col X+3)
      });
      colIndex += fieldValues.length;
    });
    ws['!merges'] = merges;

    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Key Template');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    saveAs(blob, 'keytemplate.xlsx');
  };



  const handleClick = (courseName) => {
    setSelectedCourse(courseName); // Set selected course for modal display
    navigate(`/default/ViewScore/${e(courseName)}`);
  };

  const handleUpdateClick = async (courseName) => {
    if (!updateFile || updateFile.courseName !== courseName) {
      notification.error({
        message: 'Please select a file for the correct course!',
        duration: 3,
      });
      return;
    }
    const sections = await fetchSections(courseName);
    const subjectRanges = buildSubjectRanges(sections);
    const formData = new FormData();
    formData.append('file', updateFile.file);
    formData.append('courseName', courseName);
   formData.append('subjectRanges', JSON.stringify(subjectRanges));
    // Show confirmation modal
    Modal.confirm({
      title: 'Update Key',
      content: 'Are you sure you want to update the key for ambiguity?',
      onOk: async () => {
        try {
          const response = await axios.post(
            `${apiurl}/Key/upload?courseName=${courseName}&ProjectId=${ProjectId}&WhichDatabase=${database}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.status === 200) {
            fetchKeyCounts();
            fetchCourseCounts();
            notification.success({
              message: `Key updated successfully for course ${courseName}!`,
              duration: 3,
            });
            setUpdateFile(null); // Reset file after successful update
            setFileInfo((prev) => ({
              ...prev,
              [courseName]: { name: '' }, // Reset file info after successful update
            }));
            navigate('/Ambiguity'); // Redirect to MarksAllotmentForm page
          } else {
            notification.error({
              message: `Error updating key for course ${courseName}!`,
              duration: 3,
            });
          }
        } catch (error) {
          notification.error({
            message: `Error updating key for course ${courseName}`,
            duration: 3,
          });
        } finally {
          setUpdateLoading((prev) => ({ ...prev, [courseName]: false }));
        }
      },
      onCancel: async () => {
       console.log('Update cancelled');
       setFile()
       setFileInfo({})
      },
    });
  };

  const buildSubjectRanges = (sections) => {
    const result = {};
    console.log(sections)
    sections.forEach(section => {
      result[section.name] = {
        start: section.startQuestion,
        end: section.endQuestion,
      };
    });
    return result;
  };


  const handleUpload = async (courseName) => {
    if (!file || file.courseName !== courseName) {
      notification.error({
        message: 'Please select a file for the correct course!',
        duration: 3,
      });
      return;
    }
    const sections = await fetchSections(courseName);
    const subjectRanges = buildSubjectRanges(sections);
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('courseName', courseName);
    formData.append('subjectRanges', JSON.stringify(subjectRanges));

    try {
      setLoading(true);
      const response = await fetch(
        `${apiurl}/Key/upload?WhichDatabase=${database}&ProjectId=${ProjectId}&courseName=${courseName}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (result.message) {
        fetchKeyCounts();
        notification.success({
          message: `File uploaded successfully for course ${courseName}!`,
          duration: 3,
        });
        setLoading(false);
        setFile(null); // Reset file after successful upload
        setFileInfo((prev) => ({
          ...prev,
          [courseName]: { name: '' }, // Reset file info after unsuccessful upload
        }));
      } else {
        notification.error({
          message: `Error uploading file for course ${courseName}!`,
          duration: 3,
        });
        setLoading(false);
        setFile(null); // Reset file after unsuccessful upload
        setFileInfo((prev) => ({
          ...prev,
          [courseName]: { name: '' }, // Reset file info after unsuccessful upload
        }));
      }
    } catch (error) {
      notification.error({
        message: `Error uploading file for course ${courseName}`,
        description: error.response ? error.response.data : error.message,
        duration: 3,
      });
      setLoading(false);
      setFile(null); // Reset file after unsuccessful upload
      setFileInfo((prev) => ({
        ...prev,
        [courseName]: { name: '' }, // Reset file info after unsuccessful upload
      }));
    }
  };

  const columns = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      width: '30%',
    },
    {
      title: 'Download Template',
      dataIndex: 'template',
      key: 'template',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={async () => {
            await fetchSections(record.courseName);
            downloadExcelTemplate(sectionNames, fieldnames);
          }}
          disabled={!record.courseName}
        >
          Download Key Template
        </Button>
      ),
      width: '30%',
    },
    {
      title: 'Upload Key',
      key: 'upload',
      render: (text, record) => (
        <div>
          {keycount[record.courseName] > 0 ? (
            <Button type="primary" disabled>
              Uploaded
            </Button>
          ) : (
            <>
              <Upload
                showUploadList={false}
                customRequest={({ file }) => handleFileChange(file, record.courseName)}
                accept=".xlsx"
              >
                <Button icon={<UploadOutlined />}>
                  {fileInfo[record.courseName]?.name || 'Click to Upload'}
                </Button>
              </Upload>
              <Button
                className="ms-2"
                type="primary"
                onClick={() => handleUpload(record.courseName)}
                disabled={loading || !file || (file && file.courseName !== record.courseName)}
              >
                {loading && file && file.courseName === record.courseName
                  ? 'Uploading...'
                  : 'Upload'}
              </Button>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Generate Score',
      key: 'generateScore',
      render: (text, record) => (
        <div>
          {(() => {
            const entryCount = courseCounts[record.courseName] || 0;
            const isProcessing = processing[record.courseName] || false;
            const isKeyUploaded = keycount[record.courseName] >= 0;

            if (isKeyUploaded) {
              if (entryCount > 0) {
                return (
                  <Button
                    type="primary"
                    style={{ marginTop: 10 }}
                    onClick={() => handleClick(record.courseName)}
                  >
                    View Score
                  </Button>
                );
              } else {
                return (
                  <Button
                    type="primary"
                    style={{ marginTop: 10 }}
                    onClick={() => handleProcessScore(record.courseName)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Generate Score'}
                  </Button>
                );
              }
            } else {
              return (
                <Button type="primary" style={{ marginTop: 10 }} disabled={true}>
                  Generate Score
                </Button>
              );
            }
          })()}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <div>
          {keycount[record.courseName] > 0 && (
            <>
              <Upload
                showUploadList={false}
                customRequest={({ file }) => handleUpdateFileChange(file, record.courseName)}
                accept=".xlsx"
              >
                <Button icon={<UploadOutlined />}>
                  {fileInfo[record.courseName]?.name || 'Click to Update'}
                </Button>
              </Upload>
              <Button
                className="ms-2"
                type="primary"
                onClick={() => handleUpdateClick(record.courseName)}
                disabled={updateLoading[record.courseName] || !fileInfo[record.courseName]?.name}
              >
                {updateLoading[record.courseName] ? 'Updating...' : 'Update Key'}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
  return (
    <div>
      <div>
        <div className="d-flex align-items-center justify-content-between mb-4">
          {courseNames.length > 1 && (
            <div>
              <Upload
                showUploadList={false}
                customRequest={({ file }) => setGlobalFile({ file })}
                accept=".xlsx"
              >
                <Button icon={<UploadOutlined />}>
                  {globalFile ? globalFile.file.name : 'Select Key for All'}
                </Button>
              </Upload>
              <Button
                className="ms-2"
                type="primary"
                onClick={handleApplyGlobalKey}
                disabled={loading || !globalFile}
              >
                {loading ? 'Uploading...' : 'Apply Key for All Courses'}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="gap-5">
        <Table
          columns={columns}
          dataSource={courseNames.map((courseName) => ({ courseName }))}
          rowKey="courseName"
          bordered
        />
      </div>
    </div>
  );
};

export default GenerateScore;
