import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Progress, notification, Upload, Typography, Card, Table, Space, Popconfirm, Badge } from 'antd';
import { UploadOutlined, DownloadOutlined, CloudUploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;

const apiurl = import.meta.env.VITE_API_URL;

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failedFiles, setFailedFiles] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [uplodedImages, setUplodedImages] = useState([]);

  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();

  const handleFileChange = ({ fileList }) => {
    // Clear any previously selected files and set the new ones
    setFiles(fileList.map((f) => f.originFileObj));  // Reset state with the newly selected files
  };
  
  const clearFiles = () => {
    setFiles([]);
    setFailedFiles([]);
  };

  
  useEffect(() => {
    fetchUplodedImages();
  }, []);

  const fetchUplodedImages = async () => {
    try {
      const omrImagesCount = await axios.get(`${apiurl}/Projects/GetProjectCounts?ProjectId=${ProjectId}&CategoryName=Images&WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(omrImagesCount.data);
      setUplodedImages(omrImagesCount.data);
    } catch (error) {
      console.error('Error fetching uploded images:', error);
    }
  };

  // Function to handle batch upload and capture file-level errors
  const uploadBatch = async (batchFiles, batchIndex, totalBatches) => {
    const formData = new FormData();
    batchFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(
        `${apiurl}/OMRData/upload-batch?WhichDatabase=${database}&ProjectId=${ProjectId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const batchProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              const overallProgress =
                ((batchIndex / totalBatches) * 100) + (batchProgress / totalBatches);
              setProgress(overallProgress);
            }
          },
        }
      );

      // Handling individual file errors from the response
      if (response.data.failedFiles) {
        const newFailedFiles = response.data.failedFiles.map((failedFile) => {
          return {
            fileName: failedFile.split(":")[0].trim(), // Get file name from the response
            reason: failedFile.split(":")[1].trim(),   // Get the reason for failure
          };
        });
        console.log(newFailedFiles);
        // Append the new failed files to the existing failedFiles state
        setFailedFiles((prevFailedFiles) => [
          ...prevFailedFiles,
          ...newFailedFiles,
        ]);
      }

    } catch (error) {
      if (error.response && error.response.status === 400) {
        const newFailedFiles = error.response.data.failedFiles.map((failedFile) => {
          return {
            fileName: failedFile.split(":")[0].trim(), // Get file name from the response
            reason: failedFile.split(":")[1].trim().replace(/.*Duplicate entry '.+?'.* for key '.+?'/, 'Duplicate entry'),
          };
        });
        console.log(newFailedFiles);
        // Append the new failed files to the existing failedFiles state
        setFailedFiles((prevFailedFiles) => [
          ...prevFailedFiles,
          ...newFailedFiles,
        ]);
      }
    }
  };

  // Submit function to start the batch upload process
  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    setFailedFiles([]);

    const totalFiles = files.length;
    const batchSize = 20;
    const batches = [];

    for (let i = 0; i < totalFiles; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    const totalBatches = batches.length;

    for (let i = 0; i < totalBatches; i++) {
      await uploadBatch(batches[i], i, totalBatches); // Upload batch of files
      setProgress(((i + 1) / totalBatches) * 100); // Update progress after each batch

    }

    setLoading(false);
    // Clear the selected files
    setFiles([]);
    if (failedFiles.length > 0) {
      setFiles([]);
      notification.warning({
        message: 'Upload completed with failures.',
        description: `${failedFiles.length} file(s) failed to upload.`,
        duration: 5,
      });
    } else {
      setFiles([]);
      fetchUplodedImages();
      notification.success({
        message: 'All files uploaded successfully!',
        duration: 3,
      });
    }
  };

  const handleDeleteAllImages = async () => {
    try {
      await axios.delete(`${apiurl}/OMRData/Images?WhichDatabase=${database}&ProjectId=${ProjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      notification.success({
        message: 'All images deleted successfully!',
        duration: 3,
      });
      fetchUplodedImages();
    } catch (error) {
      console.error('Error deleting all images:', error);
    }
  };

  // Handle failed files download
  const handleDownloadFailedFiles = () => {
    const worksheet = XLSX.utils.json_to_sheet(failedFiles);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Failed Files');
    XLSX.writeFile(workbook, 'FailedFilesReport.xlsx');
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  return (
    <Card style={{ margin: '20px auto', maxWidth: 900, padding: 20 ,border:"1px solid #00A76F"}}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 20,color:"#00A76F" }}>
        Upload OMR Images
      </Title>

      <Space direction="vertical" style={{ width: '100%' }}>
        <div className='d-flex justify-content-between align-items-center'>
          <Upload
            multiple
            accept=".jpg,.jpeg"
            beforeUpload={() => false}
            onChange={handleFileChange}
            showUploadList={false}
            fileList={[]} // Ensure fileList is reset when needed
          >
            <Button icon={<UploadOutlined />} block size="medium" type="primary">
              Select Files
            </Button>
          </Upload>
          <span className="ant-btn ant-btn-default border border-primary rounded px-4 py-1 text-primary">
            Uploaded Images: <span className='fw-bold'>{uplodedImages || 0}</span>
          </span>
          
          <div className='d-flex align-items-center'>
            <Popconfirm
              title="Are you sure you want to delete all images?"
              onConfirm={handleDeleteAllImages}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>
                <DeleteOutlined />
                Delete All Images
              </Button>
            </Popconfirm>
          </div>
        </div>


        {files.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text>Selected Files: {files.length}</Text>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={files.length === 0}
            icon={<CloudUploadOutlined />}
            size="medium"
            block
          >
            Upload Files
          </Button>
        </div>

        {progress > 0 && (
          <div style={{ marginTop: 20 }}>
            <Progress percent={Math.round(progress)} status={loading ? 'active' : 'normal'} />
            <Text style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>
              {Math.round(progress)}% Uploaded
            </Text>
          </div>
        )}

        {failedFiles.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Text type="danger" style={{ display: 'block', textAlign: 'center' }}>
              {failedFiles.length} file(s) failed to upload.
            </Text>
            <Table
              columns={columns}
              dataSource={failedFiles}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: failedFiles.length,
                onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
              }}
              rowKey="fileName"
              style={{ marginTop: 20 }}
            />
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadFailedFiles}
                size="large"
                style={{ backgroundColor: '#1890ff', color: 'white' }}
              >
                Download Failed Files Report
              </Button>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ImportOmr;
