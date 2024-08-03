// react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// react
import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
// react helmet
import { HelmetProvider } from 'react-helmet-async';
// eslint-disable-next-line import/no-unresolved
import 'virtual:svg-icons-register';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from '@/App';

import { worker } from './_mock';
// I18n
import './locales/i18n';
// tailwind css
import './theme/index.css';
// import { FileUploadProvider } from './pages/Imports/Importfile';
import { MessageProvider } from './utils/alerts/MessageContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Number of failed retries
      cacheTime: 300_000, // Cache validity period 5m
      staleTime: 10_1000, // Time for data to become "stale" 10s.
      refetchOnWindowFocus: false, // Disable re-acquisition of data when window is focused
      refetchOnReconnect: false, // Disable data retrieval on reconnection
      refetchOnMount: false, // Disable re-obtaining data when components are mounted
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <MessageProvider>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={true} /> React dev tool */}
        <Suspense>
          <Analytics />
         
            <App />
          
        </Suspense>
      </QueryClientProvider>
    </HelmetProvider>
  </MessageProvider>,
);

//start service worker mock in development mode
worker.start({ onUnhandledRequest: 'bypass' });
