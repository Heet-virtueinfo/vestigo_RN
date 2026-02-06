import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/theme';
import { Toast } from '../../components/GlobalToast';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { register } from '../../services/service';

export default function Register() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.first_name ||
      !formData.last_name
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields.',
      });
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Registration successful! Please login.',
      });
      navigation.navigate('Login');
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Registration failed.';
      if (error.response?.data) {
        const errorData = error.response.data;
        // Simple formatting
        errorMessage = Object.keys(errorData)
          .map(key => `${key}: ${errorData[key]}`)
          .join('\n');
      }
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={dynamicStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={dynamicStyles.container}
          >
            <View style={dynamicStyles.formContainer}>
              <View style={dynamicStyles.headerContainer}>
                <View style={dynamicStyles.logoPlaceholder}>
                  <Ionicons name="shield-checkmark" size={28} color="white" />
                </View>
                <Text style={dynamicStyles.headerText}>Create Account</Text>
                <Text style={dynamicStyles.subHeaderText}>
                  Join Vestigo today
                </Text>
              </View>

              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="First Name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChangeText={text => handleChange('first_name', text)}
                      icon="person-outline"
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Last Name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChangeText={text => handleChange('last_name', text)}
                      icon="person-outline"
                    />
                  </View>
                </View>

                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChangeText={text => handleChange('username', text)}
                  autoCapitalize="none"
                  icon="at-outline"
                />
                <Input
                  label="Email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChangeText={text => handleChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                />
                <Input
                  label="Phone (Optional)"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChangeText={text =>
                    handleChange('phone', text.replace(/[^0-9+\s-]/g, ''))
                  }
                  keyboardType="phone-pad"
                  icon="call-outline"
                />
                <Input
                  label="Password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChangeText={text => handleChange('password', text)}
                  secureTextEntry={!showPassword}
                  icon="lock-closed-outline"
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />

                <View style={dynamicStyles.buttonContainer}>
                  <Button
                    title="Register"
                    onPress={handleRegister}
                    loading={loading}
                  />
                </View>
              </View>

              <View style={dynamicStyles.footerContainer}>
                <Text style={dynamicStyles.footerText}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={dynamicStyles.linkText}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 35,
      alignItems: 'center',
    },
    formContainer: {
      width: '100%',
      maxWidth: 384,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoPlaceholder: {
      height: 56,
      width: 56,
      backgroundColor: theme.primary,
      borderRadius: 18,
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
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    subHeaderText: {
      fontSize: 16,
      color: theme.textMuted,
      marginTop: 4,
    },
    inputGroup: {
      gap: 16,
    },
    row: {
      flexDirection: 'row',
    },
    buttonContainer: {
      marginTop: 24,
    },
    footerContainer: {
      marginTop: 25,
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
