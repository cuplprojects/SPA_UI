import { Divider } from 'antd';
import Dropdown from 'antd/es/dropdown/dropdown';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { IconButton } from '@/components/icon';
import { useLoginStateContext } from '@/pages/sys/login/providers/LoginStateProvider';
import { useRouter } from '@/router/hooks';
import { useUserInfo, useUserActions } from '@/store/UserDataStore';
import { useThemeToken } from '@/theme/hooks';
import useUserData from '@/CustomHooks/useUserData';

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;
const avatarimg = 'https://placehold.co/40';

export default function AccountDropdown() {
  const { userId } = useUserInfo();
  const { userData, loading, error } = useUserData(); // Use the custom hook with userId
  const { replace } = useRouter();
  const { clearUserInfoAndToken } = useUserActions();
  const { backToLogin } = useLoginStateContext();
  const { t } = useTranslation();

  const logout = () => {
    try {
      // todo const logoutMutation = useMutation(userService.logout);
      // todo logoutMutation.mutateAsync();
      clearUserInfoAndToken();
      backToLogin();
    } catch (error) {
      console.log(error);
    } finally {
      replace('/login');
    }
  };

  const { colorBgElevated, borderRadiusLG, boxShadowSecondary } = useThemeToken();

  const contentStyle = {
    backgroundColor: colorBgElevated,
    borderRadius: borderRadiusLG,
    boxShadow: boxShadowSecondary,
  };

  const menuStyle = {
    boxShadow: 'none',
  };

  const dropdownRender = (menu) => (
    <div style={contentStyle}>
      <div className="flex flex-col items-start p-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <>
            <div>
              {userData?.firstName} {userData?.lastName}
            </div>
            <div className="text-gray">{userData?.email}</div>
          </>
        )}
      </div>
      <Divider style={{ margin: 0 }} />
      {React.cloneElement(menu, { style: menuStyle })}
    </div>
  );

  const items = [
    {
      label: <NavLink to="/default/profile">{t('sys.menu.user.profile')}</NavLink>,
      key: '2',
    },
    { label: <NavLink to={HOMEPAGE}>{t('sys.menu.dashboard')}</NavLink>, key: '1' },
    { type: 'divider' },
    {
      label: <button className="font-bold text-warning">{t('sys.login.logout')}</button>,
      key: '4',
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} dropdownRender={dropdownRender}>
      <IconButton className="h-10 w-10 transform-none px-0 hover:scale-105">
        <img className="h-8 w-8 rounded-full" src={avatarimg} alt="" />
      </IconButton>
    </Dropdown>
  );
}
