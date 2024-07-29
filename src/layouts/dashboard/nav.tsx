// import React, { useEffect, useState } from 'react';
// import { Menu, MenuProps } from 'antd';
// import Color from 'color';
// import { m } from 'framer-motion';
// import { CSSProperties } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
// import Scrollbar from '@/components/scrollbar';
// import { useRouteToMenuFn, usePermissionRoutes, useFlattenedRoutes } from '@/router/hooks';
// import { menuFilter } from '@/router/utils';
// import { useSettingActions, useSettings } from '@/store/settingStore';
// import { useThemeToken } from '@/theme/hooks';
// import { NAV_COLLAPSED_WIDTH, NAV_WIDTH } from './config';
// import { ThemeLayout } from '#/enum';
// import { ItemType } from 'antd/es/menu/interface';
// import { useProjectId, useProjectActions } from './ProjectStore'; // Adjust the import path as per your project structure

// const slideInLeft = varSlide({ distance: 10 }).inLeft;

// type Props = {
//   closeSideBarDrawer?: () => void;
// };

// const Nav = (props: Props) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//   const { colorPrimary, colorTextBase, colorBgElevated, colorBorder } = useThemeToken();

//   const settings = useSettings();
//   const { themeLayout } = settings;
//   const { setSettings } = useSettingActions();

//   const routeToMenuFn = useRouteToMenuFn();
//   const permissionRoutes = usePermissionRoutes();
//   const flattenedRoutes = useFlattenedRoutes();

//   const [collapsed, setCollapsed] = useState(false);
//   const [openKeys, setOpenKeys] = useState<string[]>([]);
//   const [selectedKeys, setSelectedKeys] = useState<string[]>(['']);
//   const [menuList, setMenuList] = useState<ItemType[]>([]);
//   const [menuMode, setMenuMode] = useState<MenuProps['mode']>('inline');
//   const [currentSelectedProject, setCurrentSelectedProject] = useState<string | null>(null);

//   const projectId = useProjectId();
//   const { setProjectId } = useProjectActions();

//   useEffect(() => {
//     if (currentSelectedProject) {
//       const menuRoutes = menuFilter(permissionRoutes);
//       const menus = routeToMenuFn(menuRoutes);
//       setMenuList(menus);
//     } else {
//       const menuRoutes = menuFilter([permissionRoutes[0], permissionRoutes[1]]);
//       const menus = routeToMenuFn(menuRoutes);
//       setMenuList(menus);
//     }
//   }, [permissionRoutes, routeToMenuFn, currentSelectedProject]);

//   useEffect(() => {
//     if (themeLayout === ThemeLayout.Vertical) {
//       setCollapsed(false);
//       setMenuMode('inline');
//     }
//     if (themeLayout === ThemeLayout.Mini) {
//       setCollapsed(true);
//       setMenuMode('inline');
//     }
//   }, [themeLayout]);

//   useEffect(() => {
//     if (menuList?.length > 0) {
//       if (themeLayout === ThemeLayout.Vertical) {
//         const openKeys = flattenedRoutes
//           .filter((route) => matches(route.pathname))
//           .map((route) => route.pathname);
//         setOpenKeys(openKeys);
//       }
//       setSelectedKeys([pathname]);
//     }
//   }, [menuList, pathname, flattenedRoutes, matches, collapsed, themeLayout]);

//   const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
//     setOpenKeys(keys);
//   };

//   const onClick: MenuProps['onClick'] = ({ key }) => {
//     const nextLink = flattenedRoutes?.find((route) => route.key === key);

//     if (nextLink?.hideTab && nextLink?.frameSrc) {
//       window.open(nextLink.frameSrc, '_blank');
//       return;
//     }

//     navigate(key);
//     props?.closeSideBarDrawer?.();
//   };

//   const setThemeLayout = (themeLayout: ThemeLayout) => {
//     setSettings({
//       ...settings,
//       themeLayout,
//     });
//   };

//   const toggleCollapsed = () => {
//     if (!collapsed) {
//       setThemeLayout(ThemeLayout.Mini);
//     } else {
//       setThemeLayout(ThemeLayout.Vertical);
//     }
//     setCollapsed(!collapsed);
//   };

//   return (
//     <div
//       className="flex h-full flex-col"
//       style={{
//         width: collapsed ? NAV_COLLAPSED_WIDTH : NAV_WIDTH,
//         borderRight: `1px dashed ${Color(colorBorder).alpha(0.6).toString()}`,
//       }}
//     >
//       <div className="relative flex h-20 items-center justify-center py-4">
//         <div className="flex items-center">
//           {themeLayout !== ThemeLayout.Mini && (
//             <m.div variants={slideInLeft}>
//               <span className="ml-2 text-xl font-bold" style={{ color: colorPrimary }}>
//                 CUPL SPA
//               </span>
//             </m.div>
//           )}
//         </div>
//         <button
//           onClick={toggleCollapsed}
//           className="absolute right-0 top-7 z-50 hidden h-6 w-6 translate-x-1/2 cursor-pointer select-none rounded-full text-center !text-gray md:block"
//           style={{ color: colorTextBase, borderColor: colorTextBase, fontSize: 16 }}
//         >
//           {collapsed ? <MenuUnfoldOutlined size={20} /> : <MenuFoldOutlined size={20} />}
//         </button>
//       </div>

//       <Scrollbar
//         style={{
//           height: 'calc(100vh -70px)',
//         }}
//       >
//         <Menu
//           mode={menuMode}
//           items={menuList}
//           className="h-full !border-none"
//           defaultOpenKeys={openKeys}
//           defaultSelectedKeys={selectedKeys}
//           selectedKeys={selectedKeys}
//           openKeys={openKeys}
//           onOpenChange={onOpenChange}
//           onClick={onClick}
//           style={{ background: colorBgElevated }}
//           inlineCollapsed={collapsed}
//           inlineIndent={50}
//         />
//       </Scrollbar>
//     </div>
//   );
// };

// export default Nav;

import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';

import Color from 'color';
import { m } from 'framer-motion';
import { CSSProperties, useEffect, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import MotionContainer from '@/components/animate/motion-container';
import { varSlide } from '@/components/animate/variants';
// import Logo from '@/components/logo';
import Scrollbar from '@/components/scrollbar';
import { useRouteToMenuFn, usePermissionRoutes, useFlattenedRoutes } from '@/router/hooks';
import { menuFilter } from '@/router/utils';
import { useSettingActions, useSettings } from '@/store/settingStore';
import { useThemeToken } from '@/theme/hooks';

import { NAV_COLLAPSED_WIDTH, NAV_WIDTH } from './config';

import { ThemeLayout } from '#/enum';
import { ItemType } from 'antd/es/menu/interface';
import { useProjectId } from '@/store/ProjectState';
import { AppRouteObject } from '#/router';

const slideInLeft = varSlide({ distance: 10 }).inLeft;

type Props = {
  closeSideBarDrawer?: () => void;
};
export default function Nav(props: Props) {
  const navigate = useNavigate();
  const matches = useMatches();
  const { pathname } = useLocation();

  const { colorPrimary, colorTextBase, colorBgElevated, colorBorder } = useThemeToken();

  const settings = useSettings();
  const { themeLayout } = settings;
  const { setSettings } = useSettingActions();
  const menuStyle: CSSProperties = {
    background: colorBgElevated,
  };

  const routeToMenuFn = useRouteToMenuFn();
  const permissionRoutes = usePermissionRoutes();
  //Get the route menu after the flattening
  const flattenedRoutes = useFlattenedRoutes();

  /**
   *state
   */
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['']);
  const [menuList, setMenuList] = useState<ItemType[]>([]);
  const [menuMode, setMenuMode] = useState<MenuProps['mode']>('inline');
  const projectId = useProjectId();

  useEffect(() => {
    if (menuList?.length > 0) {
      if (themeLayout === ThemeLayout.Vertical) {
        const openKeys = matches
          .filter((match) => match.pathname !== '/')
          .map((match) => match.pathname);
        setOpenKeys(openKeys);
      }
      setSelectedKeys([pathname]);
    }
  }, [menuList, pathname, matches, collapsed, themeLayout]);

  const filterRoutesByPath = (routes: AppRouteObject[], paths: string[]) => {
    return routes.filter((route) => {
      const routePath = route.path ?? '';
      return paths.includes(routePath);
    });
  };
  
  const filterRoutesByPathExclude = (routes: AppRouteObject[], paths: string[]) => {
    return routes.filter((route) => {
      const routePath = route.path ?? '';
      return !paths.includes(routePath);
    });
  };
  
  useEffect(() => {
    // const parentIdsForProject = [ 'ProjectDashboard','correction'];
    const excludeINBoth = [ 'default']
    const parentIdsForOther = [ 'dashboard','superadmin','Masters','management','Archive',...excludeINBoth];

    let filteredRoutes;

    if (projectId > 0) {
     
      filteredRoutes = filterRoutesByPathExclude(permissionRoutes, parentIdsForOther);
      // Output the results for debugging
    } else {
      // Filter routes based on other parent IDs
      filteredRoutes = filterRoutesByPathExclude(filterRoutesByPath(permissionRoutes, parentIdsForOther),excludeINBoth);
      // filteredRoutes = permissionRoutes;
    }
    
    // Process the filtered routes with menuFilter
    const menuRoutes = menuFilter(filteredRoutes);

    // Convert routes to menu items
    const menus = routeToMenuFn(menuRoutes);

    // Set the menu list state
    setMenuList(menus);
  }, [permissionRoutes, routeToMenuFn, projectId]);

  useEffect(() => {
    if (themeLayout === ThemeLayout.Vertical) {
      setCollapsed(false);
      setMenuMode('inline');
    }
    if (themeLayout === ThemeLayout.Mini) {
      setCollapsed(true);
      setMenuMode('inline');
    }
  }, [themeLayout]);

  /**
   *events
   */
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys);
  };
  const onClick: MenuProps['onClick'] = ({ key }) => {
    //Match the currently clicked one from the flattened routing information
    const nextLink = flattenedRoutes?.find((el) => el.key === key);

    //Handle the special case of external links in menu items

    //When clicking on the external link, the route will not be jumped, the current project will not be added with a tab, the current route will not be selected, and a new tab will be opened to open the external link.
    if (nextLink?.hideTab && nextLink?.frameSrc) {
      window.open(nextLink?.frameSrc, '_blank');
      return;
    }
    navigate(key);
    props?.closeSideBarDrawer?.();
  };

  const setThemeLayout = (themeLayout: ThemeLayout) => {
    setSettings({
      ...settings,
      themeLayout,
    });
  };

  const toggleCollapsed = () => {
    if (!collapsed) {
      setThemeLayout(ThemeLayout.Mini);
    } else {
      setThemeLayout(ThemeLayout.Vertical);
    }
    setCollapsed(!collapsed);
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{
        width: collapsed ? NAV_COLLAPSED_WIDTH : NAV_WIDTH,
        borderRight: `1px dashed ${Color(colorBorder).alpha(0.6).toString()}`,
      }}
    >
      <div className="relative flex h-20 items-center justify-center py-4">
        <MotionContainer className="flex items-center">
          {/* <Logo /> */}
          {themeLayout !== ThemeLayout.Mini && (
            <m.div variants={slideInLeft}>
              <span className="ml-2 text-xl font-bold" style={{ color: colorPrimary }}>
                CUPL SPA
              </span>
            </m.div>
          )}
        </MotionContainer>
        <button
          onClick={toggleCollapsed}
          className="absolute right-0 top-7 z-50 hidden h-6 w-6 translate-x-1/2 cursor-pointer select-none rounded-full text-center !text-gray md:block"
          style={{ color: colorTextBase, borderColor: colorTextBase, fontSize: 16 }}
        >
          {collapsed ? <MenuUnfoldOutlined size={20} /> : <MenuFoldOutlined size={20} />}
        </button>
      </div>

      <Scrollbar
        style={{
          height: 'calc(100vh -70px)',
        }}
      >
        {/*<!--Sidebar Menu --> */}

        <Menu
          mode={menuMode}
          items={menuList}
          className="h-full !border-none"
          defaultOpenKeys={openKeys}
          defaultSelectedKeys={selectedKeys}
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={onClick}
          style={menuStyle}
          inlineCollapsed={collapsed}
          inlineIndent={50}
        />
      </Scrollbar>
    </div>
  );
}
