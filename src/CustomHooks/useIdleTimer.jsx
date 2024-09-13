// import { useEffect, useState } from 'react';


// const useIdleTimer = (timeout, onIdle) => {
//   useEffect(() => {
//     let timer;
//     const resetTimer = () => {
//       if (timer) {
//         clearTimeout(timer);
//       }
//       timer = setTimeout(onIdle, timeout);
//     };

//     const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
//     events.forEach(event => window.addEventListener(event, resetTimer));

//     resetTimer();

//     return () => {
//       clearTimeout(timer);
//       events.forEach(event => window.removeEventListener(event, resetTimer));
//     };
//   }, [timeout, onIdle]);
// };

// export default useIdleTimer;


import { useEffect } from 'react';
import { notification } from 'antd';

const useIdleTimer = (timeout, onIdle, warningTime = 15000) => { // 15 seconds warning
  useEffect(() => {
    let timer;
    let warningTimer;

    const showWarning = () => {
      notification.warning({
        message: 'Inactive Warning',
        description: `You will be logged out in ${warningTime / 1000} seconds due to inactivity.`,
        duration: warningTime / 1000, // duration matches the countdown
      });
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      if (warningTimer) clearTimeout(warningTimer);

      timer = setTimeout(() => {
        showWarning(); // Show warning 15 seconds before logging out
        warningTimer = setTimeout(onIdle, warningTime); // Log out after warningTime
      }, timeout - warningTime);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timer);
      clearTimeout(warningTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, onIdle, warningTime]);
};

export default useIdleTimer;
