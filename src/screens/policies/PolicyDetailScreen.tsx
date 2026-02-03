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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../constants/theme';
import {
  getPolicyDetail,
  generatePaymentSchedule,
  updatePolicyStatus,
  createClaim,
  markPaymentPaid,
  markPaymentFailed,
} from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';
import { useColorScheme } from 'react-native';

export default function PolicyDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [policyData, setPolicyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS, PAYMENTS, STATS

  // Schedule Modal
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleInstallments, setScheduleInstallments] = useState('12');
  // Payment Action Modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null,
  );
  const [paymentActionType, setPaymentActionType] = useState<
    'paid' | 'failed' | null
  >(null);
  const [paymentActionValue, setPaymentActionValue] = useState('');

  // Claim Modal
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [claimData, setClaimData] = useState({
    claim_number: '',
    incident_date: new Date().toISOString().split('T')[0],
    description: '',
    claim_amount: '',
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await getPolicyDetail(id);
      setPolicyData(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to load policy details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = () => {
    setScheduleModalVisible(true);
  };

  const submitSchedule = async () => {
    if (!scheduleInstallments) {
      Toast.warn('Please enter number of installments');
      return;
    }
    setScheduleLoading(true);
    try {
      await generatePaymentSchedule(id, parseInt(scheduleInstallments));
      Toast.success('Schedule generated');
      setScheduleModalVisible(false);
      fetchDetail();
    } catch (error) {
      Toast.error('Failed to generate schedule');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleStatusUpdate = (action: 'cancel' | 'expire') => {
    Alert.alert(
      `Confirm ${action === 'cancel' ? 'Cancellation' : 'Expiration'}`,
      `Are you sure you want to ${action} this policy?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await updatePolicyStatus(id, action);
              Toast.success(`Policy ${action}ed`);
              fetchDetail();
            } catch (error) {
              Toast.error('Action failed');
            }
          },
        },
      ],
    );
  };

  const handleCreateClaim = async () => {
    if (
      !claimData.claim_amount ||
      !claimData.description ||
      !claimData.incident_date
    ) {
      Toast.warn('Please fill all required fields');
      return;
    }
    setClaimLoading(true);
    try {
      await createClaim({
        ...claimData,
        policy: id,
        claim_number:
          claimData.claim_number || `CLM-${Math.floor(Math.random() * 100000)}`,
        status: 'SUBMITTED',
      });
      Toast.success('Claim submitted');
      setClaimModalVisible(false);
      fetchDetail();
    } catch (error) {
      Toast.error('Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  const handlePaymentAction = (paymentId: number, type: 'paid' | 'failed') => {
    setSelectedPaymentId(paymentId);
    setPaymentActionType(type);
    if (type === 'paid') {
      setPaymentActionValue(activePaymentAmount(paymentId));
    } else {
      setPaymentActionValue('Insufficient Funds');
    }
    setPaymentModalVisible(true);
  };

  const submitPaymentAction = async () => {
    if (!selectedPaymentId || !paymentActionType) return;

    try {
      if (paymentActionType === 'paid') {
        if (!paymentActionValue) return;
        await markPaymentPaid(selectedPaymentId, paymentActionValue);
        Toast.success('Payment marked as Paid');
      } else {
        await markPaymentFailed(
          selectedPaymentId,
          paymentActionValue || 'Unknown',
        );
        Toast.success('Payment marked as Failed');
      }
      setPaymentModalVisible(false);
      fetchDetail();
    } catch (e) {
      Toast.error('Failed to update payment');
    }
  };

  const activePaymentAmount = (pId: number) => {
    const p = policyData?.payments?.find((x: any) => x.id === pId);
    return p ? String(p.amount_due) : '';
  };

  if (loading) return <LoadingScreen />;
  if (!policyData)
    return (
      <View style={styles.center}>
        <Text>Not Found</Text>
      </View>
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.success;
      case 'EXPIRED':
        return theme.textMuted;
      case 'CANCELLED':
        return theme.danger;
      default:
        return theme.primary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return theme.success;
      case 'PENDING':
        return theme.primary; // blue
      case 'OVERDUE':
        return theme.danger;
      case 'FAILED':
        return theme.textMuted;
      default:
        return theme.text;
    }
  };

  const { policy, customer, statistics, payments } = policyData;

  const renderDetailsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* Policy Info */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={theme.primary}
          />
          <Text style={styles.sectionTitle}>Policy Information</Text>
        </View>
        <InfoRow label="Policy #" value={policy.policy_number} />
        <InfoRow label="Type" value={policy.policy_type} />
        <InfoRow
          label="Status"
          value={policy.status}
          color={getStatusColor(policy.status)}
        />
        <InfoRow
          label="Premium"
          value={`$${Number(policy.premium_amount).toLocaleString()}`}
        />
        <InfoRow label="Start Date" value={policy.start_date} />
        <InfoRow label="End Date" value={policy.end_date} />
      </View>

      {/* Customer Info */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color={theme.primary} />
          <Text style={styles.sectionTitle}>Customer Information</Text>
        </View>
        <InfoRow
          label="Name"
          value={`${customer.first_name} ${customer.last_name}`}
        />
        <InfoRow label="Company" value={customer.company_name || 'N/A'} />
        <InfoRow label="Email" value={customer.email} />
        <InfoRow label="Phone" value={customer.phone} />
      </View>

      {/* Danger Zone */}
      {policy.status === 'ACTIVE' && (
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.danger }]}
            onPress={() => handleStatusUpdate('cancel')}
          >
            <Text style={styles.actionBtnText}>Cancel Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.warning }]}
            onPress={() => handleStatusUpdate('expire')}
          >
            <Text style={styles.actionBtnText}>Mark Expired</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderPaymentsTab = () => {
    // Calculate Stats
    const paymentsList = (policyData.payments || []).sort(
      (a: any, b: any) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    );
    const totalDue = paymentsList.reduce(
      (sum: number, p: any) => sum + Number(p.amount_due),
      0,
    );
    const totalPaid = paymentsList.reduce(
      (sum: number, p: any) => sum + (Number(p.amount_paid) || 0),
      0,
    );
    const outstanding = totalDue - totalPaid;
    const collectionRate =
      totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : '0';

    // Custom Chart Data: All payments (Already sorted ascending)
    const chartPayments = [...paymentsList];
    const maxAmount = Math.max(
      ...chartPayments.map((p: any) => Number(p.amount_due)),
      1,
    ); // Avoid div by 0

    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
            ]}
          >
            <Text
              style={[styles.statLabel, { color: '#1e40af', fontSize: 10 }]}
            >
              TOTAL DUE
            </Text>
            <Text style={[styles.statValue, { color: '#1e3a8a' }]}>
              ${totalDue.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
            ]}
          >
            <Text
              style={[styles.statLabel, { color: '#047857', fontSize: 10 }]}
            >
              TOTAL PAID
            </Text>
            <Text style={[styles.statValue, { color: '#064e3b' }]}>
              ${totalPaid.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
            ]}
          >
            <Text
              style={[styles.statLabel, { color: '#b45309', fontSize: 10 }]}
            >
              OUTSTANDING
            </Text>
            <Text style={[styles.statValue, { color: '#78350f' }]}>
              ${outstanding.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' },
            ]}
          >
            <Text
              style={[styles.statLabel, { color: '#9333ea', fontSize: 10 }]}
            >
              COLLECTION
            </Text>
            <Text style={[styles.statValue, { color: '#581c87' }]}>
              {collectionRate}%
            </Text>
          </View>
        </View>

        {/* Custom Progress Chart */}
        {paymentsList.length > 0 && (
          <View style={styles.chartCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={styles.sectionTitle}>Payment Progress</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#10b981',
                    }}
                  />
                  <Text style={{ fontSize: 10, color: '#666' }}>Paid</Text>
                </View>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e5e7eb',
                    }}
                  />
                  <Text style={{ fontSize: 10, color: '#666' }}>Due</Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4, gap: 16 }}
            >
              {chartPayments.map((p: any, index: number) => {
                const due = Number(p.amount_due);
                const paid = Number(p.amount_paid) || 0;
                const percentage = Math.min(
                  100,
                  Math.max(0, (paid / due) * 100),
                );
                const barHeight = 150; // Fixed max height for the bar
                // Scale bar based on amount relative to max?
                // Or just make all bars regular height and show internal progress?
                // Showing relative scale is better for trends.
                const scale = due / maxAmount;
                const actualHeight = Math.max(40, barHeight * scale); // Min 40px

                const d = new Date(p.due_date);
                const dateLabel = `${d.getMonth() + 1}/${d
                  .getFullYear()
                  .toString()
                  .substr(-2)}`;

                return (
                  <View key={index} style={{ alignItems: 'center', width: 54 }}>
                    <Text
                      style={{ fontSize: 10, color: '#666', marginBottom: 4 }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      ${Math.round(due).toLocaleString()}
                    </Text>
                    <View
                      style={{
                        width: 12,
                        height: actualHeight,
                        backgroundColor: '#e5e7eb', // Gray for Due
                        borderRadius: 6,
                        overflow: 'hidden',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          height: `${percentage}%`,
                          backgroundColor:
                            percentage >= 100 ? '#10b981' : '#f59e0b', // Amber if partial
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#444',
                        marginTop: 6,
                        fontWeight: '500',
                      }}
                    >
                      {dateLabel}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={handleGenerateSchedule}
            disabled={scheduleLoading}
          >
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.quickBtnText}>Generate Schedule</Text>
          </TouchableOpacity>
        </View>

        {payments && payments.length > 0 ? (
          payments.map((payment: any) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.payNum}>{payment.payment_number}</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        getPaymentStatusColor(payment.status) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getPaymentStatusColor(payment.status) },
                    ]}
                  >
                    {payment.status}
                  </Text>
                </View>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.payDate}>Due: {payment.due_date}</Text>
                <Text style={styles.payAmount}>
                  ${Number(payment.amount_due).toLocaleString()}
                </Text>
              </View>

              {payment.status !== 'PAID' && (
                <View style={styles.payActions}>
                  <TouchableOpacity
                    onPress={() => handlePaymentAction(payment.id, 'paid')}
                  >
                    <Text style={[styles.actionLink, { color: theme.success }]}>
                      Mark Paid
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handlePaymentAction(payment.id, 'failed')}
                  >
                    <Text style={[styles.actionLink, { color: theme.danger }]}>
                      Mark Failed
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payments scheduled.</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderStatsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Claims Summary</Text>
        <View style={styles.divider} />
        <InfoRow label="Total Claims" value={statistics.total_claims} />
        <InfoRow
          label="Approved"
          value={statistics.approved_claims}
          color={theme.success}
        />
        <InfoRow
          label="Paid"
          value={statistics.paid_claims}
          color={theme.primary}
        />
        <InfoRow
          label="Pending"
          value={statistics.pending_claims}
          color={theme.warning}
        />
      </View>

      <TouchableOpacity
        style={styles.claimBtn}
        onPress={() => setClaimModalVisible(true)}
      >
        <Text style={styles.claimBtnText}>File a New Claim</Text>
      </TouchableOpacity>
    </ScrollView>
  );

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
          <Text style={styles.headerTitle}>Policy Details</Text>
          <Text style={styles.headerSubtitle}>{policy.policy_number}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['DETAILS', 'PAYMENTS', 'STATS'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'DETAILS' && renderDetailsTab()}
        {activeTab === 'PAYMENTS' && renderPaymentsTab()}
        {activeTab === 'STATS' && renderStatsTab()}
      </View>

      {/* Schedule Modal */}
      <Modal visible={scheduleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Schedule</Text>

            <Text style={styles.label}>Number of Installments</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={scheduleInstallments}
              onChangeText={setScheduleInstallments}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={submitSchedule}
                disabled={scheduleLoading}
              >
                {scheduleLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Action Modal */}
      <Modal visible={paymentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {paymentActionType === 'paid' ? 'Mark as Paid' : 'Mark as Failed'}
            </Text>

            <Text style={styles.label}>
              {paymentActionType === 'paid' ? 'Confirmed Amount ($)' : 'Reason'}
            </Text>

            <TextInput
              style={styles.input}
              value={paymentActionValue}
              onChangeText={setPaymentActionValue}
              keyboardType={
                paymentActionType === 'paid' ? 'numeric' : 'default'
              }
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={submitPaymentAction}
              >
                <Text style={styles.modalSubmitText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* File Claim Modal */}
      <Modal visible={claimModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>File a New Claim</Text>

            <Text style={styles.label}>Claim Number</Text>
            <TextInput
              style={styles.input}
              value={claimData.claim_number}
              onChangeText={t =>
                setClaimData({ ...claimData, claim_number: t })
              }
              placeholder={`CLM-${Math.floor(Math.random() * 100000)}`}
            />

            <Text style={styles.label}>Incident Date</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{ color: claimData.incident_date ? '#000' : '#999' }}
              >
                {claimData.incident_date || 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={
                  claimData.incident_date
                    ? new Date(claimData.incident_date)
                    : new Date()
                }
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setClaimData({
                      ...claimData,
                      incident_date: selectedDate.toISOString().split('T')[0],
                    });
                  }
                }}
              />
            )}

            <Text style={styles.label}>Claim Amount ($)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={claimData.claim_amount}
              onChangeText={t =>
                setClaimData({ ...claimData, claim_amount: t })
              }
              placeholder="0.00"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              value={claimData.description}
              onChangeText={t => setClaimData({ ...claimData, description: t })}
              placeholder="Describe the incident..."
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setClaimModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleCreateClaim}
              >
                {claimLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, color }: any) => (
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
    <Text style={{ fontWeight: '600', color: color || '#333' }}>{value}</Text>
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
      fontSize: 16,
      fontWeight: '600',
      color: theme.textMuted,
    },
    headerSubtitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textMuted,
    },
    activeTabText: {
      color: theme.primary,
    },
    content: {
      flex: 1,
    },
    tabContent: {
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      width: '48%',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    chartCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
      alignItems: 'center',
    },
    dangerZone: {
      gap: 12,
      marginTop: 20,
    },
    actionBtn: {
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    actionBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    quickActions: {
      marginBottom: 16,
    },
    quickBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 8,
    },
    quickBtnText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    paymentCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    payNum: {
      fontWeight: 'bold',
      fontSize: 16,
      color: theme.text,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    payDate: {
      fontSize: 14,
      color: theme.textMuted,
    },
    payAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    payActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 8,
      marginTop: 8,
    },
    actionLink: {
      fontSize: 14,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      color: theme.textMuted,
    },
    claimBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    claimBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 12,
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
      marginBottom: 16,
      textAlign: 'center',
      color: theme.text,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      color: theme.text,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
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
      backgroundColor: theme.primary,
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
}
