import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/theme';
import { getPolicies, createPolicy, getLeads } from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';
import Animated, { FadeInDown } from 'react-native-reanimated';
import CustomDropdown from '../../components/CustomDropdown';

const TYPE_FILTERS = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Health', value: 'HEALTH' },
  { label: 'Auto', value: 'AUTO' },
  { label: 'Life', value: 'LIFE' },
  { label: 'Home', value: 'HOME' },
];

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function PoliciesListScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [policies, setPolicies] = useState<any[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');

  // Create Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    policy_number: '',
    customer: '',
    policy_type: 'HEALTH',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split('T')[0],
    premium_amount: '',
    status: 'ACTIVE',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [policiesData, leadsData] = await Promise.all([
        getPolicies(),
        getLeads(),
      ]);
      setPolicies(policiesData);
      setCustomers(leadsData);
      applyFilters(
        policiesData,
        searchText,
        activeTypeFilter,
        activeStatusFilter,
      );
    } catch (error) {
      console.error(error);
      Toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  useEffect(() => {
    applyFilters(policies, searchText, activeTypeFilter, activeStatusFilter);
  }, [policies, searchText, activeTypeFilter, activeStatusFilter]);

  const applyFilters = (
    data: any[],
    search: string,
    type: string,
    status: string,
  ) => {
    let result = data;

    if (type !== 'ALL') {
      result = result.filter(item => item.policy_type === type);
    }

    if (status !== 'ALL') {
      result = result.filter(item => item.status === status);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        item =>
          item.policy_number?.toLowerCase().includes(lowerSearch) ||
          item.customer_name?.toLowerCase().includes(lowerSearch),
      );
    }

    setFilteredPolicies(result);
  };

  const openCreateModal = () => {
    setFormData({
      policy_number: `POL-${Math.floor(Math.random() * 100000)}`,
      customer: customers.length > 0 ? customers[0].id : '',
      policy_type: 'HEALTH',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      premium_amount: '',
      status: 'ACTIVE',
    });
    setModalVisible(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.customer || !formData.premium_amount) {
      Toast.warn('Please fill in all required fields');
      return;
    }

    setCreateLoading(true);
    try {
      await createPolicy(formData);
      Toast.success('Policy created successfully');
      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Failed to create policy';
      Toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

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

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PolicyDetail', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.policyNum}>{item.policy_number}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.customerName}>
          {item.customer_name || 'Unknown Customer'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Type</Text>
            <Text style={styles.statValue}>{item.policy_type}</Text>
          </View>
          <View style={styles.statRight}>
            <Text style={styles.statLabel}>Premium</Text>
            <Text style={[styles.statValue, { color: theme.success }]}>
              ${Number(item.premium_amount).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
          <Text style={styles.dateText}>
            {item.start_date} to {item.end_date}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Search & Filters */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search policies..."
            placeholderTextColor={theme.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {TYPE_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.tab,
                activeTypeFilter === filter.value && {
                  backgroundColor: theme.primary + '15',
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveTypeFilter(filter.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTypeFilter === filter.value && {
                    color: theme.primary,
                    fontWeight: 'bold',
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          {STATUS_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.tab,
                activeStatusFilter === filter.value && {
                  backgroundColor: theme.primary + '15',
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveStatusFilter(filter.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeStatusFilter === filter.value && {
                    color: theme.primary,
                    fontWeight: 'bold',
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={filteredPolicies}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData()}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No policies found.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={openCreateModal}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Policy</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Policy Number</Text>
              <TextInput
                style={styles.input}
                value={formData.policy_number}
                editable={false}
              />
            </View>

            <CustomDropdown
              label="Customer *"
              data={customers.map(c => ({
                label: `${c.first_name} ${c.last_name}`,
                value: c.id,
              }))}
              value={formData.customer}
              onSelect={val => setFormData({ ...formData, customer: val })}
              placeholder="Select Customer"
            />

            <CustomDropdown
              label="Policy Type"
              data={TYPE_FILTERS.filter(t => t.value !== 'ALL')}
              value={formData.policy_type}
              onSelect={val => setFormData({ ...formData, policy_type: val })}
              placeholder="Select Type"
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.start_date}
                  placeholder="YYYY-MM-DD"
                  onChangeText={t =>
                    setFormData({ ...formData, start_date: t })
                  }
                />
              </View>
              <View style={styles.spacer} />
              <View style={styles.col}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.end_date}
                  placeholder="YYYY-MM-DD"
                  onChangeText={t => setFormData({ ...formData, end_date: t })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Premium Amount ($) *</Text>
              <TextInput
                style={styles.input}
                value={formData.premium_amount}
                onChangeText={t =>
                  setFormData({ ...formData, premium_amount: t })
                }
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreateSubmit}
              disabled={createLoading}
            >
              {createLoading ? (
                <Text style={styles.submitBtnText}>Creating...</Text>
              ) : (
                <Text style={styles.submitBtnText}>Create Policy</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerContainer: {
      backgroundColor: theme.background,
      paddingVertical: 12,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      marginHorizontal: 16,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: theme.text,
    },
    filterScroll: {
      paddingHorizontal: 16,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 8,
      backgroundColor: theme.card,
      height: 34,
      justifyContent: 'center',
    },
    tabText: {
      fontSize: 13,
      color: theme.textMuted,
      fontWeight: '500',
    },
    filterDivider: {
      width: 1,
      height: 20,
      backgroundColor: theme.border,
      marginRight: 8,
      alignSelf: 'center',
    },
    listContent: {
      padding: 16,
      paddingBottom: 80,
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
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    policyNum: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    customerName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginBottom: 12,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    stat: {
      alignItems: 'flex-start',
    },
    statRight: {
      alignItems: 'flex-end',
    },
    statLabel: {
      fontSize: 11,
      color: theme.textMuted,
      marginBottom: 2,
    },
    statValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateText: {
      fontSize: 12,
      color: theme.textMuted,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.textMuted,
      fontSize: 16,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    modalContent: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
      color: theme.text,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    col: {
      flex: 1,
    },
    spacer: {
      width: 12,
    },
    submitBtn: {
      backgroundColor: theme.primary,
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    submitBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
