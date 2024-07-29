import { useState, useCallback } from 'react';
import axios from 'axios';
import { useUserInfo } from '@/store/UserDataStore';
import { useDatabase } from '@/store/DatabaseStore';
const apiUrl = import.meta.env.VITE_API_URL;

// Define the hook
const useChangePassword = () => {
  const {userId} = useUserInfo()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const database = useDatabase();

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.put(`${apiUrl}/Login/Changepassword/${userId}?WhichDatabase=${database}`, {
        oldPassword,
        newPassword,
      });

      // Assuming a successful response indicates success
      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while changing the password.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    changePassword,
    loading,
    error,
    success,
  };
};

export default useChangePassword;
