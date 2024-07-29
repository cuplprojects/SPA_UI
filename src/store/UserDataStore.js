
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { getItem, removeItem, setItem } from '@/utils/storage';
import { PERMISSION_LIST } from '@/_mock/assets';
import Cookies from 'js-cookie';

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;
const apiUrl = import.meta.env.VITE_API_URL;


// Function to recursively filter permissions
const filterPermissions = (menuItems, permissionIds) => {
  return menuItems
    .map((item) => {
      if (permissionIds.includes(item.id)) {
        // Include this item and filter its children recursively
        let filteredChildren = [];
        if (item.children) {
          filteredChildren = filterPermissions(item.children, permissionIds);
        }
        const result = {
          ...item,
        };
        if (filteredChildren.length > 0) {
          result.children = filteredChildren;
        }
        return result;
      } else if (item.children) {
        // Filter children recursively
        const filteredChildren = filterPermissions(item.children, permissionIds);
        // Remove items without valid children
        const validChildren = filteredChildren.filter((child) => child !== null);
        if (validChildren.length > 0) {
          return {
            ...item,
            children: validChildren,
          };
        }
      }
      // Return null if item and its children do not match permissions
      return null;
    })
    .filter((item) => item !== null);
};

// Filtering based on userpermissionbyid


const userDataStore = create((set) => ({
  userInfo: getItem('user') || {},
  userToken: getItem('Token') || '',
  actions: {
    setUserInfo: (userInfo) => {
      set({ userInfo });
      setItem('user', userInfo);
    },
    setUserToken: (userToken) => {
      set({ userToken });
      setItem('Token', userToken);
    },
    clearUserInfoAndToken() {
      set({ userInfo: {}, userToken: '' });
      removeItem('user');
      Cookies.remove('Token');
    },
  },
}));

export const useUserInfo = () => userDataStore((state) => state.userInfo);
export const useUserToken = () => userDataStore((state) => state.userToken);
export const useUserPermission = () => userDataStore((state) => state.userInfo.permissions);
export const useUserActions = () => userDataStore((state) => state.actions);

export const useSignIn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notification, message } = App.useApp();
  const { setUserToken, setUserInfo } = useUserActions();

  const signIn = useCallback(
    async (data) => {
      const { username, password } = data;
      try {
        // Simulating a login request
        const res = await axios.post(`${apiUrl}/Login`, {
          email: username,
          password,
        });

        console.log(res.data);
        // Assuming the response structure has token, userId, autogenPass, and role fields
        const { token, userId, autogenPass, role } = res.data;

        // Construct the user object as needed
        const user = {
          userId,
          autogenPass,
          role,
          permissions: filterPermissions(PERMISSION_LIST, role.permissionList)
        };

        const accessToken = {
          accessToken: token,
        };
        // Setting user token and info in Zustand store
        setUserToken(accessToken);

        setUserInfo(user);

        // Redirecting to homepage after successful login
        navigate(HOMEPAGE, { replace: true });

        // Showing success notification
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${username}`,
          duration: 3,
        });
      } catch (err) {
        // Handling login error
        message.warning({
          content: err.response?.data?.message || err.message,
          duration: 3,
        });
      }
    },
    [setUserToken, setUserInfo, navigate, t, notification, message],
  );
  return signIn;
};

export default userDataStore;
