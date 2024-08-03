import { useDatabase } from '@/store/DatabaseStore';
import { useUserInfo, useUserToken } from '@/store/UserDataStore';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

const useUserData = (initialUserID) => {
  const { userId: currentUserId } = useUserInfo();
  const [userID, setUserID] = useState(initialUserID || currentUserId);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const database = useDatabase();
  const token = useUserToken()

  const fetchUserData = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/Users/${id}?WhichDatabase=${database}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData(response.data);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData(userID);
  }, [userID, fetchUserData]);

  return { userData, loading, error, setUserID, refetchUserData: () => fetchUserData(userID) };
};

export default useUserData;
