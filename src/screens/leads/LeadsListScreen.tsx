import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  getLeads,
  deleteLead,
  convertLeadToOpportunity,
} from '../../services/service';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import Colors from '../../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';

export default function LeadsListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [convertLeadData, setConvertLeadData] = useState<any>(null);
  const [opportunityName, setOpportunityName] = useState('');

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // ... fetchLeads ...

  const handleOpenConvert = (lead: any) => {
    setConvertLeadData(lead);
    setOpportunityName(`${lead.first_name} ${lead.last_name} - Policy`);
  };

  const confirmConvert = async () => {
    if (!convertLeadData || !opportunityName) return;

    try {
      await convertLeadToOpportunity(convertLeadData, opportunityName);

      // Update local state
      setLeads(prev =>
        prev.map(l =>
          l.id === convertLeadData.id ? { ...l, status: 'CONVERTED' } : l,
        ),
      );

      Toast.success('Lead converted successfully');
      setConvertLeadData(null);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to convert lead');
    }
  };

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        // Clear the param immediately so we don't loop or over-fetch if we background/foreground
        navigation.setParams({ refresh: false });
        fetchLeads();
      }
    }, [route.params?.refresh]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteLead(deleteId);
        setLeads(prev => prev.filter(l => l.id !== deleteId));
        Toast.success('Lead deleted successfully');
      } catch (e) {
        Toast.error('Failed to delete lead');
      } finally {
        setDeleteId(null);
      }
    }
  };

  const filteredLeads = leads
    .filter(lead => {
      const search = searchQuery.toLowerCase();
      const fullName = `${lead.first_name || ''} ${
        lead.last_name || ''
      }`.toLowerCase();
      const company = (lead.company_name || '').toLowerCase();
      const email = (lead.email || '').toLowerCase();

      const matchesSearch =
        fullName.includes(search) ||
        company.includes(search) ||
        email.includes(search);
      const matchesStatus =
        statusFilter === 'ALL' || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.status === 'NEW' && b.status !== 'NEW') return -1;
      if (a.status !== 'NEW' && b.status === 'NEW') return 1;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return theme.info;
      case 'CONTACTED':
        return theme.primary;
      case 'QUALIFIED':
        return theme.accent.green;
      case 'LOST':
        return theme.textMuted;
      case 'CONVERTED':
        return theme.success;
      default:
        return theme.textMuted;
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('LeadEdit', { lead: item } as any)
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>
                {item.first_name} {item.last_name}
              </Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getStatusColor(item.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.company}>
              {item.company_name || 'No Company'}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={14} color={theme.textMuted} />
              <Text style={styles.infoText}>{item.email}</Text>
            </View>

            {item.phone && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="call-outline"
                  size={14}
                  color={theme.textMuted}
                />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Footer */}
        <View style={styles.actionFooter}>
          {item.status !== 'CONVERTED' && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { borderRightWidth: 1, borderRightColor: theme.border },
              ]}
              onPress={() => handleOpenConvert(item)}
            >
              <Ionicons
                name="git-network-outline"
                size={18}
                color={theme.success}
              />
              <Text style={[styles.actionText, { color: theme.success }]}>
                Convert
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { borderRightWidth: 1, borderRightColor: theme.border },
            ]}
            onPress={() =>
              navigation.navigate('LeadEdit', { lead: item } as any)
            }
          >
            <Ionicons name="pencil" size={18} color={theme.info} />
            <Text style={[styles.actionText, { color: theme.info }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[styles.actionText, { color: theme.danger }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header / Search Area */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.textMuted}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            statusFilter !== 'ALL' && { backgroundColor: theme.primary + '20' },
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={statusFilter !== 'ALL' ? theme.primary : theme.text}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={filteredLeads}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No leads found.</Text>
            </View>
          }
        />
      )}

      {/* FAB to Add Lead */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLead')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deleteId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setDeleteId(null)}
          />
          <View style={[styles.modalContent, { paddingBottom: 30 }]}>
            <Text style={styles.modalTitle}>Delete Lead</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this lead? This action cannot be
              undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setDeleteId(null)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalBtnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Convert Confirmation Modal */}
      <Modal
        visible={!!convertLeadData}
        transparent
        animationType="fade"
        onRequestClose={() => setConvertLeadData(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setConvertLeadData(null)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Convert to Opportunity</Text>
              <Text style={styles.modalText}>
                Enter a name for the new opportunity:
              </Text>

              <TextInput
                style={styles.modalInput}
                value={opportunityName}
                onChangeText={setOpportunityName}
                placeholder="Opportunity Name"
                placeholderTextColor={theme.textMuted}
                autoFocus
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setConvertLeadData(null)}
                >
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnConvert]}
                  onPress={confirmConvert}
                >
                  <Text style={styles.modalBtnDeleteText}>Convert</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'].map(
              status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    statusFilter === status && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setStatusFilter(status);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      statusFilter === status && { color: theme.primary },
                    ]}
                  >
                    {status}
                  </Text>
                  {statusFilter === status && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              ),
            )}
          </TouchableOpacity>
        </TouchableOpacity>
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
    header: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      alignItems: 'center',
    },
    searchContainer: {
      flex: 1,
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
      color: theme.text,
      fontSize: 16,
    },
    filterBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 80,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 16,
      paddingBottom: 0,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    company: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 12,
      fontWeight: '500',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    infoText: {
      color: theme.textMuted,
      fontSize: 14,
    },
    actionFooter: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background, // Clean background
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 6,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
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
      elevation: 5,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    filterOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterOptionActive: {
      backgroundColor: theme.background,
    },
    filterOptionText: {
      fontSize: 16,
      color: theme.text,
    },
    modalText: {
      color: theme.text,
      fontSize: 16,
      marginBottom: 24,
      lineHeight: 22,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBtnCancel: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalBtnDelete: {
      backgroundColor: theme.danger,
    },
    modalBtnCancelText: {
      color: theme.text,
      fontWeight: '600',
      fontSize: 16,
    },
    modalBtnDeleteText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 24,
      backgroundColor: theme.background,
    },
    modalBtnConvert: {
      backgroundColor: theme.success,
    },
  });
