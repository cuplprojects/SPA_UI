import { App as AntdApp } from 'antd';
import { Helmet } from 'react-helmet-async';
import Logo from '@/assets/images/cupllogo.png';
import Router from '@/router/index';
import AntdConfig from '@/theme/antd';
// import '@/assets/iconcss/fs-all.min.css'
import 'boxicons/css/boxicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { MotionLazy } from './components/animate/motion-lazy';
// import { FileUploadProvider } from './pages/Imports/Importfile';
import { PreferredResponseProvider } from './utils/PreferredResponse/PreferredResponseContext';
import useIdleTimer from './CustomHooks/useIdleTimer';
import { useLoginStateContext } from './pages/sys/login/providers/LoginStateProvider';
import { useUserActions } from './store/UserDataStore';


function App() {
  const { backToLogin } = useLoginStateContext();
  const { clearUserInfoAndToken } = useUserActions();
  const handleLogout = () => {
    // Replace with your actual logout logic
   
    console.log('User is idle. Logging out...');
    // Example: clear user session, redirect to login page, etc.
    clearUserInfoAndToken();
    backToLogin();
  };

  // Set timeout to 15 minutes (900000 milliseconds)
  useIdleTimer(1200000, handleLogout);

  
  return (
    <PreferredResponseProvider>
      <AntdConfig>
        <AntdApp>
          <MotionLazy>
            
              <Helmet>
                <title>SPA Dashboard</title>
                <link rel="icon" href={Logo} />
              </Helmet>
         
            <Router />
          </MotionLazy>
        </AntdApp>
      </AntdConfig>
      </PreferredResponseProvider>
  );
}

export default App;
