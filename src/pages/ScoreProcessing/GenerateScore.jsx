import React, { useState, useEffect } from 'react';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Upload, Button, Table, notification, Modal } from 'antd';
import { useProjectId } from '@/store/ProjectState';

import ViewScore from './ViewScore';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [fileInfo, setFileInfo] = useState({});
  const [keycount, setkeycount] = useState([])
  const [updateLoading, setUpdateLoading] = useState({});
  const [updateFile, setUpdateFile] = useState(null); 
  const database = useDatabase();


  useEffect(() => {
    getdata()
  }, [ProjectId]); // Run these effects whenever ProjectId changes

  const getdata = () => {
    fetchCourseNames();
    fetchCourseCounts();
    fetchKeyCounts()
  }
  const fetchCourseNames = async () => {
    try {
      const response = await fetch(`${apiurl}/Registration/GetUniqueValues?whichDatabase=${database}&key=Course%20Name&ProjectId=${ProjectId}`);
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
      const response = await fetch(`${apiurl}/Key/counts?WhichDatabase=${database}&projectId=${ProjectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch key count');
      }
      const result = await response.json();
      const counts = {};
      result.forEach(item => {
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
      const response = await fetch(`${apiurl}/Score/count?WhichDatabase=${database}&projectId=${ProjectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course counts');
      }
      const result = await response.json();
      const counts = {};
      result.forEach(item => {
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


  const handleProcessScore = async (courseName) => {
    try {
      setProcessing((prev) => ({ ...prev, [courseName]: true }));
      const response = await fetch(`${apiurl}/Score/omrdata/${ProjectId}/details?courseName=${encodeURIComponent(courseName)}&WhichDatabase=${database}`);
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
    if ((file)) {
      setFile({ file, courseName });
      setFileInfo(prev => ({
        ...prev,
        [courseName]: { name: file.name } // Store file info for the specific course
      }));
    }
  };

  const handleUpdateFileChange = (file, courseName) => {
    if ((file)) {
      setUpdateFile({ file, courseName });
      setFileInfo(prev => ({
        ...prev,
        [courseName]: { name: file.name } // Store file info for the specific course
      }));
    }
  };

  const handleClick = (courseName) => {
    setSelectedCourse(courseName); // Set selected course for modal display
    setModalVisible(true); // Show the modal
  };

  const handleModalClose = () => {
    setModalVisible(false); // Close the modal
    setSelectedCourse(''); // Clear selected course
  };


  const handleUpdateClick = async (courseName) => {
   
    if (!updateFile || updateFile.courseName !== courseName) {
      notification.error({
        message: 'Please select a file for the correct course!',
        duration: 3,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', updateFile.file);
    formData.append('courseName', courseName);

    try {
      
      const response = await axios.put(`${apiurl}/Key/updatekey?courseName=${courseName}&ProjectId=${ProjectId}&WhichDatabase=${database}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        fetchKeyCounts();
        notification.success({
          message: `Key updated successfully for course ${courseName}!`,
          duration: 3,
        });
        setUpdateFile(null); // Reset file after successful update
        setFileInfo(prev => ({
          ...prev,
          [courseName]: { name: '' } // Reset file info after successful update
        }));
      } else {
        notification.error({
          message: `Error updating key for course ${courseName}!`,
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: `Error updating key for coursew ${courseName}`,
        duration: 3,
      });
    } finally {
      setUpdateLoading((prev) => ({ ...prev, [courseName]: false }));
    }
  };


  const handleUpload = async (courseName) => {
    if (!file || file.courseName !== courseName) {
      notification.error({
        message: 'Please select a file for the correct course!',
        duration: 3,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('courseName', courseName);

    try {
      setLoading(true);
      const response = await fetch(`${apiurl}/Key/upload?WhichDatabase=${database}&ProjectId=${ProjectId}&courseName=${courseName}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.message) {
        fetchKeyCounts()
        notification.success({
          message: `File uploaded successfully for course ${courseName}!`,
          duration: 3,
        });
        setLoading(false);
        setFile(null); // Reset file after successful upload
        setFileInfo(prev => ({
          ...prev,
          [courseName]: { name: '' } // Reset file info after unsuccessful upload
        }));
      } else {
        notification.error({
          message: `Error uploading file for course ${courseName}!`,
          duration: 3,
        });
        setLoading(false);
        setFile(null); // Reset file after unsuccessful upload
        setFileInfo(prev => ({
          ...prev,
          [courseName]: { name: '' } // Reset file info after unsuccessful upload
        }));
      }
    } catch (error) {
      notification.error({
        message: `Error uploading file for course ${courseName}`,
        duration: 3,
      });
      setLoading(false);
      setFile(null); // Reset file after unsuccessful upload
      setFileInfo(prev => ({
        ...prev,
        [courseName]: { name: '' } // Reset file info after unsuccessful upload
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
      title: 'Upload Key',
      key: 'upload',
      render: (text, record) => (
        <div>
          {keycount[record.courseName] > 0 ? (
            <Button type="primary" disabled
            >
              Uploaded
            </Button>
          ) : (
            <>
              <Upload
                showUploadList={false}
               
                customRequest={({ file }) => handleFileChange(file, record.courseName)}
                accept='.xlsx'
              >
                <Button icon={<UploadOutlined />}>
                  {fileInfo[record.courseName]?.name || 'Click to Upload'}
                </Button>
              </Upload>
              <Button
                className='ms-2'
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
          {
            (() => {
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
                  <Button
                    type="primary"
                    style={{ marginTop: 10 }}
                    disabled={true}
                  >
                    Generate Score
                  </Button>
                );
              }
            })()
          }
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
                accept='.xlsx'
              >
                <Button icon={<UploadOutlined />}>
                  {fileInfo[record.courseName]?.name || 'Click to Update'}
                </Button>
                </Upload>
                <Button
                  className='ms-2'
                  type="primary"
                  onClick={() => handleUpdateClick(record.courseName)}
                  disabled={updateLoading[record.courseName]}
                >
                  {updateLoading[record.courseName]
                    ? 'Updating...'
                    : 'Update Key'}
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
        <div className='d-flex align-items-center justify-content-between mb-4' >
          <a href="/template.xlsx">
            <Button
              type="primary"
              disabled={loading}
            >
              Download Key Template
            </Button>
          </a>
        </div>
      </div >
      <div className='gap-5'>
        <Table columns={columns} dataSource={courseNames.map((courseName) => ({ courseName }))} rowKey="courseName" />
      </div>
      {modalVisible && (


        <Modal
          title={`Scores for ${selectedCourse}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={1000}
          style={{ overflowX: 'scroll' }}
        >
          {modalVisible && <ViewScore courseName={selectedCourse} />}
        </Modal>
      )
      }
    </div >
  );
};

export default GenerateScore;
