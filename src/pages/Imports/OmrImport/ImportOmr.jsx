import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Progress, notification } from 'antd';
import { useProjectId } from '@/store/ProjectState';
import { handleEncrypt } from '@/Security/Security';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

const ImportOmr = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [showReplaceBtn, setShowReplaceBtn] = useState(false);
  const [showSkipAllBtn, setShowSkipAllBtn] = useState(false);
  const [showReplaceAllBtn, setShowReplaceAllBtn] = useState(false);
  const [conflictingFiles, setConflictingFiles] = useState([]);
  
  const [lastUploadedFile, setLastUploadedFile] = useState('');

  const [progress, setProgress] = useState(0);
  const token = useUserToken();
  const ProjectId = useProjectId();
  const database = useDatabase();

  useEffect(() => {
    fetchLastOmrImageName(ProjectId);
  }, [ProjectId]);

  const fetchLastOmrImageName = async (ProjectId) => {
    try {
      const response = await axios.get(
        `${apiurl}/OMRData/omrdata/${ProjectId}/last-image-name?WhichDatabase=${database}`,{
          headers:{
          Authorization : `Bearer ${token}`
        }
    });
      setLastUploadedFile(response.data);
    } catch (error) {
      console.error('Error fetching the last OMR image name:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    setFiles(selectedFiles);
  };


  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImages = async (projectId) => {
    try {
      const response = await axios.delete(`${apiurl}/OMRData/Images?WhichDatabase=${database}&ProjectId=${ProjectId}`, {
          headers:{
          Authorization : `Bearer ${token}`
        }
      });
      notification.success({
        message: 'Images deleted',
        duartion: 3,
      })
      // Handle the response here
      console.log('Deletion successful:', response.data);
    } catch (error) {
      notification.error({
        message: 'Error in deleting Images',
        duartion: 3,
      })
      // Handle errors here
      notification.error({
        message: 'Error in deleting Images',
        duartion: 3,
      })
      console.error('Error deleting Images :', error.response ? error.response.data : error.message);
    }
  };

  const uploadFile = async (file, replace = false) => {
    let progressPercent = 0;
    try {
      const base64File = await readFileAsBase64(file);
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');

      const datatosend = {
        omrImagesName: fileNameWithoutExtension,
        filePath: base64File,
        replace: replace,
      };
      const datatosendjsonstring = JSON.stringify(datatosend);
      const encryptedData = handleEncrypt(datatosendjsonstring);
      const encryptedDatatosend = {
        cyphertextt: encryptedData
      }

      await axios.post(
        `${apiurl}/OMRData/upload-request?ProjectId=${ProjectId}&WhichDatabase=${database}`,
        // { omrImagesName: fileNameWithoutExtension, filePath: base64File, replace: replace } ,
        encryptedDatatosend,
        {
          headers: {
            'Content-Type': 'application/json',
              Authorization : `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              progressPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(progressPercent);
            }
          },
        },
      );
      return { success: true, conflict: false };
    } catch (error) {
      if (error.response && error.response.status === 409) {
        return { success: false, conflict: true };
      } else {
        console.error(`Error uploading file ${file.name}:`, error);
        return { success: false, conflict: false };
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0); // Reset progress

    const uploadPromises = files.map((file) => uploadFile(file));
    const results = await Promise.all(uploadPromises);

    const conflicts = results
      .map((result, index) => (result.conflict ? files[index] : null))
      .filter((file) => file !== null);

    setConflictingFiles(conflicts);

    if (conflicts.length > 0) {
      setShowSkipBtn(true);
      setShowReplaceBtn(true);
      setShowSkipAllBtn(true);
      setShowReplaceAllBtn(true);
      notification.warning({
        message: 'Some files have conflicts.',
        duration: 3
      })
    } else {
      notification.success({
        message: 'All files uploaded successfully.',
        duration: 3
      })
   
      setFiles([]);
    }
    setLoading(false);
  };

  const resolveConflict = async (file, action) => {
    if (action === 'skip') {
      setFiles(files.filter((f) => f.name !== file.name));
    } else if (action === 'replace') {
      await uploadFile(file, true);
    }

    const remainingConflicts = conflictingFiles.filter((f) => f.name !== file.name);
    setConflictingFiles(remainingConflicts);

    if (remainingConflicts.length === 0) {
      setShowSkipBtn(false);
      setShowReplaceBtn(false);
      setShowSkipAllBtn(false);
      setShowReplaceAllBtn(false);
      
      setLoading(false);
    }
  };

  const resolveAllConflicts = async (action) => {
    setLoading(true);
    setProgress(0); // Reset progress

    if (action === 'skip') {
      setFiles(files.filter((file) => !conflictingFiles.includes(file)));
    } else if (action === 'replace') {
      for (const file of conflictingFiles) {
        await uploadFile(file, true);
      }
    }

    setConflictingFiles([]);
    setShowSkipBtn(false);
    setShowReplaceBtn(false);
    setShowSkipAllBtn(false);
    setShowReplaceAllBtn(false);
   
    setLoading(false);
  };

  return (
    <>
    <div className='d-flex align-items-center justify-content-between'>
    <Button danger onClick={handleDeleteImages}>Delete</Button>
     <h3 className="head fs-3 text-center">Upload OMR Images</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="files"
          onChange={handleFileChange}
          multiple
          accept=".jpg,.jpeg"
          required
        />
        <Button type="primary" htmlType="submit" loading={loading} disabled={files.length === 0}>
          Upload Files
        </Button>
        <Button danger onClick={handleDeleteImages}>Delete</Button>
      </form>
  
      <div className="d-flex gap-4">
        {showSkipBtn && (
          <Button danger onClick={() => resolveConflict(conflictingFiles[0], 'skip')}>
            Skip {conflictingFiles[0].name}
          </Button>
        )}
        {showReplaceBtn && (
          <Button type="primary" onClick={() => resolveConflict(conflictingFiles[0], 'replace')}>
            Replace {conflictingFiles[0].name}
          </Button>
        )}
        {showSkipAllBtn && (
          <Button danger onClick={() => resolveAllConflicts('skip')}>
            Skip All Files
          </Button>
        )}
        {showReplaceAllBtn && (
          <Button type="primary" onClick={() => resolveAllConflicts('replace')}>
            Replace All Files
          </Button>
        )}
      </div>
      
    </div>
    {loading && <Progress percent={progress} status="active" />}
      {lastUploadedFile && <p>Last Uploaded File: {lastUploadedFile}</p>}
    </>
  );
};

export default ImportOmr;
