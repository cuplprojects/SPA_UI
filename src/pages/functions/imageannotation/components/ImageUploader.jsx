// components/ImageUploader.jsx
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import React, { useState } from 'react';

const ImageUploader = ({ onImageSelect }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    return isJpgOrPng;
  };

  const customRequest = ({ file, onSuccess }) => {
    // Simulating a delay for demonstration purposes
    setTimeout(() => {
      try {
        // Mocking a response with a temporary URL (you should adjust this)
        const imageUrl = URL.createObjectURL(file);
        setImageUrl(imageUrl);

        // Read the file contents and extract dimensions
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            onImageSelect(reader.result);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);

        // Finish the upload process
        onSuccess("ok");
        setUploading(false);
      } catch (error) {
        message.error('Failed to upload image.');
        setUploading(false);
      }
    }, 1000);
  };

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload Sample OMR</div>
    </button>
  );

  return (
    <div >
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onChange={handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ height: '100%' }} /> : uploadButton}
      </Upload>
    </div>
  );
};

export default ImageUploader;
