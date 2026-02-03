import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export default function Input({
  label,
  error,
  containerStyle,
  icon,
  rightIcon,
  onRightIconPress,
  ...props
}: InputProps) {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.inputBorder}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            icon && { paddingLeft: 40 },
            rightIcon && { paddingRight: 40 },
          ]}
          placeholderTextColor={theme.textMuted}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={theme.inputBorder} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      marginBottom: 0,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: theme.text,
      marginBottom: 8,
    },
    inputWrapper: {
      position: 'relative',
      justifyContent: 'center',
    },
    input: {
      width: '100%',
      borderRadius: 12, // More rounded
      borderWidth: 1,
      borderColor: theme.inputBorder,
      paddingVertical: 14, // Taller touch target
      paddingHorizontal: 16,
      color: theme.text,
      backgroundColor: theme.inputBackground,
      fontSize: 15, // Slightly larger font
    },
    leftIcon: {
      position: 'absolute',
      left: 12,
      zIndex: 1,
    },
    rightIcon: {
      position: 'absolute',
      right: 12,
      zIndex: 1,
    },
    inputError: {
      borderColor: theme.error,
    },
    errorText: {
      marginTop: 4,
      fontSize: 12,
      color: theme.error,
    },
  });
