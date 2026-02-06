import React from 'react';
import ToastManager, { BaseToast } from 'toastify-react-native';
import { Colors } from '../constants/theme';

const GlobalToast = () => {
  const theme = Colors.light;

  const commonStyle = {
    backgroundColor: theme.card,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 6,
  };

  const textStyle = {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500' as const,
  };

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ ...commonStyle, borderLeftColor: theme.success }}
        iconColor={theme.success}
        progressBarColor={theme.success}
        textColor={theme.text}
        text1Style={textStyle}
        text2Style={textStyle}
      />
    ),
    error: (props: any) => (
      <BaseToast
        {...props}
        style={{ ...commonStyle, borderLeftColor: theme.error }}
        iconColor={theme.error}
        progressBarColor={theme.error}
        textColor={theme.text}
        text1Style={textStyle}
        text2Style={textStyle}
        icon="alert-circle"
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{ ...commonStyle, borderLeftColor: theme.info }}
        iconColor={theme.info}
        progressBarColor={theme.info}
        textColor={theme.text}
        text1Style={textStyle}
        text2Style={textStyle}
        icon="information-circle"
      />
    ),
    warn: (props: any) => (
      <BaseToast
        {...props}
        style={{ ...commonStyle, borderLeftColor: theme.warning }}
        iconColor={theme.warning}
        progressBarColor={theme.warning}
        textColor={theme.text}
        text1Style={textStyle}
        text2Style={textStyle}
        icon="warning"
      />
    ),
  };

  return (
    <ToastManager
      width={350}
      height={60}
      config={toastConfig}
      duration={3000}
      position="top"
      positionValue={50}
      showCloseIcon={false}
      useModal={false}
    />
  );
};

export { Toast } from 'toastify-react-native';
export default GlobalToast;
