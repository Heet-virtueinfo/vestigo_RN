import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/theme';
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
    // Basic validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.first_name ||
      !formData.last_name
    ) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
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
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
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
                    value={formData.first_name}
                    onChangeText={text => handleChange('first_name', text)}
                    icon="person-outline"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Input
                    label="Last Name"
                    value={formData.last_name}
                    onChangeText={text => handleChange('last_name', text)}
                    icon="person-outline"
                  />
                </View>
              </View>

              <Input
                label="Username"
                value={formData.username}
                onChangeText={text => handleChange('username', text)}
                autoCapitalize="none"
                icon="at-outline"
              />
              <Input
                label="Email"
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
              />
              <Input
                label="Phone (Optional)"
                value={formData.phone}
                onChangeText={text => handleChange('phone', text)}
                keyboardType="phone-pad"
                icon="call-outline"
              />
              <Input
                label="Password"
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

            <Text style={dynamicStyles.footerText}>
              Already have an account?{' '}
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={dynamicStyles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
      paddingVertical: 48,
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
