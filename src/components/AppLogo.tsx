import React from 'react';
import Svg, { Rect, Path, SvgProps } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface AppLogoProps extends SvgProps {
  size?: number;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 64, ...props }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" {...props}>
      <Rect width="64" height="64" rx="20" fill={Colors.light.primary} />
      <Path
        d="M32 13C24 13 14 17 14 21V31C14 43 24 50 32 53C40 50 50 43 50 31V21C50 17 40 13 32 13Z"
        fill="white"
      />
      <Path
        d="M29 38L23 32L25.1 29.9L29 33.8L38.9 23.9L41 26L29 38Z"
        fill={Colors.light.primary}
      />
    </Svg>
  );
};

export default AppLogo;
