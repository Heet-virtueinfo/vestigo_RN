import React, { useState, useEffect } from 'react';
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
import {
  createOpportunity,
  updateOpportunity,
  getLeads,
} from '../../services/service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomDropdown from '../../components/CustomDropdown';
import { Toast } from '../../components/GlobalToast';

const STAGES = [
  { label: 'Discovery', value: 'DISCOVERY' },
  { label: 'Quote Sent', value: 'QUOTE' },
  { label: 'Negotiation', value: 'NEGOTIATION' },
  { label: 'Closed Won', value: 'CLOSED_WON' },
  { label: 'Closed Lost', value: 'CLOSED_LOST' },
];

export default function EditOpportunityScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { opportunity } = route.params || {};
  const isEdit = !!opportunity;

  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    stage: 'DISCOVERY',
    expected_revenue: '',
    probability: '25',
    notes: '',
    lead: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name || '',
        stage: opportunity.stage || 'DISCOVERY',
        expected_revenue: opportunity.expected_revenue?.toString() || '',
        probability: opportunity.probability?.toString() || '25',
        notes: opportunity.notes || '',
        lead: opportunity.lead?.toString() || '',
      });
    }
  }, [opportunity]);

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      const formattedLeads = data.map((l: any) => ({
        label: `${l.first_name} ${l.last_name} (${l.company_name || 'No Co.'})`,
        value: l.id.toString(),
      }));
      setLeads(formattedLeads);
    } catch (error) {
      console.error('Failed to fetch leads', error);
      Toast.error('Failed to load leads');
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Toast.warn('Please enter an Opportunity Name.');
      return;
    }

    if (!isEdit && !formData.lead) {
      Toast.warn('Please select a Lead.');
      return;
    }

    if (!formData.expected_revenue) {
      Toast.warn('Please enter Expected Premium.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      lead: formData.lead ? parseInt(formData.lead, 10) : null,
      expected_revenue: formData.expected_revenue
        ? parseFloat(formData.expected_revenue)
        : 0,
      probability: formData.probability
        ? parseInt(formData.probability, 10)
        : 0,
    };

    try {
      if (isEdit) {
        await updateOpportunity(opportunity.id, payload);
        Toast.success('Opportunity updated successfully');
      } else {
        await createOpportunity(payload);
        Toast.success('Opportunity created successfully');
      }
      navigation.navigate('OpportunitiesList', { refresh: true });
    } catch (error: any) {
      console.error('Error saving opportunity :: ', error?.response?.data);
      if (error?.response?.data?.lead) {
        Toast.error('Lead is required.');
      } else {
        Toast.error('Failed to save opportunity');
      }
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
          {/* Header */}
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
              <Text style={styles.headerTitle}>
                {isEdit ? 'Edit Opportunity' : 'New Opportunity'}
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <CustomDropdown
                label="Lead *"
                data={leads}
                value={formData.lead}
                onSelect={value => handleChange('lead', value)}
                icon="person-outline"
                placeholder="Select a Lead"
              />

              {renderInput(
                'Opportunity Name *',
                'name',
                'e.g. $50k Policy - John Smith',
                'briefcase-outline',
              )}

              <View style={styles.row}>
                <View style={styles.col}>
                  {renderInput(
                    'Premium ($) *',
                    'expected_revenue',
                    '0',
                    'cash-outline',
                    'numeric',
                  )}
                </View>
                <View style={styles.spacer} />
                <View style={styles.col}>
                  {renderInput(
                    'Probability (%)',
                    'probability',
                    '25',
                    'analytics-outline',
                    'numeric',
                  )}
                </View>
              </View>

              <CustomDropdown
                label="Stage"
                data={STAGES}
                value={formData.stage}
                onSelect={value => handleChange('stage', value)}
                icon="layers-outline"
                placeholder="Select Stage"
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
                  <Text style={styles.submitBtnText}>
                    {isEdit ? 'Update Opportunity' : 'Create Opportunity'}
                  </Text>
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
      zIndex: 1,
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
    },
    formCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
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
