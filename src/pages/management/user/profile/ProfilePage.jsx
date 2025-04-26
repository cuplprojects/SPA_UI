import { CSSProperties, useState, useRef} from 'react';

import CoverImage from '@/assets/images/cover/cover_4.jpg';
import Card from '@/components/card';
import { Iconify } from '@/components/icon';
import { useUserInfo, useUserToken } from '@/store/UserDataStore';
import { useThemeToken } from '@/theme/hooks';

import ProfileTab from './profile-tab';
import SecurityTab from './security-tab';
import useUserData from '@/CustomHooks/useUserData';

const apiUrl = import.meta.env.VITE_API_URL;
const baseUrl = import.meta.env.VITE_BASEAPI_URL;
const UserProfile = () => {
  const { userData, loading, error } = useUserData(); // Use the custom hook
  const { avatar, username } = useUserInfo();
  const { colorTextBase } = useThemeToken();
  const [currentTabIndex, setcurrentTabIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const token = useUserToken();
  console.log(userData)
  const bgStyle = {
    background: `linear-gradient(rgba(0, 75, 80, 0.8), rgba(0, 75, 80, 0.8)) center center / cover no-repeat, url(${CoverImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  };

  const tabs = [
    {
      icon: <Iconify icon="solar:user-id-bold" size={24} className="mr-2" />,
      title: 'Profile',
      content: <ProfileTab />,
    },
    {
      icon: <Iconify icon="carbon:security" size={20} className="mr-2" />,
      title: 'Security',
      content: <SecurityTab />,
    },
  ];


  const isValidImageFormat = (imagePath) => {
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const extension = imagePath.split('.').pop().toLowerCase();
    return validExtensions.includes(extension);
  };
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${apiUrl}/Users/upload/${userData.userId}`, {
          method: 'POST',
          body: formData,
          headers:{
            Authorization : `Bearer ${token}`
          }},);

        if (response.ok) {
          console.log('File uploaded successfully');
          // Handle success (e.g., update UI, show notification)
        } else {
          console.error('File upload failed');
          // Handle error (e.g., show error message)
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        // Handle network or other errors
      }
    }
  };


  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <Card className="relative mb-6 h-[290px] flex-col rounded-2xl !p-0">
        <div style={bgStyle} className="h-full w-full">
          <div className="flex flex-col items-center justify-center pt-12 md:absolute md:bottom-6 md:left-6 md:flex-row md:pt-0">
             <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <img
               src={imagePreview || (userData?.profilePicturePath ? `${baseUrl}/${userData.profilePicturePath}` : 'https://placehold.co/400x400')}
              className="h-16 w-16 rounded-full md:h-32 md:w-32 cursor-pointer"
              alt="Profile"
              onClick={handleProfileClick}
            />
            <div
              className="ml-6 mt-6 flex flex-col justify-center md:mt-0"
              style={{ color: '#fff' }}
            >
              <span className="mb-2 text-2xl font-medium">
                {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
              </span>
              <span className="text-center opacity-50 md:text-left">{ userData ? 'Admin' : 'Loading...'}</span>
            </div>
          </div>
        </div>
        <div className="z-10 min-h-[48px] w-full">
          <div className="mx-6 flex h-full justify-center md:justify-end">
            {tabs.map((tab, index) => (
              <button
                onClick={() => setcurrentTabIndex(index)}
                key={tab.title}
                type="button"
                style={{
                  marginRight: index >= tabs.length - 1 ? '0px' : '40px',
                  opacity: index === currentTabIndex ? 1 : 0.5,
                  borderBottom: index === currentTabIndex ? `2px solid ${colorTextBase}` : '',
                }}
              >
                {tab.icon}
                {tab.title}
              </button>
            ))}
          </div>
        </div>
      </Card>
      <div>{tabs[currentTabIndex].content}</div>
    </>
  );
};

export default UserProfile;
