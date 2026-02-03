import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import Colors from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  loading = false,
  variant = 'primary',
  containerStyle,
  textStyle,
  disabled,
  ...props
}: ButtonProps) {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[
        styles.button,
        variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
        disabled && styles.disabledButton,
        containerStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? theme.primary : '#fff'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' ? styles.secondaryText : styles.primaryText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
      paddingVertical: 12,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    secondaryButton: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    disabledButton: {
      opacity: 0.5,
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    primaryText: {
      color: 'white',
    },
    secondaryText: {
      color: theme.text,
    },
  });
