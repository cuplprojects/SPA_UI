import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, Checkbox, notification } from 'antd';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';
import { handleDecrypt, handleEncrypt } from '@/Security/Security';
import { useUserToken } from '@/store/UserDataStore';

const { Option } = Select;
const apiurl = import.meta.env.VITE_API_URL;

const ImportProject = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [importFrom, setImportFrom] = useState('');
  const [importTo, setImportTo] = useState('');
  const [importImageConfigsState, setImportImageConfigsState] = useState(false);
  const [importFieldConfigsState, setImportFieldConfigsState] = useState(false);
  const [importResponseConfigsState, setImportResponseConfigsState] = useState(false);
  const [projects, setProjects] = useState([]);
  const database = useDatabase();
  const token = useUserToken();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const url = `${apiurl}/Projects?WhichDatabase=${database}`;
      const response = await axios.get(url);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      notification.error({ message: 'Failed to fetch projects', duration: 3 });
    }
  };

  const handleImportFromChange = (value) => {
    setImportFrom(value);
  };

  const handleImportToChange = (value) => {
    setImportTo(value);
  };

  const handleImageConfigsChange = (e) => {
    setImportImageConfigsState(e.target.checked);
  };

  const handleFieldConfigsChange = (e) => {
    setImportFieldConfigsState(e.target.checked);
  };

  const handleResponseConfigsChange = (e) => {
    setImportResponseConfigsState(e.target.checked);
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);

      if (importImageConfigsState) {
        await importImageConfigs(importFrom, importTo);
      }

      if (importFieldConfigsState) {
        await importFieldConfigs(importFrom, importTo);
      }

      if (importResponseConfigsState) {
        await importResponseConfigs(importFrom, importTo);
      }

      notification.success({ message: 'Data imported successfully', duration: 3 });
      console.log('Data imported successfully');
      setOpen(false);
    } catch (error) {
      console.error('Error importing data:', error);
      notification.error({ message: 'Failed to import data', duration: 3 });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  const importImageConfigs = async (projectIdFrom, projectIdTo) => {
    try {
      const res = await axios.get(
        `${apiurl}/ImageConfigs/ByProjectId/${projectIdFrom}?WhichDatabase=${database}`,{
          headers:{
          Authorization : `Bearer ${token}`
        }
    });
      const decryptedData = JSON.parse(handleDecrypt(res.data))[0];
      console.log(decryptedData);
      decryptedData.ProjectId = projectIdTo;

      const encryptedDatatobesent = {
        cyphertextt: handleEncrypt(JSON.stringify(decryptedData)),
      };

      if (res.data) {
        const postRes = await axios.post(
          `${apiurl}/ImageConfigs/?WhichDatabase=${database}`,
          encryptedDatatobesent,
        );
      } else {
        console.log(`No ImageConfigs found for Project ${projectIdFrom}`);
      }
    } catch (error) {
      console.error('Error importing ImageConfigs:', error);
      notification.error({ message: 'Failed to import ImageConfigs', duration: 3 });
    }
  };

  const importFieldConfigs = async (projectIdFrom, projectIdTo) => {
    try {
      const res = await axios.get(
        `${apiurl}/FieldConfigurations/GetByProjectId/${projectIdFrom}?WhichDatabase=${database}`,{
          headers:{
          Authorization : `Bearer ${token}`
        }}
      );
      const decryptedData = JSON.parse(handleDecrypt(res.data));
      console.log(decryptedData);
      if (decryptedData.length > 0) {
        for (let i = 0; i < decryptedData.length; i++) {
          decryptedData[i].ProjectId = projectIdTo;
          decryptedData[i].FieldConfigurationId=0;
          try
          {
            const encryptedDatatobesent = {
              cyphertextt: handleEncrypt(JSON.stringify(decryptedData[i])),
            }
            const postRes = await axios.post(
              `${apiurl}/FieldConfigurations/?WhichDatabase=${database}`,{
                headers:{
                Authorization : `Bearer ${token}`
              },
              encryptedDatatobesent,
          })
          }
          catch(error)
          {
            console.error('Error importing FieldConfigs:', error);  
          }
        }
      }
      else{
        console.log(`No FieldConfigurations found for Project ${projectIdFrom}`);
      }
    } catch (error) {
      console.error('Error importing FieldConfigs:', error);
      notification.error({ message: 'Failed to import FieldConfigs', duration: 3 });
    }
  };

  const importResponseConfigs = async (projectIdFrom, projectIdTo) => {
    try {
      const res = await axios.get(
        `${apiurl}/ResponseConfigs/byproject/${projectIdFrom}?WhichDatabase=${database}`,{
          headers:{
          Authorization : `Bearer ${token}`
        }}
      );
      console.log(res.data)
      
      if (res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          const responseConfig = res.data[i];
          // Modify the projectId to point to projectIdTo if needed
           responseConfig.projectId = projectIdTo;
           console.log(responseConfig)
          // Assuming responseConfig already has this field
          const encrypteddresponsedata = {
            cyphertextt: handleEncrypt(JSON.stringify(responseConfig)),
          }
          const postRes = await axios.post(
            `${apiurl}/ResponseConfigs?WhichDatabase=${database}`,
            encrypteddresponsedata,
          );
          console.log(
            `Successfully imported ResponseConfig with ID ${responseConfig.id} to Project ${projectIdTo}`,
          );
        }
        console.log(`All ResponseConfigs imported successfully to Project ${projectIdTo}`);
      } else {
        console.log(`No ResponseConfigs found for Project ${projectIdFrom}`);
      }
    } catch (error) {
      console.error('Error importing ResponseConfigs:', error);
      notification.error({ message: 'Failed to import ResponseConfigs', duration: 3 });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Import from Project
      </Button>
      <Modal
        title="Import Data"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <div>
          <label>Import From:</label>
          <Select
            style={{ width: 200 }}
            value={importFrom}
            onChange={handleImportFromChange}
            placeholder="Select project to import from"
          >
            {projects.map((project) => (
              <Option key={project.projectId} value={project.projectId}>
                {project.projectName}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Import To:</label>
          <Select
            style={{ width: 200 }}
            value={importTo}
            onChange={handleImportToChange}
            placeholder="Select project to import to"
          >
            {projects
              .filter((project) => project.projectId !== importFrom)
              .map((project) => (
                <Option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </Option>
              ))}
          </Select>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Import Options:</label>
          <div>
            <Checkbox checked={importImageConfigsState} onChange={handleImageConfigsChange}>
              Image Configs
            </Checkbox>
          </div>
          <div>
            <Checkbox checked={importFieldConfigsState} onChange={handleFieldConfigsChange}>
              Field Configs
            </Checkbox>
          </div>
          <div>
            <Checkbox checked={importResponseConfigsState} onChange={handleResponseConfigsChange}>
              Response Configs
            </Checkbox>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImportProject;
