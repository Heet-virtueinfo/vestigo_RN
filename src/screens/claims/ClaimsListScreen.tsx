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
import { getClaims, getPolicies, createClaim } from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';
import Animated, { FadeInDown } from 'react-native-reanimated';
import CustomDropdown from '../../components/CustomDropdown';

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function ClaimsListScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');

  // Create Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    claim_number: '',
    policy: '',
    incident_date: new Date().toISOString().split('T')[0],
    description: '',
    claim_amount: '',
    status: 'SUBMITTED',
  });

  const fetchData = async () => {
    try {
      const [claimsData, policiesData] = await Promise.all([
        getClaims(),
        getPolicies(),
      ]);
      setClaims(claimsData);
      setPolicies(policiesData);
      applyFilters(claimsData, searchText, activeStatusFilter);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to fetch claims');
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
    applyFilters(claims, searchText, activeStatusFilter);
  }, [claims, searchText, activeStatusFilter]);

  const applyFilters = (data: any[], search: string, status: string) => {
    let result = data;

    if (status !== 'ALL') {
      result = result.filter(item => item.status === status);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        item =>
          item.claim_number?.toLowerCase().includes(lowerSearch) ||
          item.customer_name?.toLowerCase().includes(lowerSearch) ||
          item.policy_number?.toLowerCase().includes(lowerSearch),
      );
    }

    setFilteredClaims(result);
  };

  const openCreateModal = () => {
    setFormData({
      claim_number: `CLM-${Math.floor(Math.random() * 100000)}`,
      policy: policies.length > 0 ? policies[0].id : '',
      incident_date: new Date().toISOString().split('T')[0],
      description: '',
      claim_amount: '',
      status: 'SUBMITTED',
    });
    setModalVisible(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.policy || !formData.claim_amount || !formData.description) {
      Toast.warn('Please fill all required fields');
      return;
    }
    setCreateLoading(true);
    try {
      await createClaim(formData);
      Toast.success('Claim submitted successfully');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error(error);
      Toast.error('Failed to submit claim');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return theme.success; // Emerald
      case 'APPROVED':
        return '#10b981'; // Green
      case 'IN_REVIEW':
        return theme.warning; // Amber
      case 'REJECTED':
        return theme.danger; // Red
      default:
        return theme.primary; // Blue (Submitted)
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ClaimDetail', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.claimNum}>{item.claim_number}</Text>
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
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.customerName}>
          {item.customer_name || 'Unknown Customer'}
        </Text>
        <Text style={styles.policyNum}>Policy: {item.policy_number}</Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Date</Text>
            <Text style={styles.statValue}>{item.incident_date}</Text>
          </View>
          <View style={styles.statRight}>
            <Text style={styles.statLabel}>Amount</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              ${Number(item.claim_amount).toLocaleString()}
            </Text>
          </View>
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
            placeholder="Search claims..."
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
          data={filteredClaims}
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
              <Text style={styles.emptyText}>No claims found.</Text>
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
            <Text style={styles.modalTitle}>File New Claim</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Claim Number</Text>
              <TextInput
                style={styles.input}
                value={formData.claim_number}
                editable={false}
              />
            </View>

            <CustomDropdown
              label="Policy *"
              data={policies.map(p => ({
                label: `${p.policy_number} - ${p.customer_name}`,
                value: p.id,
              }))}
              value={formData.policy}
              onSelect={val => setFormData({ ...formData, policy: val })}
              placeholder="Select Policy"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Incident Date</Text>
              <TextInput
                style={styles.input}
                value={formData.incident_date}
                placeholder="YYYY-MM-DD"
                onChangeText={t =>
                  setFormData({ ...formData, incident_date: t })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Claim Amount ($) *</Text>
              <TextInput
                style={styles.input}
                value={formData.claim_amount}
                onChangeText={t =>
                  setFormData({ ...formData, claim_amount: t })
                }
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={formData.description}
                onChangeText={t => setFormData({ ...formData, description: t })}
                multiline
                textAlignVertical="top"
                placeholder="Describe the incident..."
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreateSubmit}
              disabled={createLoading}
            >
              {createLoading ? (
                <Text style={styles.submitBtnText}>Submitting...</Text>
              ) : (
                <Text style={styles.submitBtnText}>Submit Claim</Text>
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
    claimNum: {
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
      marginBottom: 4,
    },
    policyNum: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 8,
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
