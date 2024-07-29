import { Suspense, lazy } from 'react';

import Card from '@/components/card';
import { Iconify, SvgIcon } from '@/components/icon';
import { CircleLoading } from '@/components/loading';
import ProTag from '@/theme/antd/components/tag';
import { AppRouteObject } from '#/router';
import Import from '@/pages/Imports/AllImports';

const ExternalLink = lazy(() => import('@/pages/sys/others/iframe/external-link'));
const Iframe = lazy(() => import('@/pages/sys/others/iframe'));
// const Calendar = lazy(() => import('@/pages/sys/others/calendar'));
const Kanban = lazy(() => import('@/pages/sys/others/kanban'));
const ProjectConfig = lazy(() => import('@/pages/ProjectConfig'));

const Audit = lazy(() => import('@/pages/AuditPage/Audit'));

const Correction = lazy(() => import('@/pages/correction/CorrectionPage'));
const ProjectDashboard = lazy(() => import('@/pages/ProjectDashboard'));
const UserProfile =  lazy(() => import('@/pages/management/user/profile'));



function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}
const others: AppRouteObject[] = [
  //ProjectConfiguration COmponent
  {
    path: 'ProjectConfiguration',
    element: (
      <Wrapper>
        <ProjectConfig />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.ProjectConfig',
      icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
      key: '/ProjectConfiguration',
    },
  },
  // Import Component
  {
    path: 'AllImports',
    element: (
      <Wrapper>
        <Import />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.AllImports',
      icon: <Iconify icon="solar:upload-square-bold-duotone" size={24} />,
      key: '/AllImports',
    },
  },
  // Correction Window
  {
    path: 'correction',
    element: (
      <Wrapper>
        <Correction />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.correctionwindow',
      icon: <Iconify icon="solar:document-add-bold-duotone" size={24} />,
      key: '/correction',
    },
  },
  {
    path: 'profile',
    element: (
      <Wrapper>
        <UserProfile />
      </Wrapper>
    ),
    meta: {
      label: 'User Profile',
      icon: <Iconify icon="solar:user-bold-duotone" size={24} />,
      key: '/user/profile',
    },
  },
  {
    path: 'ProjectDashboard',
    element: (
      <Wrapper>
        <ProjectDashboard />
      </Wrapper>
    ),
    meta: {
      label: 'Project Dashboard',
      icon: <Iconify icon="solar:document-add-bold-duotone" size={24} />,
      key: '/ProjectDashboard',
    },
  },
  {
    path: 'Audit',
    element: (
      <Wrapper>
        <Audit />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.Audit',
      icon: <Iconify icon="solar:calendar-bold-duotone" size={24} />,
      key: '/Audit',
    },
  },

  {
    path: 'kanban',
    element: (
      <Wrapper>
        <Kanban />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.kanban',
      icon: <Iconify icon="solar:clipboard-bold-duotone" size={24} />,
      key: '/kanban',
    },
  },
  {
    element: (
      <Wrapper>
        <div />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.disabled',
      icon: <SvgIcon icon="ic_disabled" className="ant-menu-item-icon" size="24" />,
      disabled: true,
      key: '/disabled',
    },
  },
  {
    path: 'label',
    element: (
      <Wrapper>
        <div />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.label',
      icon: <SvgIcon icon="ic_label" className="ant-menu-item-icon" size="24" />,
      suffix: (
        <ProTag color="red" icon={<Iconify icon="solar:bell-bing-bold-duotone" size={14} />}>
          NEW
        </ProTag>
      ),
      key: '/label',
    },
  },
  {
    path: 'frame',
    meta: {
      label: 'sys.menu.frame',
      icon: <SvgIcon icon="ic_external" className="ant-menu-item-icon" size="24" />,
      key: '/frame',
    },
    children: [
      {
        path: 'external_link',
        element: (
          <Wrapper>
            <ExternalLink src="https://ant.design/index-cn" />
          </Wrapper>
        ),
        meta: {
          label: 'sys.menu.external_link',
          key: '/frame/external_link',
        },
      },
      {
        path: 'iframe',
        element: (
          <Wrapper>
            <Iframe src="https://ant.design/index-cn" />
          </Wrapper>
        ),
        meta: {
          label: 'sys.menu.iframe',
          key: '/frame/iframe',
        },
      },
    ],
  },
  {
    path: 'blank',
    element: (
      <Wrapper>
        <Card />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.blank',
      icon: <SvgIcon icon="ic_blank" className="ant-menu-item-icon" size="24" />,
      key: '/blank',
    },
  },
];

export default others;
