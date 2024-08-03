import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';
import { useState, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

const useProject = (projectId) => {
  const [projectName, setProjectName] = useState('');
  const database = useDatabase();
  const token = useUserToken();

  const fetchProjectName = async () => {
    if (projectId > 0) {
      try {
        const response = await fetch(`${apiUrl}/Projects/${projectId}?WhichDatabase=${database}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProjectName(data.projectName);
        } else {
          console.error('Failed to fetch project data');
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    }
  };

  useEffect(() => {
    fetchProjectName();
  }, [projectId, database]); // Include `database` as a dependency

  return { projectName, fetchProjectName }; // Return both projectName and fetchProjectName
};

export default useProject;
