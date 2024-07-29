import { lazy, Suspense } from 'react';
import { Iconify } from '@/components/icon';
import { CircleLoading } from '@/components/loading';
import { AppRouteObject } from '#/router';

const UserProfile = lazy(() => import('@/pages/management/user/profile'));
const Workbench = lazy(() => import('@/pages/dashboard/workbench'));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}

const userRoutes: AppRouteObject[] = [
  {
    path: 'user/profile',
    element: (
      <Wrapper>
        <UserProfile />
      </Wrapper>
    ),
    meta: {
      label: 'User Profile',
      icon: <Iconify icon="solar:user-bold-duotone" size={24} />,
      key: 'user/profile',
    },
  },
  {
    path: 'user/workbench',
    element: (
      <Wrapper>
        <Workbench />
      </Wrapper>
    ),
    meta: {
      label: 'Workbench',
      icon: <Iconify icon="solar:workbench-bold-duotone" size={24} />,
      key: 'user/workbench',
    },
  },
];

export default userRoutes;
