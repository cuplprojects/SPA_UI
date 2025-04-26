import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, Checkbox, notification, Spin } from 'antd';
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
  const [loading, setLoading] = useState(false);
  const database = useDatabase();
  const token = useUserToken();
  const [withConfigs, setWithConfigs] = useState([]);
  const [withoutConfigs, setWithoutConfigs] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const url = `${apiurl}/Projects/GetFromToProject`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allProjects = response.data;
      setWithConfigs(allProjects.fromProject);
      setWithoutConfigs(allProjects.toProject);

    } catch (error) {
      console.error('Error fetching projects:', error);
      notification.error({ message: 'Failed to fetch projects', duration: 3 });
    } finally {
      setLoading(false);
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
      setOpen(false);
      setImportFrom();
      setImportTo();
      setImportFieldConfigsState();
      setImportImageConfigsState();
      setImportResponseConfigsState();
    } catch (error) {
      console.error('Error importing data:', error);
      notification.error({ message: 'Failed to import data', duration: 3 });
      setImportFrom();
      setImportTo();
      setImportFieldConfigsState();
      setImportImageConfigsState();
      setImportResponseConfigsState();
    } finally {
      setConfirmLoading(false);
      setImportFrom();
      setImportTo();
      setImportFieldConfigsState();
      setImportImageConfigsState();
      setImportResponseConfigsState();
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const importImageConfigs = async (projectIdFrom, projectIdTo) => {
    try {
      const res = await axios.get(
        `${apiurl}/ImageConfigs/ByProjectId/${projectIdFrom}?WhichDatabase=${database}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const decryptedData = JSON.parse(handleDecrypt(res.data))[0];
      decryptedData.ProjectId = projectIdTo;

      const encryptedDatatobesent = {
        cyphertextt: handleEncrypt(JSON.stringify(decryptedData)),
      };

      if (res.data) {
        await axios.post(
          `${apiurl}/ImageConfigs/?WhichDatabase=${database}`,
          encryptedDatatobesent,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
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
        `${apiurl}/FieldConfigurations/GetByProjectId/${projectIdFrom}?WhichDatabase=${database}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const decryptedData = JSON.parse(handleDecrypt(res.data));
      if (decryptedData.length > 0) {
        for (let i = 0; i < decryptedData.length; i++) {
          decryptedData[i].ProjectId = projectIdTo;
          decryptedData[i].FieldConfigurationId = 0;
          const encryptedDatatobesent = {
            cyphertextt: handleEncrypt(JSON.stringify(decryptedData[i])),
          };
          await axios.post(
            `${apiurl}/FieldConfigurations/?WhichDatabase=${database}`,
            encryptedDatatobesent,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        }
      } else {
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
        `${apiurl}/ResponseConfigs/byproject/${projectIdFrom}?WhichDatabase=${database}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          const responseConfig = res.data[i];
          responseConfig.projectId = projectIdTo;
          const encrypteddresponsedata = {
            cyphertextt: handleEncrypt(JSON.stringify(responseConfig)),
          };
          await axios.post(
            `${apiurl}/ResponseConfigs?WhichDatabase=${database}`,
            encrypteddresponsedata,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
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
        Import Configurations from Project
      </Button>
      <Modal
        title="Import Data"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        {loading ? (
          <Spin size="large" />
        ) : (
          <>
            <div>
              <label>Import From:</label>
              <Select
                style={{ width: 200 }}
                value={importFrom}
                onChange={handleImportFromChange}
                placeholder="Select project to import from"
              >
                {withConfigs.map((project) => (
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
                {withoutConfigs.map((project) => (
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
                <Checkbox
                  checked={importResponseConfigsState}
                  onChange={handleResponseConfigsChange}
                >
                  Response Configs
                </Checkbox>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ImportProject;
