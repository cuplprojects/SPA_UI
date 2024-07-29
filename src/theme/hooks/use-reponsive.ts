import { Grid, theme } from 'antd';
import { Breakpoint, ScreenMap, ScreenSizeMap } from 'antd/es/_util/responsiveObserver';

const { useBreakpoint } = Grid;

export function useResponsive() {
  const {
    token: { screenXS, screenSM, screenMD, screenLG, screenXL, screenXXL },
  } = theme.useToken();
  const screenArray: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  const screenEnum: ScreenSizeMap = {
    xs: screenXS,
    sm: screenSM,
    md: screenMD,
    lg: screenLG,
    xl: screenXL,
    xxl: screenXXL,
  };
  const screenMap: ScreenMap = useBreakpoint();

 //Use [...screenArray].reverse().find() instead of findLast method to avoid compatibility issues
  //[...screenArray] creates a copy of screenArray so that the reverse method does not change the order of the original array
  const currentScrren = [...screenArray].reverse().find((item) => {
    const result = screenMap[item];
    return result === true;
  });
  return {
    screenEnum,
    screenMap,
    currentScrren,
  };
}
