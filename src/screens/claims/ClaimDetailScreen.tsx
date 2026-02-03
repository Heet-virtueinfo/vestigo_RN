import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/theme';
import { getClaimDetail, updateClaimStatus } from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';
import { useColorScheme } from 'react-native';

const ALLOWED_TRANSITIONS: any = {
  SUBMITTED: ['IN_REVIEW', 'REJECTED'],
  IN_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PAID', 'REJECTED'],
  REJECTED: [],
  PAID: [],
};

export default function ClaimDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Action Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    note: '',
    approved_amount: '',
    paid_amount: '',
    payout_date: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await getClaimDetail(id);
      setClaim(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to load claim');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return theme.success;
      case 'APPROVED':
        return '#10b981';
      case 'IN_REVIEW':
        return theme.warning;
      case 'REJECTED':
        return theme.danger;
      default:
        return theme.primary;
    }
  };

  const openActionModal = (type: string) => {
    setActionType(type);
    setFormData({
      note: '',
      approved_amount: claim.approved_amount || '',
      paid_amount: claim.paid_amount || '',
      payout_date: new Date().toISOString().split('T')[0],
    });
    setModalVisible(true);
  };

  const handleActionSubmit = async () => {
    if (!formData.note) {
      Toast.warn('Note is required');
      return;
    }
    if (actionType === 'APPROVED' && !formData.approved_amount) {
      Toast.warn('Approved amount is required');
      return;
    }
    if (actionType === 'PAID' && !formData.paid_amount) {
      Toast.warn('Paid amount is required');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        status: actionType,
        note: formData.note,
        approved_amount:
          actionType === 'APPROVED' ? formData.approved_amount : undefined,
        paid_amount: actionType === 'PAID' ? formData.paid_amount : undefined,
        payout_date: actionType === 'PAID' ? formData.payout_date : undefined,
      };

      await updateClaimStatus(id, payload);
      Toast.success(`Claim marked as ${actionType}`);
      setModalVisible(false);
      fetchDetail();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Action failed';
      Toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'IN_REVIEW':
        return 'Move to Review';
      case 'APPROVED':
        return 'Approve Claim';
      case 'REJECTED':
        return 'Reject Claim';
      case 'PAID':
        return 'Mark Paid';
      default:
        return type;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'IN_REVIEW':
        return theme.warning;
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
        return theme.danger;
      case 'PAID':
        return theme.success;
      default:
        return theme.primary;
    }
  };

  if (loading) return <LoadingScreen />;
  if (!claim)
    return (
      <View style={styles.center}>
        <Text>Not Found</Text>
      </View>
    );

  const availableActions = ALLOWED_TRANSITIONS[claim.status] || [];

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Claim Detail</Text>
          <Text style={styles.headerSubtitle}>{claim.claim_number}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: getStatusColor(claim.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusBannerText,
              { color: getStatusColor(claim.status) },
            ]}
          >
            {claim.status.replace('_', ' ')}
          </Text>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
              ]}
            >
              <Text style={[styles.statLabel, { color: '#1e40af' }]}>
                CLAIMED
              </Text>
              <Text style={[styles.statValue, { color: '#1e3a8a' }]}>
                ${Number(claim.claim_amount).toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
              ]}
            >
              <Text style={[styles.statLabel, { color: '#047857' }]}>
                APPROVED
              </Text>
              <Text style={[styles.statValue, { color: '#064e3b' }]}>
                {claim.approved_amount
                  ? `$${Number(claim.approved_amount).toLocaleString()}`
                  : '-'}
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
              ]}
            >
              <Text style={[styles.statLabel, { color: '#b45309' }]}>PAID</Text>
              <Text style={[styles.statValue, { color: '#78350f' }]}>
                {claim.paid_amount
                  ? `$${Number(claim.paid_amount).toLocaleString()}`
                  : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <InfoRow label="Incident Date" value={claim.incident_date} />
          <InfoRow label="Description" value={claim.description} />
          {claim.note && <InfoRow label="Latest Note" value={claim.note} />}
          {claim.payout_date && (
            <InfoRow label="Payout Date" value={claim.payout_date} />
          )}
        </View>

        {/* Policy & Customer */}
        <View style={styles.card}>
          <Text style={styles.subTitle}>Policy Information</Text>
          <InfoRow label="Policy #" value={claim.policy_number} />
          <InfoRow label="Customer" value={claim.customer_name} />
          <InfoRow label="Email" value={claim.customer_email} />
          <InfoRow label="Phone" value={claim.customer_phone} />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PoliciesStack', {
                screen: 'PolicyDetail',
                params: { id: claim.policy },
              })
            }
          >
            <Text style={styles.link}>View Policy Details</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        {availableActions.length > 0 && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionGrid}>
              {availableActions.map((action: string) => (
                <TouchableOpacity
                  key={action}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: getActionColor(action) },
                  ]}
                  onPress={() => openActionModal(action)}
                >
                  <Text style={styles.actionBtnText}>
                    {getActionLabel(action)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {getActionLabel(actionType || '')}
            </Text>

            <Text style={styles.label}>Note (Required)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={formData.note}
              onChangeText={t => setFormData({ ...formData, note: t })}
              placeholder="Add a reason or note..."
            />

            {actionType === 'APPROVED' && (
              <View>
                <Text style={styles.label}>Approved Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.approved_amount}
                  onChangeText={t =>
                    setFormData({ ...formData, approved_amount: t })
                  }
                />
              </View>
            )}

            {actionType === 'PAID' && (
              <View>
                <Text style={styles.label}>Paid Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.paid_amount}
                  onChangeText={t =>
                    setFormData({ ...formData, paid_amount: t })
                  }
                />
                <Text style={styles.label}>Payout Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.payout_date}
                  onChangeText={t =>
                    setFormData({ ...formData, payout_date: t })
                  }
                  placeholder="YYYY-MM-DD"
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmit,
                  { backgroundColor: getActionColor(actionType || '') },
                ]}
                onPress={handleActionSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
      {value || '-'}
    </Text>
  </View>
);

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
      height: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backBtn: {
      padding: 8,
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textMuted,
    },
    headerSubtitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    statusBanner: {
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 20,
    },
    statusBannerText: {
      fontWeight: 'bold',
      fontSize: 16,
      textTransform: 'uppercase',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
    },
    subTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.text,
    },
    link: {
      color: theme.primary,
      fontWeight: '600',
      marginTop: 8,
    },
    actionSection: {
      marginTop: 8,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionBtn: {
      flex: 1,
      minWidth: '45%',
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: theme.text,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.text,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      color: theme.text,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    modalCancel: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    modalSubmit: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalCancelText: {
      fontWeight: '600',
      color: theme.text,
    },
    modalSubmitText: {
      fontWeight: 'bold',
      color: '#fff',
    },
  });
