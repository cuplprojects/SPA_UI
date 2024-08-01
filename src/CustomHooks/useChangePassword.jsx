import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useUserInfo } from '@/store/UserDataStore';
import { useDatabase } from '@/store/DatabaseStore';
import { notification } from 'antd';

const apiUrl = import.meta.env.VITE_API_URL;

// Define the hook
const useChangePassword = () => {
  const { userId } = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const database = useDatabase();
  const notificationRef = useRef(null);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = { oldPassword, newPassword };
      const response = await axios.put(
        `${apiUrl}/Login/Changepassword/${userId}?WhichDatabase=${database}`,
        data
      );

      if (response.status === 200) {
        setSuccess(true);
        // Show success notification
        if (notificationRef.current) {
          notificationRef.current.success({
            message: 'Password changed successfully',
            duration: 2,
          });
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while changing the password.');
      // Show error notification
      if (notificationRef.current) {
        notificationRef.current.error({
          message: 'Update failed!',
          description: err.message,
          duration: 3,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, database]);

  // Initialize notification reference
  notificationRef.current = notification;

  return {
    changePassword,
    loading,
    error,
    success,
  };
};

export default useChangePassword;
