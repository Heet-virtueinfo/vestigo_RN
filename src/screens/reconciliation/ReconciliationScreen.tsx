import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/theme';
import {
  getReconciliationItems,
  matchReconciliationItem,
  flagReconciliationItem,
} from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';

export default function ReconciliationScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unreconciled' | 'matched'>(
    'unreconciled',
  );

  const [flagModalVisible, setFlagModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [flagReason, setFlagReason] = useState('');

  const fetchItems = async () => {
    try {
      const data = await getReconciliationItems();
      setItems(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to load reconciliation items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleMatch = (item: any) => {
    Alert.alert(
      'Confirm Match',
      `Match $${item.amount} from ${item.description}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Match',
          onPress: async () => {
            try {
              await matchReconciliationItem(item.id, { status: 'MATCHED' });
              Toast.success('Item matched successfully');
              fetchItems();
            } catch (error) {
              Toast.error('Failed to match item');
            }
          },
        },
      ],
    );
  };

  const handleFlag = (item: any) => {
    setSelectedItem(item);
    setFlagReason('');
    setFlagModalVisible(true);
  };

  const submitFlag = async () => {
    if (!flagReason.trim()) {
      Toast.warn('Please enter a reason');
      return;
    }
    try {
      await flagReconciliationItem(selectedItem.id, flagReason);
      Toast.success('Item flagged');
      setFlagModalVisible(false);
      fetchItems();
    } catch (error) {
      Toast.error('Failed to flag item');
    }
  };

  const filteredItems = items.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'unreconciled') return !i.is_reconciled && !i.flagged;
    if (filter === 'matched') return i.is_reconciled;
    return true;
  });

  const stats = {
    unreconciled: items.filter(i => !i.is_reconciled).length,
    amount: items
      .filter(i => !i.is_reconciled)
      .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0),
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={
              item.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'
            }
            size={24}
            color={item.type === 'credit' ? theme.success : theme.danger}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amount,
              { color: item.type === 'credit' ? theme.success : theme.text },
            ]}
          >
            ${parseFloat(item.amount).toFixed(2)}
          </Text>
        </View>
      </View>

      {!item.is_reconciled && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.flagBtn]}
            onPress={() => handleFlag(item)}
          >
            <Ionicons name="flag-outline" size={16} color={theme.warning} />
            <Text style={[styles.actionText, { color: theme.warning }]}>
              Flag
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.matchBtn]}
            onPress={() => handleMatch(item)}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Match</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Unreconciled</Text>
            <Text style={styles.statValue}>{stats.unreconciled}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Amount</Text>
            <Text style={styles.statValue}>
              ${stats.amount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['unreconciled', 'matched', 'all'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[styles.tabText, filter === f && styles.tabTextActive]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />

      <Modal visible={flagModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Flag Transaction</Text>
            <Text style={styles.modalSubtitle}>Why are you flagging this?</Text>
            <TextInput
              style={styles.input}
              placeholder="Reason (e.g. Duplicate, Unknown)"
              value={flagReason}
              onChangeText={setFlagReason}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setFlagModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={submitFlag}>
                <Text style={styles.modalSubmitText}>Flag Item</Text>
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
    header: {
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 24,
    },
    stat: {},
    statLabel: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.primary,
    },
    tabs: {
      flexDirection: 'row',
      padding: 12,
      gap: 8,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tabActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    tabText: {
      color: theme.text,
      fontWeight: '600',
      fontSize: 13,
    },
    tabTextActive: {
      color: '#fff',
    },
    list: {
      padding: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 40,
      alignItems: 'center',
    },
    info: {
      flex: 1,
      paddingHorizontal: 8,
    },
    description: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    date: {
      fontSize: 12,
      color: theme.textMuted,
    },
    amountContainer: {
      alignItems: 'flex-end',
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    actions: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 8,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 8,
      gap: 6,
    },
    flagBtn: {
      backgroundColor: theme.warning + '15',
    },
    matchBtn: {
      backgroundColor: theme.success,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    empty: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.textMuted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 20,
      color: theme.text,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalCancel: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.background,
      alignItems: 'center',
    },
    modalSubmit: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.warning,
      alignItems: 'center',
    },
    modalCancelText: {
      color: theme.text,
      fontWeight: '600',
    },
    modalSubmitText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
