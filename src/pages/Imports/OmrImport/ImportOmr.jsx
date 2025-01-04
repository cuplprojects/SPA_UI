import React, { useState } from 'react';
import axios from 'axios';
import { Button, Progress, notification, Upload, Typography, Card, Table, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
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

  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();

  const handleFileChange = ({ fileList }) => {
    if (fileList.length === 0) {
      setFailedFiles([]);
      setFiles([]);
    } else {
      setFailedFiles([]);
      setFiles(fileList.map((f) => f.originFileObj));
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
      // Handle any errors that might occur while uploading the batch
      // setFailedFiles((prevFailedFiles) => [
      //   ...prevFailedFiles,
      //   {
      //     fileName: `Batch ${batchIndex + 1}`,
      //     reason: error.response ? error.response.data.message : error.message,
      //   },
      // ]);
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
      notification.warning({
        message: 'Upload completed with failures.',
        description: `${failedFiles.length} file(s) failed to upload.`,
        duration: 5,
      });
    } else {
      notification.success({
        message: 'All files uploaded successfully!',
        duration: 3,
      });
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
    <Card style={{ margin: '20px auto', maxWidth: 900, padding: 20 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
        Upload OMR Images
      </Title>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload
          multiple
          accept=".jpg,.jpeg"
          beforeUpload={() => false}
          onChange={handleFileChange}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} block size="medium" type="primary">
            Select Files
          </Button>
        </Upload>

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
