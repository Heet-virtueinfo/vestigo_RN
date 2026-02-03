import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/theme';
import { createLead } from '../../services/service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CustomDropdown from '../../components/CustomDropdown';
import { Toast } from '../../components/GlobalToast';

export default function AddLeadScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    status: 'NEW',
    source: 'Website',
    notes: '',
  });

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      Toast.warn('Please fill in First Name, Last Name, and Email.');
      return;
    }

    if (!formData.source) {
      Toast.warn('Please select a Source.');
      return;
    }

    setLoading(true);
    try {
      // Clean payload to match web implementation (exclude notes if not supported)
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        source: formData.source,
        status: formData.status,
      };

      await createLead(payload);
      Toast.success('Lead created successfully');
      navigation.navigate('LeadList', { refresh: true });
    } catch (error: any) {
      console.error('Error creating lead :: ', error);
      const msg = error?.response?.data?.detail || 'Failed to create lead';
      Toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    key: string,
    placeholder: string,
    icon: string,
    keyboardType: any = 'default',
    multiline = false,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && styles.textAreaWrapper]}>
        <Ionicons
          name={icon}
          size={20}
          color={theme.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          value={(formData as any)[key]}
          onChangeText={t => handleChange(key, t)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          autoCapitalize={key === 'email' ? 'none' : 'sentences'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Premium Header with Back Button */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Add Lead</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <View style={styles.row}>
                <View style={styles.col}>
                  {renderInput(
                    'First Name *',
                    'first_name',
                    'John',
                    'person-outline',
                  )}
                </View>
                <View style={styles.spacer} />
                <View style={styles.col}>
                  {renderInput(
                    'Last Name *',
                    'last_name',
                    'Doe',
                    'person-outline',
                  )}
                </View>
              </View>

              {renderInput(
                'Email *',
                'email',
                'john@example.com',
                'mail-outline',
                'email-address',
              )}
              {renderInput(
                'Phone',
                'phone',
                '+1 234 567 8900',
                'call-outline',
                'phone-pad',
              )}
              {renderInput(
                'Company',
                'company_name',
                'Acme Corp',
                'business-outline',
              )}

              <CustomDropdown
                label="Source"
                data={[
                  { label: 'Website', value: 'Website' },
                  { label: 'Referral', value: 'Referral' },
                  { label: 'LinkedIn', value: 'LinkedIn' },
                  { label: 'Cold Call', value: 'Cold Call' },
                  { label: 'Other', value: 'Other' },
                ]}
                value={formData.source}
                onSelect={value => handleChange('source', value)}
                icon="link-outline"
                placeholder="Select Source"
              />

              {renderInput(
                'Notes',
                'notes',
                'Additional details...',
                'document-text-outline',
                'default',
                true,
              )}

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Lead</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    header: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      // Subtle shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
    },
    headerLeft: {
      flex: 1,
      alignItems: 'flex-start',
    },
    headerCenter: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: 0.5,
    },
    formCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
    },
    textAreaWrapper: {
      height: 120,
      alignItems: 'flex-start',
      paddingVertical: 12,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      height: '100%',
    },
    textArea: {
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
    },
    col: {
      flex: 1,
    },
    spacer: {
      width: 12,
    },
    submitBtn: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitBtnText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: 'bold',
    },
  });
