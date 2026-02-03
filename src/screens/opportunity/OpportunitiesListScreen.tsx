import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import { useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  getOpportunities,
  moveOpportunityStage,
  submitForUnderwriting,
} from '../../services/service';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Colors from '../../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';

const STAGES = {
  ALL: 'All',
  DISCOVERY: 'Discovery',
  QUOTE: 'Quote Sent',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
};

const STAGE_COLORS: any = {
  DISCOVERY: 'info',
  QUOTE: 'accent.purple',
  NEGOTIATION: 'warning',
  CLOSED_WON: 'success',
  CLOSED_LOST: 'danger',
};

export default function OpportunitiesListScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStage, setActiveStage] = useState('ALL');

  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);

  const fetchOpportunities = async () => {
    try {
      const data = await getOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOpportunities();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOpportunities();
  };

  // --- Stats Calculation ---
  const totalDeals = opportunities.length;
  const pipelineValue = opportunities.reduce(
    (sum, o) => sum + (parseFloat(o.expected_revenue) || 0),
    0,
  );
  const weightedValue = opportunities.reduce(
    (sum, o) =>
      sum +
      ((parseFloat(o.expected_revenue) || 0) * (parseInt(o.probability) || 0)) /
        100,
    0,
  );

  // --- Filtering ---
  const filteredOpps =
    activeStage === 'ALL'
      ? opportunities
      : opportunities.filter(o => o.stage === activeStage);

  // --- Actions ---
  const handleOpenMove = (opp: any) => {
    setSelectedOpp(opp);
    setMoveModalVisible(true);
  };

  const confirmMove = async (newStage: string) => {
    if (!selectedOpp) return;
    try {
      await moveOpportunityStage(selectedOpp.id, newStage);
      setOpportunities(prev =>
        prev.map(o =>
          o.id === selectedOpp.id ? { ...o, stage: newStage } : o,
        ),
      );
      Toast.success(`Moved to ${STAGES[newStage as keyof typeof STAGES]}`);
      setMoveModalVisible(false);
      setSelectedOpp(null);
    } catch (error) {
      Toast.error('Failed to move stage');
    }
  };

  const handleSubmitUnderwriting = async (opp: any) => {
    try {
      await submitForUnderwriting(opp.id);
      Toast.success('Submitted for Underwriting');
    } catch (error) {
      Toast.error('Submission failed or already submitted');
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'DISCOVERY':
        return theme.info;
      case 'QUOTE':
        return '#8B5CF6'; // Purple
      case 'NEGOTIATION':
        return theme.warning; // or amber
      case 'CLOSED_WON':
        return theme.success;
      case 'CLOSED_LOST':
        return theme.danger;
      default:
        return theme.textMuted;
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <View
        style={[
          styles.card,
          { borderLeftColor: getStageColor(item.stage), borderLeftWidth: 4 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('EditOpportunity', { opportunity: item })
          }
          style={styles.cardContent}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <View
              style={[
                styles.stageBadge,
                { backgroundColor: getStageColor(item.stage) + '20' },
              ]}
            >
              <Text
                style={[styles.stageText, { color: getStageColor(item.stage) }]}
              >
                {STAGES[item.stage as keyof typeof STAGES] || item.stage}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Premium</Text>
              <Text style={styles.statValue}>
                ${parseFloat(item.expected_revenue || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Probability</Text>
              <Text style={styles.statValue}>{item.probability}%</Text>
            </View>
          </View>

          {item.notes ? (
            <Text style={styles.notes} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </TouchableOpacity>

        {/* Action Footer */}
        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleOpenMove(item)}
          >
            <Ionicons name="swap-horizontal" size={18} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>
              Move
            </Text>
          </TouchableOpacity>

          {item.stage === 'QUOTE' && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleSubmitUnderwriting(item)}
            >
              <Ionicons
                name="arrow-forward-circle-outline"
                size={18}
                color={theme.accent.green}
              />
              <Text style={[styles.actionText, { color: theme.accent.green }]}>
                Submit
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('EditOpportunity', { opportunity: item })
            }
          >
            <Ionicons name="create-outline" size={18} color={theme.textMuted} />
            <Text style={[styles.actionText, { color: theme.textMuted }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={{ height: 100 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
            <Text style={[styles.statCardLabel, { color: '#4F46E5' }]}>
              TOTAL DEALS
            </Text>
            <Text style={[styles.statCardValue, { color: '#312E81' }]}>
              {totalDeals}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.statCardLabel, { color: '#16A34A' }]}>
              PIPELINE VALUE
            </Text>
            <Text style={[styles.statCardValue, { color: '#14532D' }]}>
              ${pipelineValue.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FAF5FF' }]}>
            <Text style={[styles.statCardLabel, { color: '#9333EA' }]}>
              WEIGHTED VALUE
            </Text>
            <Text style={[styles.statCardValue, { color: '#581C87' }]}>
              $
              {weightedValue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(STAGES).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.tab,
                activeStage === key && {
                  backgroundColor: theme.primary + '15',
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveStage(key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeStage === key && {
                    color: theme.primary,
                    fontWeight: 'bold',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={filteredOpps}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No opportunities found.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}

      {/* Move Stage Modal */}
      <Modal
        visible={moveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMoveModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move to Stage</Text>
            {Object.entries(STAGES)
              .filter(([key]) => key !== 'ALL' && key !== selectedOpp?.stage)
              .map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.modalOption}
                  onPress={() => confirmMove(key)}
                >
                  <View
                    style={[
                      styles.modalOptionBadge,
                      { backgroundColor: getStageColor(key) + '20' },
                    ]}
                  >
                    <Ionicons
                      name="ellipse"
                      size={10}
                      color={getStageColor(key)}
                    />
                  </View>
                  <Text style={styles.modalOptionText}>{label}</Text>
                </TouchableOpacity>
              ))}
          </View>
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
    statsContainer: {
      padding: 16,
      gap: 12,
    },
    statCard: {
      padding: 16,
      borderRadius: 16,
      minWidth: 140,
      justifyContent: 'center',
    },
    statCardLabel: {
      fontSize: 10,
      fontWeight: '700',
      marginBottom: 4,
    },
    statCardValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    tabsContainer: {
      paddingHorizontal: 16,
      marginBottom: 8,
      height: 50,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 8,
      backgroundColor: theme.card,
      height: 36,
      justifyContent: 'center',
    },
    tabText: {
      fontSize: 13,
      color: theme.textMuted,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
      paddingBottom: 80,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardContent: {
      padding: 16,
      paddingBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    stageBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    stageText: {
      fontSize: 10,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: 8,
    },
    stat: {},
    statLabel: {
      fontSize: 11,
      color: theme.textMuted,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    notes: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 4,
      fontStyle: 'italic',
    },
    actionFooter: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingVertical: 8,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '600',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
    },
    emptyText: {
      color: theme.textMuted,
      fontSize: 16,
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
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalOptionBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    modalOptionText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
  });
