import { useProjectId } from '@/store/ProjectState';
import { Button, notification } from 'antd';
import React, { useState } from 'react';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

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
        description: 'Failed To Audit Missiing Roll No.',
        duration: 2,
      });
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={AuditMissingRoll}
        loading={loading} // Show loading spinner
        disabled={loading} // Disable button while loading
      >
        {loading ? 'Auditing Missing Roll No...' : 'Audit Missing Roll No.'}
      </Button>
    </div>
  );
};

export default AuditMissingRollNo;
