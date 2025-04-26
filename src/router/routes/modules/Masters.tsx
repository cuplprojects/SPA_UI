import { Typography } from 'antd';
import { Suspense } from 'react';
import {  Outlet } from 'react-router-dom';

import { SvgIcon } from '@/components/icon';
import { CircleLoading } from '@/components/loading';

import { AppRouteObject } from '#/router';

function MenuLevel({ title }: { title: string }) {
  return <Typography.Title>Menu Level: {title}</Typography.Title>;
}

const Master: AppRouteObject = {
  order: 5,
  path: 'Masters',
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: 'sys.menu.Master',
    icon: <SvgIcon icon="ic-menulevel" className="ant-menu-item-icon" size="24" />,
    key: '/Masters',
  },
  children: [
    {
      path: 'Projects',
      element: <MenuLevel title="projects" />,
      meta: { label: 'sys.menu.project', key: '/Masters/Projects' },
    },
    {
      path: 'Fields',
      element: <MenuLevel title="fields" />,
      meta: { label: 'sys.menu.fields', key: '/Masters/Fields' },
    },
  
  ],
};

export default Master;
