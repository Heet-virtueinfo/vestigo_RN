import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/theme';
import { getLateCharges } from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';
import CustomDropdown from '../../components/CustomDropdown';

export default function LateChargesListScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWaived, setFilterWaived] = useState('all');
  const [filterPaid, setFilterPaid] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      fetchCharges();
    }, []),
  );

  const fetchCharges = async () => {
    try {
      const data = await getLateCharges();
      setCharges(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to load late charges');
    } finally {
      setLoading(false);
    }
  };

  const filteredCharges = charges.filter(charge => {
    if (filterWaived === 'waived' && !charge.waived) return false;
    if (filterWaived === 'active' && charge.waived) return false;
    if (filterPaid === 'paid' && !charge.is_paid) return false;
    if (filterPaid === 'unpaid' && charge.is_paid) return false;
    return true;
  });

  const stats = {
    total: charges.length,
    active: charges.filter(c => !c.waived && !c.is_paid).length,
    paid: charges.filter(c => c.is_paid).length,
    totalAmount: charges
      .filter(c => !c.waived)
      .reduce((sum, c) => sum + parseFloat(c.charge_amount), 0),
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        data={filteredCharges}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="stats-chart" size={20} color="#1e3a8a" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Total Charges</Text>
                  <Text style={styles.statValue}>{stats.total}</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#fffbeb' }]}>
                  <Ionicons name="alert-circle" size={22} color="#b45309" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Active</Text>
                  <Text style={[styles.statValue, { color: '#b45309' }]}>
                    {stats.active}
                  </Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="checkmark-circle" size={22} color="#047857" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Paid</Text>
                  <Text style={[styles.statValue, { color: '#047857' }]}>
                    {stats.paid}
                  </Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#faf5ff' }]}>
                  <Ionicons name="cash" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Amount</Text>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    ${stats.totalAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
              <View style={{ flex: 1 }}>
                <CustomDropdown
                  label="Waiver Status"
                  data={[
                    { label: 'All', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Waived', value: 'waived' },
                  ]}
                  value={filterWaived}
                  onSelect={setFilterWaived}
                  icon="flag-outline"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <CustomDropdown
                  label="Payment Status"
                  data={[
                    { label: 'All', value: 'all' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'Unpaid', value: 'unpaid' },
                  ]}
                  value={filterPaid}
                  onSelect={setFilterPaid}
                  icon="cash-outline"
                />
              </View>
            </View>

            <Text style={styles.resultsCount}>
              Showing {filteredCharges.length} of {charges.length} charges
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('LateChargeDetail', { id: item.id })
            }
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.customerName}>
                  {item.customer_name || 'N/A'}
                </Text>
                <Text style={styles.policyNum}>{item.policy_number}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: item.waived
                      ? '#f3f4f6'
                      : item.is_paid
                      ? '#d1fae5'
                      : '#fef3c7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: item.waived
                        ? '#6b7280'
                        : item.is_paid
                        ? '#065f46'
                        : '#92400e',
                    },
                  ]}
                >
                  {item.waived ? 'Waived' : item.is_paid ? 'Paid' : 'Unpaid'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <View>
                <Text style={styles.label}>Charge</Text>
                <Text style={[styles.value, styles.chargeAmount]}>
                  ${parseFloat(item.charge_amount).toLocaleString()}
                </Text>
              </View>
              <View>
                <Text style={styles.label}>Payment Ref</Text>
                <Text style={styles.value}>{item.payment_number}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>
                  {item.payment_due_date
                    ? new Date(item.payment_due_date).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No late charges found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function getStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      width: '48%',
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row', // icon left, text right
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 11,
      color: theme.textMuted,
      marginBottom: 2,
    },
    filtersContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    resultsCount: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 12,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    customerName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    policyNum: {
      fontSize: 12,
      color: theme.textMuted,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginBottom: 12,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 11,
      color: theme.textMuted,
      marginBottom: 4,
    },
    value: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.text,
    },
    chargeAmount: {
      color: theme.danger, // Or yellow/brown based on status logic if needed, but danger is safe for charges
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.textMuted,
    },
  });
}
