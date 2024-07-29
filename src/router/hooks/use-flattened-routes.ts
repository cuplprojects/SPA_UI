import { useCallback, useMemo } from 'react';

import { flattenMenuRoutes, menuFilter } from '../utils';

import { usePermissionRoutes } from './use-permission-routes';

/**
 * Return to the menu route after flattening
 */
export function useFlattenedRoutes() {
  const flattenRoutes = useCallback(flattenMenuRoutes, []);
  const permissionRoutes = usePermissionRoutes();
  return useMemo(() => {
    const menuRoutes = menuFilter(permissionRoutes);
    return flattenRoutes(menuRoutes);
  }, [flattenRoutes, permissionRoutes]);
}
