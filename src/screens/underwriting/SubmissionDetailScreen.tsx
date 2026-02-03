import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/theme';
import {
  getSubmissionDetail,
  approveSubmission,
  rejectSubmission,
  requestInfoSubmission,
} from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';
import { useColorScheme } from 'react-native';

export default function SubmissionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Action Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'request-info' | null
  >(null);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await getSubmissionDetail(id);
      setSubmission(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return theme.success;
      case 'REJECTED':
        return theme.danger;
      case 'MORE_INFO_REQUIRED':
        return theme.warning;
      default:
        return theme.textMuted;
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return theme.success;
    if (score < 60) return theme.warning;
    return theme.danger;
  };

  const handleActionPress = (type: 'approve' | 'reject' | 'request-info') => {
    setActionType(type);
    setActionNotes('');
    setModalVisible(true);
  };

  const submitAction = async () => {
    if (!submission) return;

    // For Request Info, notes are mandatory
    if (actionType === 'request-info' && !actionNotes.trim()) {
      Toast.warn('Please provide notes or a question.');
      return;
    }

    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await approveSubmission(submission.id, actionNotes);
        Toast.success('Submission Approved');
      } else if (actionType === 'reject') {
        await rejectSubmission(submission.id, actionNotes);
        Toast.success('Submission Rejected');
      } else if (actionType === 'request-info') {
        await requestInfoSubmission(submission.id, actionNotes);
        Toast.success('Additional Info Requested');
      }
      setModalVisible(false);
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Action failed';
      Toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={theme.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const InfoRow = ({ label, value, color }: any) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
    </View>
  );

  if (loading) return <LoadingScreen />;

  if (!submission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.text }}>Submission not found</Text>
      </View>
    );
  }

  const opp = submission.opportunity_details || {};
  const riskScore = submission.risk_score || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Submission</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.subId}>
                SUB-{String(id).padStart(3, '0')}
              </Text>
              <Text style={styles.date}>
                {new Date(submission.created_date).toDateString()}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: getStatusColor(submission.status) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: getStatusColor(submission.status) },
                ]}
              >
                {submission.status.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.card}>
          {renderSectionHeader('Risk Assessment', 'shield-checkmark-outline')}

          <View style={styles.riskContainer}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskScoreLabel}>Risk Score</Text>
              <Text
                style={[
                  styles.riskScoreValue,
                  { color: getRiskColor(riskScore) },
                ]}
              >
                {riskScore}/100
              </Text>
            </View>

            {/* Risk Bar */}
            <View style={styles.riskBarBg}>
              <View
                style={[
                  styles.riskBarFill,
                  {
                    width: `${Math.min(riskScore, 100)}%`,
                    backgroundColor: getRiskColor(riskScore),
                  },
                ]}
              />
            </View>

            <View style={styles.riskLegend}>
              <Text style={styles.riskLegendText}>Low Risk (&lt;30)</Text>
              <Text style={styles.riskLegendText}>High Risk (&gt;60)</Text>
            </View>

            <View style={styles.recommendationBox}>
              <Text style={styles.recLabel}>Recommendation:</Text>
              <Text style={styles.recText}>
                {submission.risk_recommendation ||
                  'No recommendation available.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Opportunity Details */}
        <View style={styles.card}>
          {renderSectionHeader('Opportunity Details', 'briefcase-outline')}
          <InfoRow label="Opportunity" value={opp.name} />
          <InfoRow label="Stage" value={opp.stage} />
          <InfoRow
            label="Premium"
            value={`$${Number(
              submission.submitted_premium || opp.expected_revenue,
            ).toLocaleString()}`}
            color={theme.success}
          />
          <InfoRow label="Probability" value={`${opp.probability}%`} />
          <InfoRow
            label="Close Date"
            value={new Date(opp.close_date).toLocaleDateString()}
          />
        </View>

        {/* Customer Details */}
        <View style={styles.card}>
          {renderSectionHeader('Customer Details', 'person-outline')}
          <InfoRow label="Customer Name" value={submission.customer_name} />
          {opp.lead_company && (
            <InfoRow label="Company" value={opp.lead_company} />
          )}
          {opp.lead_email && <InfoRow label="Email" value={opp.lead_email} />}
          {opp.lead_phone && <InfoRow label="Phone" value={opp.lead_phone} />}

          <View style={styles.divider} />
          <InfoRow
            label="Assigned Underwriter"
            value={submission.underwriter_name || 'Unassigned'}
            color={theme.textMuted}
          />
          <InfoRow
            label="Submission Date"
            value={new Date(submission.created_date).toLocaleDateString()}
          />
        </View>

        {/* Notes */}
        <View style={styles.card}>
          {renderSectionHeader('Submission Notes', 'document-text-outline')}
          <Text style={styles.notesText}>
            {submission.notes || 'No notes provided.'}
          </Text>
        </View>

        {/* Action Buttons (Only for Pending) */}
        {submission.status === 'PENDING' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.danger + '15' },
              ]}
              onPress={() => handleActionPress('reject')}
            >
              <Ionicons name="close-circle" size={20} color={theme.danger} />
              <Text style={[styles.actionBtnText, { color: theme.danger }]}>
                Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.warning + '15' },
              ]}
              onPress={() => handleActionPress('request-info')}
            >
              <Ionicons name="help-circle" size={20} color={theme.warning} />
              <Text style={[styles.actionBtnText, { color: theme.warning }]}>
                Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.success }]}
              onPress={() => handleActionPress('approve')}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={[styles.actionBtnText, { color: 'white' }]}>
                Approve
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' && 'Approve & Issue Policy'}
              {actionType === 'reject' && 'Reject Submission'}
              {actionType === 'request-info' && 'Request More Info'}
            </Text>

            <Text style={styles.modalSubtitle}>
              {actionType === 'approve' &&
                'Are you sure you want to approve this submission?'}
              {actionType === 'reject' &&
                'Are you sure you want to reject this submission?'}
              {actionType === 'request-info' && 'What information is missing?'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Add notes (optional)..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={actionNotes}
              onChangeText={setActionNotes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtnConfirm,
                  {
                    backgroundColor:
                      actionType === 'approve'
                        ? theme.success
                        : actionType === 'reject'
                        ? theme.danger
                        : theme.warning,
                  },
                ]}
                onPress={submitAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalBtnTextConfirm}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 56,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backBtn: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
      gap: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    subId: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    date: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 4,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 8,
    },
    riskContainer: {
      gap: 8,
    },
    riskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    riskScoreLabel: {
      fontSize: 14,
      color: theme.textMuted,
    },
    riskScoreValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    riskBarBg: {
      height: 12,
      backgroundColor: theme.border,
      borderRadius: 6,
      overflow: 'hidden',
    },
    riskBarFill: {
      height: '100%',
      borderRadius: 6,
    },
    riskLegend: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    riskLegendText: {
      fontSize: 10,
      color: theme.textMuted,
    },
    recommendationBox: {
      marginTop: 12,
      backgroundColor: theme.background,
      padding: 12,
      borderRadius: 8,
    },
    recLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    recText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textMuted,
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
      flex: 2,
      textAlign: 'right',
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 8,
    },
    notesText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
    },
    actionContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    actionBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      marginBottom: 16,
    },
    modalInput: {
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      minHeight: 80,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalBtnCancel: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBtnConfirm: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBtnTextCancel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    modalBtnTextConfirm: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
    },
  });
