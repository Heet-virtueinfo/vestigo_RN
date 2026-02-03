import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { login } from '../../services/service';

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
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoggingIn(true);
    try {
      const response = await login(username, password);
      if (response && response.access) {
        await signIn(response.access, response.refresh);
      } else {
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An unexpected error occurred.');
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
          <View style={dynamicStyles.logoPlaceholder}>
            <Ionicons name="shield-checkmark" size={32} color="white" />
          </View>
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
          <Text style={dynamicStyles.footerText}>
            Not a member?{' '}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={dynamicStyles.linkText}>Register here</Text>
            </TouchableOpacity>
          </Text>
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
    logoPlaceholder: {
      height: 64,
      width: 64,
      backgroundColor: theme.primary,
      borderRadius: 20, // Squircle
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    headerText: {
      textAlign: 'center',
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 8,
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
    footerText: {
      marginTop: 32,
      textAlign: 'center',
      fontSize: 14,
      color: theme.textMuted,
    },
    linkText: {
      fontWeight: '600',
      color: theme.primary,
    },
  });
