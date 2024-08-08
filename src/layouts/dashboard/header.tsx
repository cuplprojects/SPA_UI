//For IIS Hosting with Sync and Database Dropdown
import { Drawer, Select } from 'antd'; // Importing the Drawer and Select components from antd
import Color from 'color'; // Importing the Color library for color manipulations
import { CSSProperties, useState } from 'react'; // Importing the CSSProperties type and useState hook from React
// import axios from 'axios'; // Importing Axios for HTTP requests

import { IconButton, SvgIcon } from '@/components/icon'; // Importing IconButton, Iconify, and SvgIcon components
import LocalePicker from '@/components/locale-picker'; // Importing the LocalePicker component
import Logo from '@/components/logo'; // Importing the Logo component
import { useSettings } from '@/store/settingStore'; // Importing the useSettings hook from the settings store
import { useResponsive, useThemeToken } from '@/theme/hooks'; // Importing useResponsive and useThemeToken hooks

import AccountDropdown from '../_common/account-dropdown'; // Importing AccountDropdown component from the _common directory
import BreadCrumb from '../_common/bread-crumb'; // Importing BreadCrumb component from the _common directory
// import NoticeButton from '../_common/notice'; // Importing NoticeButton component from the _common directory
import SearchBar from '../_common/search-bar'; // Importing SearchBar component from the _common directory
import SettingButton from '../_common/setting-button'; // Importing SettingButton component from the _common directory

import { NAV_COLLAPSED_WIDTH, NAV_WIDTH, HEADER_HEIGHT, OFFSET_HEADER_HEIGHT } from './config'; // Importing layout constants from the config file
import Nav from './nav'; // Importing Nav component

import { ThemeLayout } from '#/enum'; // Importing ThemeLayout enum
import Sync from './Sync';

import { useDatabase, useDatabaseActions } from '@/store/DatabaseStore';

const { Option } = Select;

// Define the Props type for the Header component
type Props = {
  className?: string; // Optional className prop to apply custom CSS classes
  offsetTop?: boolean; // Optional offsetTop prop to determine header offset
};

// Define the Header component
export default function Header({ className = '', offsetTop = false }: Props) {
  
  const database = useDatabase();
  const {setDatabase} = useDatabaseActions();
 
  // State variable to control the drawer open/close state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract themeLayout and breadCrumb settings using the useSettings hook
  const { themeLayout, breadCrumb } = useSettings();

  // Extract theme tokens using the useThemeToken hook
  const { colorBgElevated, colorBorder } = useThemeToken();

  // Extract screen size map using the useResponsive hook
  const { screenMap } = useResponsive();

  // API URL
  // const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch project data whenever the project ID changes
 
  

  const handleDatabaseChange = (value: string) => {
    setDatabase(value);
  };

  // Define header style as a CSSProperties object
  const headerStyle: CSSProperties = {
    position: themeLayout === ThemeLayout.Horizontal ? 'relative' : 'fixed', // Position based on theme layout
    borderBottom:
      themeLayout === ThemeLayout.Horizontal
        ? `1px dashed ${Color(colorBorder).alpha(0.6).toString()}`
        : '', // Border style based on theme layout
    backgroundColor: Color(colorBgElevated).alpha(1).toString(), // Background color
  };

  // Conditional styling based on theme layout and screen size
  if (themeLayout === ThemeLayout.Horizontal) {
    headerStyle.width = '100vw'; // Full width for horizontal layout
  } else if (screenMap.md) {
    headerStyle.right = '0px'; // Right position for medium screens
    headerStyle.left = 'auto'; // Left position for medium screens
    headerStyle.width = `calc(100% - ${themeLayout === ThemeLayout.Vertical ? NAV_WIDTH : NAV_COLLAPSED_WIDTH
      }px)`; // Width based on nav width
  } else {
    headerStyle.width = '100vw'; // Full width for other screen sizes
  }

  // JSX for the Header component
  return (
    <>
      <header className={`z-20 w-full ${className}`} style={headerStyle}>
        <div
          className="flex flex-grow items-center justify-between px-4 text-gray backdrop-blur xl:px-6 2xl:px-10"
          style={{
            height: offsetTop ? OFFSET_HEADER_HEIGHT : HEADER_HEIGHT, // Header height based on offsetTop prop
            transition: 'height 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', // Transition effect
          }}
        >
          <div className="flex items-baseline">
            {themeLayout !== ThemeLayout.Horizontal ? (
              <IconButton onClick={() => setDrawerOpen(true)} className="h-10 w-10 md:hidden">
                <SvgIcon icon="ic-menu" size="24" />{' '}
                {/* Menu icon button for non-horizontal layout */}
              </IconButton>
            ) : (
              <Logo /> // Display Logo for horizontal layout
            )}
            <div className="ml-4 hidden md:block">
              {breadCrumb ? <BreadCrumb /> : null} {/* Display breadcrumb if enabled */}
            </div>
          </div>
          {/* show current project */}

          <div className="align-items-center flex">
            <Select
              value={database}  
              onChange={handleDatabaseChange}
              style={{ width: 200, marginRight: '1rem' }}
            >
              <Option key="local" value="Local">
                Local
              </Option>
              <Option key="online" value="Online">
                Online
              </Option>
            </Select>
            <Sync />
            <SearchBar /> {/* Search bar component */}
            <LocalePicker /> {/* Locale picker component */}
            {/* <NoticeButton /> Notifications button */}
            <SettingButton /> {/* Settings button */}
            <AccountDropdown /> {/* Account dropdown menu */}
          </div>
        </div>
      </header>

      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closeIcon={false}
        styles={{
          header: {
            display: 'none',
          },
          body: {
            padding: 0,
            overflow: 'hidden',
          },
        }}
        width="auto"
      >
        <Nav closeSideBarDrawer={() => setDrawerOpen(false)} /> {/* Navigation drawer */}
      </Drawer>
    </>
  );
}

// for Live Hosting without sync and database dropdown
// import { Drawer } from 'antd'; // Importing the Drawer and Select components from antd
// import Color from 'color'; // Importing the Color library for color manipulations
// import { CSSProperties, useState } from 'react'; // Importing the CSSProperties type and useState hook from React
// // import axios from 'axios'; // Importing Axios for HTTP requests

// import { IconButton, SvgIcon } from '@/components/icon'; // Importing IconButton, Iconify, and SvgIcon components
// import LocalePicker from '@/components/locale-picker'; // Importing the LocalePicker component
// import Logo from '@/components/logo'; // Importing the Logo component
// import { useSettings } from '@/store/settingStore'; // Importing the useSettings hook from the settings store
// import { useResponsive, useThemeToken } from '@/theme/hooks'; // Importing useResponsive and useThemeToken hooks

// import AccountDropdown from '../_common/account-dropdown'; // Importing AccountDropdown component from the _common directory
// import BreadCrumb from '../_common/bread-crumb'; // Importing BreadCrumb component from the _common directory
// // import NoticeButton from '../_common/notice'; // Importing NoticeButton component from the _common directory
// import SearchBar from '../_common/search-bar'; // Importing SearchBar component from the _common directory
// import SettingButton from '../_common/setting-button'; // Importing SettingButton component from the _common directory

// import { NAV_COLLAPSED_WIDTH, NAV_WIDTH, HEADER_HEIGHT, OFFSET_HEADER_HEIGHT } from './config'; // Importing layout constants from the config file
// import Nav from './nav'; // Importing Nav component

// import { ThemeLayout } from '#/enum'; // Importing ThemeLayout enum
// // import Sync from './Sync';

// // import { useDatabase, useDatabaseActions } from '@/store/DatabaseStore';

// // const { Option } = Select;

// // Define the Props type for the Header component
// type Props = {
//   className?: string; // Optional className prop to apply custom CSS classes
//   offsetTop?: boolean; // Optional offsetTop prop to determine header offset
// };

// // Define the Header component
// export default function Header({ className = '', offsetTop = false }: Props) {
  
//   // const database = useDatabase();
//   // const {setDatabase} = useDatabaseActions();
 
//   // State variable to control the drawer open/close state
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   // Extract themeLayout and breadCrumb settings using the useSettings hook
//   const { themeLayout, breadCrumb } = useSettings();

//   // Extract theme tokens using the useThemeToken hook
//   const { colorBgElevated, colorBorder } = useThemeToken();

//   // Extract screen size map using the useResponsive hook
//   const { screenMap } = useResponsive();

//   // API URL
//   // const apiUrl = import.meta.env.VITE_API_URL;

//   // Fetch project data whenever the project ID changes
 
  

//   // const handleDatabaseChange = (value: string) => {
//   //   setDatabase(value);
//   // };

//   // Define header style as a CSSProperties object
//   const headerStyle: CSSProperties = {
//     position: themeLayout === ThemeLayout.Horizontal ? 'relative' : 'fixed', // Position based on theme layout
//     borderBottom:
//       themeLayout === ThemeLayout.Horizontal
//         ? `1px dashed ${Color(colorBorder).alpha(0.6).toString()}`
//         : '', // Border style based on theme layout
//     backgroundColor: Color(colorBgElevated).alpha(1).toString(), // Background color
//   };

//   // Conditional styling based on theme layout and screen size
//   if (themeLayout === ThemeLayout.Horizontal) {
//     headerStyle.width = '100vw'; // Full width for horizontal layout
//   } else if (screenMap.md) {
//     headerStyle.right = '0px'; // Right position for medium screens
//     headerStyle.left = 'auto'; // Left position for medium screens
//     headerStyle.width = `calc(100% - ${themeLayout === ThemeLayout.Vertical ? NAV_WIDTH : NAV_COLLAPSED_WIDTH
//       }px)`; // Width based on nav width
//   } else {
//     headerStyle.width = '100vw'; // Full width for other screen sizes
//   }

//   // JSX for the Header component
//   return (
//     <>
//       <header className={`z-20 w-full ${className}`} style={headerStyle}>
//         <div
//           className="flex flex-grow items-center justify-between px-4 text-gray backdrop-blur xl:px-6 2xl:px-10"
//           style={{
//             height: offsetTop ? OFFSET_HEADER_HEIGHT : HEADER_HEIGHT, // Header height based on offsetTop prop
//             transition: 'height 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', // Transition effect
//           }}
//         >
//           <div className="flex items-baseline">
//             {themeLayout !== ThemeLayout.Horizontal ? (
//               <IconButton onClick={() => setDrawerOpen(true)} className="h-10 w-10 md:hidden">
//                 <SvgIcon icon="ic-menu" size="24" />{' '}
//                 {/* Menu icon button for non-horizontal layout */}
//               </IconButton>
//             ) : (
//               <Logo /> // Display Logo for horizontal layout
//             )}
//             <div className="ml-4 hidden md:block">
//               {breadCrumb ? <BreadCrumb /> : null} {/* Display breadcrumb if enabled */}
//             </div>
//           </div>
//           {/* show current project */}

//           <div className="align-items-center flex">
//             {/* <Select
//               value={database}  
//               onChange={handleDatabaseChange}
//               style={{ width: 200, marginRight: '1rem' }}
//             >
//               <Option key="local" value="Local">
//                 Local
//               </Option>
//               <Option key="online" value="Online">
//                 Online
//               </Option>
//             </Select>
//             <Sync /> */}
//             <SearchBar /> {/* Search bar component */}
//             <LocalePicker /> {/* Locale picker component */}
//             {/* <NoticeButton /> Notifications button */}
//             <SettingButton /> {/* Settings button */}
//             <AccountDropdown /> {/* Account dropdown menu */}
//           </div>
//         </div>
//       </header>

//       <Drawer
//         placement="left"
//         onClose={() => setDrawerOpen(false)}
//         open={drawerOpen}
//         closeIcon={false}
//         styles={{
//           header: {
//             display: 'none',
//           },
//           body: {
//             padding: 0,
//             overflow: 'hidden',
//           },
//         }}
//         width="auto"
//       >
//         <Nav closeSideBarDrawer={() => setDrawerOpen(false)} /> {/* Navigation drawer */}
//       </Drawer>
//     </>
//   );
// }

