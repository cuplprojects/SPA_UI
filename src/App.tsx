import { App as AntdApp } from 'antd';
import { Helmet } from 'react-helmet-async';

import Logo from '@/assets/images/cupllogo.png';
import Router from '@/router/index';
import AntdConfig from '@/theme/antd';
// import '@/assets/iconcss/fs-all.min.css'
import 'boxicons/css/boxicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { MotionLazy } from './components/animate/motion-lazy';
// import { FileUploadProvider } from './pages/Imports/Importfile';
import { PreferredResponseProvider } from './utils/PreferredResponse/PreferredResponseContext';

function App() {
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
