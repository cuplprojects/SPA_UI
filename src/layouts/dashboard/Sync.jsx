import React, { useState } from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
// import { Iconify } from '@/components/icon';
const apiurl = import.meta.env.VITE_API_URL


const Sync = () => {
  const [loading, setLoading] = useState(false);

  const SyncData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiurl}/Sync/SyncLogs`);
      message.success('Data synced successfully!');
    } catch (error) {
      console.error('Error syncing data:', error);
      message.error('Failed to sync data. Please try again.');
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
