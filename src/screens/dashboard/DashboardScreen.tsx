import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import {
  QuickAction,
  MetricCard,
  ActivityRow,
  PipelineChart,
  PremiumTrendChart,
  PolicyMixWidget,
  NotificationRow,
  RenewalRow,
} from '../../components/DashboardWidgets';
import LoadingScreen from '../../components/LoadingScreen';
import { getDashboardStats } from '../../services/service';
import Colors from '../../constants/theme';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
      // Optionally handle error state
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return <LoadingScreen message="Loading Dashboard..." />;
  }

  // Derived Stats
  const pipelineCount = stats?.pipeline
    ? stats.pipeline.reduce((acc: number, curr: any) => acc + curr.count, 0)
    : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>
          Executive Dashboard
        </Text>
        <Text style={[styles.subText, { color: theme.textMuted }]}>
          Overview of your operations
        </Text>
      </View>
      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="person-add"
            label="Add Lead"
            color={theme.accent.blue}
            onPress={() => navigation.navigate('Leads')}
          />
          <QuickAction
            icon="document-text"
            label="New Quote"
            color={theme.accent.green}
            onPress={() => navigation.navigate('Policies')}
          />
          <QuickAction
            icon="warning"
            label="File Claim"
            color={theme.accent.red}
            onPress={() => navigation.navigate('Claims')}
          />
          <QuickAction
            icon="bar-chart"
            label="Reports"
            color={theme.accent.purple}
            onPress={() => navigation.navigate('Reports')}
          />
        </View>
      </View>
      {/* Metrics Grid */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Key Metrics
        </Text>
      </View>
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Premium"
          value={`$${stats?.total_premium?.toLocaleString() || '0'}`}
          subtitle={`${stats?.premium_growth ?? 0}% from last month`}
          icon="cash-outline"
          color={theme.accent.blue}
          trend={stats?.premium_growth ?? 0}
        />
        <MetricCard
          title="Claims Impact"
          value={`$${stats?.total_claims_amount?.toLocaleString() || '0'}`}
          subtitle={`LR: ${stats?.loss_ratio ?? 0}%`}
          icon="medkit-outline"
          color={theme.accent.red}
          trend={(stats?.claims_trend ?? 0) * -1}
        />
        <MetricCard
          title="Active Pipeline"
          value={`${pipelineCount} Deals`}
          subtitle={`+${stats?.new_this_week || 0} this week`}
          icon="analytics-outline"
          color={theme.accent.green}
          trend={1}
        />
        <MetricCard
          title="Underwriting"
          value={`${stats?.pending_submissions || '0'} Pending`}
          subtitle={`Avg: ${stats?.avg_underwriting_days ?? 0} days`}
          icon="people-outline"
          color={theme.accent.yellow}
          trend={0}
        />
      </View>
      {/* Pipeline Distribution */}
      {stats?.pipeline && stats.pipeline.length > 0 && (
        <PipelineChart data={stats.pipeline} />
      )}
      {/* Premium Trend */}
      {stats?.premium_trend && stats.premium_trend.length > 0 && (
        <PremiumTrendChart data={stats.premium_trend} />
      )}
      {/* Notifications */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Notifications
        </Text>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {stats?.recent_notifications?.map((notif: any, index: number) => (
          <NotificationRow
            key={notif.id}
            title={notif.title}
            message={notif.message}
            date={notif.created_at}
            type={notif.type}
            isLast={index === stats.recent_notifications.length - 1}
          />
        ))}
        {(!stats?.recent_notifications ||
          stats.recent_notifications.length === 0) && (
          <Text
            style={{ textAlign: 'center', padding: 20, color: theme.textMuted }}
          >
            All caught up!
          </Text>
        )}
      </View>
      {/* Split Row: Policy Mix & Renewals */}
      <View style={{ flexDirection: 'column', gap: 24, paddingVertical: 24 }}>
        {/* Policy Mix */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Policy Mix
            </Text>
          </View>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {stats?.policy_distribution &&
            stats.policy_distribution.length > 0 ? (
              <PolicyMixWidget data={stats.policy_distribution} />
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  padding: 20,
                  color: theme.textMuted,
                }}
              >
                No policies yet.
              </Text>
            )}
          </View>
        </View>

        {/* Expiring Soon */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Expiring Soon
            </Text>
          </View>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {stats?.upcoming_renewals?.map((renewal: any, index: number) => {
              const endDate = new Date(renewal.end_date);
              const today = new Date();
              const diffTime = Math.abs(endDate.getTime() - today.getTime());
              const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <RenewalRow
                  key={renewal.id}
                  policyNumber={renewal.policy_number}
                  customer={renewal.customer_name}
                  daysRemaining={daysRemaining}
                  isLast={index === stats.upcoming_renewals.length - 1}
                />
              );
            })}
            {(!stats?.upcoming_renewals ||
              stats.upcoming_renewals.length === 0) && (
              <Text
                style={{
                  textAlign: 'center',
                  padding: 20,
                  color: theme.textMuted,
                }}
              >
                No upcoming renewals.
              </Text>
            )}
          </View>
        </View>
      </View>
      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recent Activity
        </Text>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {stats?.recent_activities?.map((activity: any, index: number) => (
          <ActivityRow
            key={activity.id}
            type={activity.activity_type}
            note={activity.notes}
            date={activity.created_at}
            isLast={index === stats.recent_activities.length - 1}
          />
        ))}
        {(!stats?.recent_activities ||
          stats.recent_activities.length === 0) && (
          <Text
            style={{ textAlign: 'center', padding: 20, color: theme.textMuted }}
          >
            No recent activity
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});
