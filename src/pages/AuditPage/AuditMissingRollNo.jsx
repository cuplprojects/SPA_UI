import { useProjectId } from '@/store/ProjectState';
import { Button, notification, Tooltip } from 'antd';
import React, { useState } from 'react';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import { SearchOutlined } from '@ant-design/icons';

const apiUrl = import.meta.env.VITE_API_URL;

const AuditMissingRollNo = ({ getFlags }) => {
  const projectId = useProjectId();
  const [loading, setLoading] = useState(false);
  const database = useDatabase();
  const token = useUserToken();

  const AuditMissingRoll = async () => {
    setLoading(true); // Start loading
    try {
      const res = await axios.get(`${apiUrl}/Audit/MissingRollNumbers?WhichDatabase=${database}&ProjectId=${projectId}`,{
        headers:{
        Authorization : `Bearer ${token}`
      }});
      console.log(res.data);
      notification.success({
        message: 'Success',
        description: 'Missing Roll No. Audited',
        duration: 2,
      });
      getFlags(); // Update flags after a successful audit
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed To Audit Missing Roll No.',
        duration: 2,
      });
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <Tooltip title="Find missing roll numbers in the dataset">
      <Button
        type="primary"
        onClick={AuditMissingRoll}
        loading={loading}
        disabled={loading}
        icon={<SearchOutlined />}
        style={{
          borderRadius: '4px',
          boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
        }}
      >
        {loading ? 'Auditing Missing Roll No...' : 'Audit Missing Roll No.'}
      </Button>
    </Tooltip>
  );
};

export default AuditMissingRollNo;
