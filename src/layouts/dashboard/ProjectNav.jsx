import React, { useEffect } from 'react';
import useProject from '@/CustomHooks/useProject';
import { useProjectId } from '@/store/ProjectState';
import { useThemeToken } from '@/theme/hooks';  // Import theme hook

const ProjectNav = () => {
  const projectId = useProjectId();
  const { projectName, fetchProjectName } = useProject(projectId);
  const { colorPrimary } = useThemeToken();  // Access primary color from theme

  useEffect(() => {
    if (projectId) {
      fetchProjectName();
    }
  }, [projectId, fetchProjectName]);

  return (
    <>
      {projectId > 0 ? (
        <div
          className="bg-light w-100 items-center text-center py-2 text-xl font-bold mb-3"
          style={{ color: colorPrimary }}  // Apply primary color to text
        >
          {projectName || 'Loading...'}
        </div>
      ) : null}
    </>
  );
};

export default ProjectNav;
