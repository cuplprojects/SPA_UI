import React, { createContext, useContext, useEffect } from 'react';
import { notification } from 'antd'; // Import notification from Ant Design
import axios from 'axios'; // Import Axios for HTTP requests
import i18n from '@/locales/i18n';
const apiUrl = import.meta.env.VITE_API_URL;
const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language changed to:', i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChange); // Listen for language change events

    return () => {
      i18n.off('languageChanged', handleLanguageChange); // Cleanup listener on component unmount
    };
  }, []);

  const showMessage = async (module, operation, status) => {
    try {
      // Fetch message content from API based on module, operation, status, and language
      const response = await axios.get(
        `${apiUrl}/Messages/Filter?module=${module}&operation=${operation}&status=${status}`,
      );
      const { enUsTitle, enUsDescription, hiInTitle, hiInDescription } = response.data[0];

      // Determine which title and description to use based on the requested language
      const isEnglish = i18n.language == 'en_US';
      const title = isEnglish ? enUsTitle : hiInTitle;
      const description = isEnglish ? enUsDescription : hiInDescription;

      // Display message using Ant Design's notification component
      switch (status) {
        case 'success':
          notification.success({
            message: title,
            description: description,
          });
          break;
        case 'error':
          notification.error({
            message: title,
            description: description,
          });
          break;
        case 'warning':
          notification.warning({
            message: title,
            description: description,
          });
          break;
        case 'info':
          notification.info({
            message: title,
            description: description,
          });
          break;
        default:
          notification.info({
            message: title,
            description: description,
          }); // Default to info if status is unknown
      }
    } catch (error) {
      notification.error({
        message: 'Failed to fetch messages',
        description: error.message,
      });
    }
  };

  return <MessageContext.Provider value={showMessage}>{children}</MessageContext.Provider>;
};
