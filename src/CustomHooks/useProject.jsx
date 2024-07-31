import { useDatabase } from '@/store/DatabaseStore';
import { useState, useEffect } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

const useProject = (projectId) => {
  const [projectName, setProjectName] = useState('');
  const database = useDatabase();

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/Projects/${projectId}?WhichDatabase=${database}`,
        );
        if (response.ok) {
          const data = await response.json();
          setProjectName(data.projectName);
        } else {
          console.error('Failed to fetch project data');
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectName();
  }, [projectId]);

  return projectName;
};

export default useProject;
