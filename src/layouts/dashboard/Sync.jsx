import React, { useState } from 'react';
import { Button, message, notification } from 'antd';
import axios from 'axios';
// import { Iconify } from '@/components/icon';
const apiurl = import.meta.env.VITE_API_URL


const Sync = () => {
  const [loading, setLoading] = useState(false);

  const SyncData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiurl}/Sync/SyncLogs`);
      notification.success({
        message: 'Success',
        description: 'Sync Success',
        duration:2
      })
    } catch (error) {
      console.error('Error syncing data:', error);
      notification.error({
        message: 'Alert',
        description: 'Sync Failed',
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={SyncData} loading={loading}>
        Sync Databases
      </Button>
      {/* <Iconify icon="solar:calendar-bold-duotone" size={24} /> */}
    </>
  );
};

export default Sync;
