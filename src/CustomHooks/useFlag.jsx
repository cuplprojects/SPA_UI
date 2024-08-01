import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDatabase } from '@/store/DatabaseStore';

const apiUrl = import.meta.env.VITE_API_URL;


const useFlags = (projectId) => {
  const [flags, setFlags] = useState([]);
  const [remarksCounts, setRemarksCounts] = useState([]);
  const [corrected, setCorrected] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const database = useDatabase()

  const getFlags = async () => {
    try {
      const response = await axios.get(`${apiUrl}/Flags/counts/projectId?projectId=${projectId}&WhichDatabase=${database}`);
      const result = response.data;
      setFlags(result.countsByFieldname);
      setRemarksCounts(result.remarksCounts);
      setCorrected(result.corrected);
      setRemaining(result.remaining);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error fetching flags:', error);
    }
  };

  useEffect(() => {
    getFlags();
  }, [projectId]);

  return { flags, remarksCounts, corrected, remaining, totalCount, getFlags };
};

export default useFlags;
