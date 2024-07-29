import { useDatabase } from '@/store/DatabaseStore';
import { useUserInfo } from '@/store/UserDataStore';
import { useState, useEffect, useCallback } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

const useUserData = (initialUserID) => {
  const { userId: currentUserId } = useUserInfo();
  const [userID, setUserID] = useState(initialUserID || currentUserId);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const database = useDatabase();

  const fetchUserData = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/Users/${id}?WhichDatabase=${database}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      setError(error.message);
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
