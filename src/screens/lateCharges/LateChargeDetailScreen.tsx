import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/theme';
import {
  getLateChargeDetail,
  waiveLateCharge,
  adjustLateCharge,
  markLateChargePaid,
  deleteLateCharge,
} from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';

export default function LateChargeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [charge, setCharge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<
    'waive' | 'adjust' | 'markPaid' | 'delete' | null
  >(null);
  const [formData, setFormData] = useState({
    reason: '',
    amount: '',
    notes: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await getLateChargeDetail(id);
      setCharge(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to load charge details');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (
    type: 'waive' | 'adjust' | 'markPaid' | 'delete',
  ) => {
    setActionType(type);
    setFormData({ reason: '', amount: '', notes: '' });
    setModalVisible(true);
  };

  const handleAction = async () => {
    if (!charge) return;

    setActionLoading(true);
    try {
      if (actionType === 'waive') {
        if (!formData.reason) {
          Toast.warn('Please provide a reason');
          return;
        }
        await waiveLateCharge(charge.id, formData.reason);
        Toast.success('Charge waived successfully');
        setShouldRefresh(true);
      } else if (actionType === 'adjust') {
        if (!formData.amount) {
          Toast.warn('Please enter new amount');
          return;
        }
        await adjustLateCharge(
          charge.id,
          parseFloat(formData.amount),
          formData.notes,
        );
        Toast.success('Charge adjusted successfully');
        setShouldRefresh(true);
      } else if (actionType === 'markPaid') {
        await markLateChargePaid(charge.id);
        Toast.success('Charge marked as paid');
        setModalVisible(false);
        navigation.navigate('LateCharges', { refresh: true });
        return;
      } else if (actionType === 'delete') {
        await deleteLateCharge(charge.id);
        Toast.success('Charge deleted');
        setModalVisible(false);
        navigation.navigate('LateCharges', { refresh: true });
        return;
      }
      setModalVisible(false);
      await fetchDetail();
    } catch (error) {
      Toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = () => {
    openActionModal('markPaid');
  };

  const handleDelete = () => {
    openActionModal('delete');
  };

  const handleBack = () => {
    if (shouldRefresh) {
      navigation.navigate('LateCharges', { refresh: true });
    } else {
      navigation.goBack();
    }
  };

  if (loading) return <LoadingScreen />;
  if (!charge)
    return (
      <View style={styles.center}>
        <Text>Charge not found</Text>
      </View>
    );

  const getStatusColor = () => {
    if (charge.waived) return '#6b7280';
    if (charge.is_paid) return '#065f46';
    return '#92400e';
  };

  const getStatusBg = () => {
    if (charge.waived) return '#f3f4f6';
    if (charge.is_paid) return '#d1fae5';
    return '#fef3c7';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Late Charge Details</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Charge Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={theme.primary}
            />
            <Text style={styles.sectionTitle}>Charge Information</Text>
          </View>
          <View style={styles.chargeAmountContainer}>
            <Text style={styles.chargeLabel}>Charge Amount</Text>
            <Text style={styles.chargeAmount}>
              ${parseFloat(charge.charge_amount).toLocaleString()}
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusBg() }]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {charge.waived ? 'WAIVED' : charge.is_paid ? 'PAID' : 'UNPAID'}
            </Text>
          </View>
          <InfoRow
            label="Applied Date"
            value={new Date(charge.created_at).toLocaleDateString()}
          />
          <InfoRow label="Reason" value={charge.reason} />
        </View>

        {/* Payment Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Payment Information</Text>
          </View>
          <InfoRow label="Payment #" value={charge.payment_number} />
          <InfoRow
            label="Due Amount"
            value={`$${parseFloat(
              charge.payment_due_amount || 0,
            ).toLocaleString()}`}
          />
          <InfoRow
            label="Due Date"
            value={
              charge.payment_due_date
                ? new Date(charge.payment_due_date).toLocaleDateString()
                : 'N/A'
            }
          />
        </View>

        {/* Policy & Customer */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={theme.primary}
            />
            <Text style={styles.sectionTitle}>Policy & Customer</Text>
          </View>
          <InfoRow label="Policy #" value={charge.policy_number || 'N/A'} />
          <InfoRow
            label="Premium"
            value={`$${parseFloat(
              charge.policy_premium || 0,
            ).toLocaleString()}`}
          />
          <InfoRow label="Customer" value={charge.customer_name || 'N/A'} />
          <InfoRow label="Email" value={charge.customer_email || 'N/A'} />
        </View>

        {/* History */}
        {(charge.waived || charge.admin_notes) && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={styles.sectionTitle}>History & Notes</Text>
            </View>
            {charge.waived && charge.waived_reason && (
              <View style={styles.historyItem}>
                <Text style={styles.historyLabel}>Waived Reason:</Text>
                <Text style={styles.historyValue}>{charge.waived_reason}</Text>
              </View>
            )}
            {charge.admin_notes && (
              <View style={styles.historyItem}>
                <Text style={styles.historyLabel}>Admin Notes:</Text>
                <Text style={styles.historyValue}>{charge.admin_notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        {!charge.waived && !charge.is_paid && (
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => openActionModal('waive')}
            >
              <Ionicons name="close-circle-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Waive Charge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.warning }]}
              onPress={() => openActionModal('adjust')}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Adjust Amount</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.success }]}
              onPress={handleMarkPaid}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.actionBtnText}>Mark as Paid</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.deleteBtnText}>Delete Charge</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'waive'
                ? 'Waive Charge'
                : actionType === 'adjust'
                ? 'Adjust Amount'
                : actionType === 'delete'
                ? 'Delete Charge'
                : 'Mark as Paid'}
            </Text>

            {actionType === 'waive' ? (
              <>
                <Text style={styles.label}>Reason for Waiver *</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  value={formData.reason}
                  onChangeText={t => setFormData({ ...formData, reason: t })}
                  placeholder="Explain why this charge is being waived"
                />
              </>
            ) : actionType === 'adjust' ? (
              <>
                <Text style={styles.label}>New Amount *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={t => setFormData({ ...formData, amount: t })}
                  placeholder="Enter new amount"
                />
                <Text style={styles.label}>Admin Notes</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  multiline
                  value={formData.notes}
                  onChangeText={t => setFormData({ ...formData, notes: t })}
                  placeholder="Reason for adjustment"
                />
              </>
            ) : actionType === 'delete' ? (
              <Text style={{ marginTop: 8, color: '#666' }}>
                Are you sure you want to delete this charge forever? This action
                cannot be undone.
              </Text>
            ) : (
              <Text style={{ marginTop: 8, color: '#666' }}>
                Are you sure you want to mark this charge as paid manually?
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleAction}
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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: '#eee',
    }}
  >
    <Text style={{ color: '#888' }}>{label}</Text>
    <Text
      style={{ fontWeight: '600', color: '#333', flex: 1, textAlign: 'right' }}
    >
      {value}
    </Text>
  </View>
);

function getStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
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
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    chargeAmountContainer: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    chargeLabel: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 4,
    },
    chargeAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#92400e',
    },
    statusBadge: {
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      marginBottom: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    historyItem: {
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: '#eee',
    },
    historyLabel: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 4,
    },
    historyValue: {
      fontSize: 14,
      color: theme.text,
    },
    actionsCard: {
      gap: 12,
      marginBottom: 16,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    actionBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.danger,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    deleteBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      backgroundColor: '#fff',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalCancel: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: '#f3f4f6',
      alignItems: 'center',
    },
    modalCancelText: {
      color: '#6b7280',
      fontWeight: 'bold',
    },
    modalSubmit: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: '#4f46e5',
      alignItems: 'center',
    },
    modalSubmitText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
}
