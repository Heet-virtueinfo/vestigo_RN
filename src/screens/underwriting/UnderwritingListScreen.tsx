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
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/theme';
import { getSubmissions } from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Needs Info', value: 'MORE_INFO_REQUIRED' },
];

export default function UnderwritingListScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchSubmissions = async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data);
      applyFilters(data, searchText, activeFilter);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubmissions();
    }, []),
  );

  useEffect(() => {
    applyFilters(submissions, searchText, activeFilter);
  }, [submissions, searchText, activeFilter]);

  const applyFilters = (data: any[], search: string, filter: string) => {
    let result = data;

    // Status Filter
    if (filter !== 'ALL') {
      result = result.filter(item => item.status === filter);
    }

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        item =>
          item.opportunity_details?.name?.toLowerCase().includes(lowerSearch) ||
          item.customer_name?.toLowerCase().includes(lowerSearch) ||
          item.id?.toString().includes(lowerSearch),
      );
    }

    setFilteredSubmissions(result);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubmissions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return theme.success;
      case 'REJECTED':
        return theme.danger;
      case 'MORE_INFO_REQUIRED':
        return theme.warning; // amber/orange
      default:
        return theme.textMuted; // PENDING or others
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return theme.success;
    if (score < 60) return theme.warning;
    return theme.danger;
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SubmissionDetail', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.idText}>
            SUB-{String(item.id).padStart(3, '0')}
          </Text>
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
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.oppName}>
          {item.opportunity_details?.name || 'Unknown Opportunity'}
        </Text>
        <Text style={styles.customerName}>
          {item.customer_name || 'Unknown Customer'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Risk Score</Text>
            <View style={styles.riskRow}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={getRiskColor(item.risk_score || 0)}
              />
              <Text
                style={[
                  styles.statValue,
                  { color: getRiskColor(item.risk_score || 0) },
                ]}
              >
                {item.risk_score || 0}
              </Text>
            </View>
          </View>
          <View style={styles.statRight}>
            <Text style={styles.statLabel}>Premium</Text>
            <Text style={styles.statValue}>
              $
              {Number(
                item.submitted_premium ||
                  item.opportunity_details?.expected_revenue,
              ).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search details..."
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
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.tab,
                activeFilter === filter.value && {
                  backgroundColor: theme.primary + '15',
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeFilter === filter.value && {
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
          data={filteredSubmissions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No submissions found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.background,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: theme.text,
    },
    tabsContainer: {
      paddingHorizontal: 16,
      marginBottom: 8,
      height: 44,
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
      paddingTop: 8,
      paddingBottom: 40,
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
      marginBottom: 8,
    },
    idText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textMuted,
      letterSpacing: 0.5,
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
    oppName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    customerName: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 12,
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
    riskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
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
  });
