import React from 'react'; // Importing the React library
import { useThemeToken } from '@/theme/hooks'; // Importing the useThemeToken hook from the theme module

import HeaderSimple from '../_common/header-simple'; // Importing the HeaderSimple component from the _common directory

// Defining the Props type for the SimpleLayout component
type Props = {
  children: React.ReactNode; // The children prop is a React node
};

// Defining the default SimpleLayout component
export default function SimpleLayout({ children }: Props) {
  // Using the useThemeToken hook to get the colorBgElevated and colorTextBase theme tokens
  const { colorBgElevated, colorTextBase } = useThemeToken();

  // Returning the JSX for the SimpleLayout component
  return (
    // A div element with a flexbox layout that takes up the full height and width of the screen
    <div
      className="flex h-screen w-full flex-col"
      // Styling the div element with the colorBgElevated background color and colorTextBase text color
      style={{
        color: colorTextBase,
        background: colorBgElevated,
      }}
    >
      {/* // Rendering the HeaderSimple component */}
      <HeaderSimple />
     
      {/* // Rendering the children prop */}
      {children}
    </div>
  );
}