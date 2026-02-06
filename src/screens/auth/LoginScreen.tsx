import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { login } from '../../services/service';
import AppLogo from '../../components/AppLogo';
import { Toast } from '../../components/GlobalToast';

export default function Login() {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<any>();

  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter both username and password.',
      });
      return;
    }

    setLoggingIn(true);
    try {
      const response = await login(username, password);
      if (response && response.access) {
        await signIn(response.access, response.refresh);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid credentials. Please try again.',
        });
      }
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred.',
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.container}>
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={dynamicStyles.formContainer}
      >
        <View style={dynamicStyles.headerContainer}>
          <AppLogo size={80} />
          <Text style={dynamicStyles.headerText}>Welcome Back!</Text>
          <Text style={dynamicStyles.subHeaderText}>
            Sign in to your account
          </Text>
        </View>

        <View style={dynamicStyles.inputGroup}>
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            icon="person-outline"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <View style={dynamicStyles.buttonContainer}>
            <Button title="Sign in" onPress={handleLogin} loading={loggingIn} />
          </View>
        </View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <View style={dynamicStyles.footerContainer}>
            <Text style={dynamicStyles.footerText}>Not a member?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={dynamicStyles.linkText}>Register here</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
      paddingHorizontal: 24,
      paddingVertical: 48,
    },
    formContainer: {
      width: '100%',
      maxWidth: 384,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    // logoPlaceholder removed
    headerText: {
      textAlign: 'center',
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 24,
    },
    subHeaderText: {
      fontSize: 16,
      color: theme.textMuted,
      marginTop: 4,
    },
    inputGroup: {
      gap: 20,
    },
    buttonContainer: {
      marginTop: 12,
    },
    footerContainer: {
      marginTop: 32,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.textMuted,
    },
    linkText: {
      fontWeight: '600',
      color: theme.primary,
      marginLeft: 4,
    },
  });
