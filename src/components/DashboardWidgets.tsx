import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/theme';
import { useColorScheme } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// --- Charts ---
export const PipelineChart = ({ data }: { data: any[] }) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  // Transform data for PieChart
  const chartColors = theme.charts;

  const chartData = data.map((item, index) => ({
    name: item.stage ? item.stage.replace('_', ' ') : item.name, // Handle both API 'stage' and mock 'name'
    population: item.count,
    color: chartColors[index % chartColors.length],
    legendFontColor: theme.textMuted,
    legendFontSize: 12,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(100)}
      style={[
        styles.chartCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.chartHeader}>
        <Ionicons
          name="pie-chart-outline"
          size={20}
          color={theme.primary}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          Pipeline Distribution
        </Text>
      </View>

      <PieChart
        data={chartData}
        width={width - 60} // Adjusted width
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        center={[10, 0]}
        absolute
        hasLegend={true}
      />
    </Animated.View>
  );
};

// --- Imports ---
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useState } from 'react';

// ... (PipelineChart remains similar)

export const PremiumTrendChart = ({ data }: { data: any[] }) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    index: number;
  } | null>(null);

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        data: data.map(d => d.premium),
        color: (opacity = 1) => theme.primary,
        strokeWidth: 2,
      },
      {
        // Invisible dataset to ensure max value scaling is controlled if needed
        data: [0],
        color: () => 'transparent',
        strokeWidth: 0,
        withDots: false,
      },
    ],
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(200)}
      style={[
        styles.chartCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.chartHeader}>
        <Ionicons
          name="stats-chart-outline"
          size={20}
          color={theme.primary}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          Premium Trend
        </Text>
      </View>

      <View style={{ position: 'relative' }}>
        <LineChart
          data={chartData}
          width={width - 50}
          height={240}
          yAxisLabel="$"
          yAxisSuffix=""
          yAxisInterval={1}
          onDataPointClick={data => {
            // Toggle tooltip
            if (tooltip?.index === data.index) {
              setTooltip(null);
            } else {
              setTooltip({
                x: data.x,
                y: data.y,
                value: data.value,
                index: data.index,
              });
            }
          }}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.primary,
            labelColor: (opacity = 1) => theme.textMuted,
            propsForDots: {
              r: '6', // Restored larger dots for tapping
              strokeWidth: '2',
              stroke: theme.card,
            },
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: theme.border,
              strokeDasharray: '5, 5',
            },
            fillShadowGradientFrom: theme.primary,
            fillShadowGradientTo: theme.card,
            fillShadowGradientFromOpacity: 0.5,
            fillShadowGradientToOpacity: 0.1,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingRight: 10,
          }}
        />

        {tooltip && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            style={{
              position: 'absolute',
              top: tooltip.y - 40,
              left: tooltip.x - 30,
              backgroundColor: theme.text, // Inverted for contrast
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              zIndex: 10,
            }}
          >
            <Text
              style={{
                color: theme.background,
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              ${tooltip.value.toLocaleString()}
            </Text>
            {/* Arrow */}
            <View
              style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                marginLeft: -4,
                width: 0,
                height: 0,
                borderLeftWidth: 4,
                borderRightWidth: 4,
                borderTopWidth: 4,
                borderStyle: 'solid',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: theme.text,
              }}
            />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

// --- Quick Action Button ---
export const QuickAction = ({ icon, label, color, onPress }: any) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  // Note: Quick Action colors are passed as props usually, but we can fallback or handle them if needed.
  // For now, they are passed from DashboardScreen. We should probably update DashboardScreen to pass theme colors too.

  return (
    <TouchableOpacity
      style={[
        styles.quickAction,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text
        style={[styles.quickActionText, { color: theme.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// --- Metric Card ---
export const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: any) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: systemScheme === 'dark' ? '#1e1e1e' : '#fff',
          borderColor: color + '40',
          borderWidth: 1,
          shadowColor: color,
          elevation: 4, // Android shadow
        },
      ]}
    >
      {/* Glass Tint Layer */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: color,
            opacity: systemScheme === 'dark' ? 0.05 : 0.03,
            borderRadius: 16,
          },
        ]}
      />

      <View style={styles.metricHeader}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: 8,
          }}
        >
          <View
            style={[
              styles.metricIcon,
              {
                backgroundColor: color + '15',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: color + '20',
                width: 32,
                height: 32,
              },
            ]}
          >
            <Ionicons name={icon} size={16} color={color} />
          </View>
          <Text
            style={[
              styles.metricTitle,
              {
                color: theme.text,
                marginLeft: 8,
                fontSize: 13,
                opacity: 0.9,
                letterSpacing: 0,
                flex: 1,
              },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.metricValue,
          {
            color: theme.text,
            fontWeight: '800',
            marginTop: 8,
            fontSize: 20,
            marginBottom: 4,
          },
        ]}
      >
        {value}
      </Text>

      {/* Title removed from here */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          {subtitle && (
            <Text
              style={[
                styles.metricSubtitle,
                { color: theme.textMuted, opacity: 0.8 },
              ]}
              numberOfLines={2}
            >
              {subtitle
                .replace(trend ? `${trend}% ` : '', '')
                .replace(trend ? `${Math.abs(trend)}% ` : '', '')}
            </Text>
          )}
        </View>

        {!!trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor:
                  trend > 0
                    ? theme.accent.green + '15'
                    : theme.accent.red + '15',
                borderColor:
                  trend > 0
                    ? theme.accent.green + '30'
                    : theme.accent.red + '30',
                borderWidth: 1,
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 6,
                alignSelf: 'flex-end',
              },
            ]}
          >
            <Ionicons
              name={trend > 0 ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={trend > 0 ? theme.accent.green : theme.accent.red}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                marginLeft: 2,
                color: trend > 0 ? theme.accent.green : theme.accent.red,
              }}
            >
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// --- Activity Row ---
export const ActivityRow = ({ type, note, date, isLast }: any) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  let iconName: string = 'radio-button-on';
  let color = theme.primary;

  // Simple mapping based on type char
  const typeChar = type ? type[0] : 'A';
  if (typeChar === 'C') {
    iconName = 'call';
    color = theme.activity.call;
  } // Call (Blue)
  if (typeChar === 'M') {
    iconName = 'people';
    color = theme.activity.meeting;
  } // Meeting (Purple)
  if (typeChar === 'N') {
    iconName = 'document-text';
    color = theme.activity.note;
  } // Note (Teal)
  if (typeChar === 'E') {
    iconName = 'mail';
    color = theme.activity.email;
  } // Email (Yellow)

  return (
    <View
      style={[
        styles.activityRow,
        { borderBottomColor: theme.border, borderBottomWidth: isLast ? 0 : 1 },
      ]}
    >
      <View style={[styles.activityIcon, { backgroundColor: color }]}>
        <Ionicons name={iconName} size={14} color="white" />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityType, { color: theme.text }]}>
          {type}{' '}
          <Text style={{ fontWeight: '400', color: theme.textMuted }}>
            {note}
          </Text>
        </Text>
        <Text style={styles.activityDate}>
          {new Date(date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

// --- Notification Row ---
export const NotificationRow = ({
  title,
  message,
  date,
  type,
  isLast,
}: any) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  let color = theme.info;
  if (type === 'WARNING') color = theme.danger;
  if (type === 'SUCCESS') color = theme.success;

  return (
    <View
      style={[
        styles.listRow,
        { borderBottomColor: theme.border, borderBottomWidth: isLast ? 0 : 1 },
      ]}
    >
      <View style={[styles.dotIndicator, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.listTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.listSubtitle, { color: theme.textMuted }]}>
          {message}
        </Text>
        <Text style={styles.listDate}>
          {new Date(date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

// --- Policy Mix Widget ---
export const PolicyMixWidget = ({ data }: { data: any[] }) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.mixContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.mixItem}>
          <View style={styles.mixHeader}>
            <Text style={[styles.mixLabel, { color: theme.text }]}>
              {item.policy_type?.replace('_', ' ').toLowerCase()}
            </Text>
            <Text style={[styles.mixValue, { color: theme.textMuted }]}>
              {item.percentage}% ({item.count})
            </Text>
          </View>
          <View
            style={[styles.progressBarBg, { backgroundColor: theme.border }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${item.percentage}%`,
                  backgroundColor: theme.primary,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

// --- Renewal Row ---
export const RenewalRow = ({
  policyNumber,
  customer,
  daysRemaining,
  isLast,
}: any) => {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  let badgeColor = theme.badge.success.bg;
  let textColor = theme.badge.success.text;

  if (daysRemaining < 7) {
    badgeColor = theme.badge.danger.bg;
    textColor = theme.badge.danger.text;
  } else if (daysRemaining < 15) {
    badgeColor = theme.badge.warning.bg;
    textColor = theme.badge.warning.text;
  }

  return (
    <View
      style={[
        styles.listRow,
        { borderBottomColor: theme.border, borderBottomWidth: isLast ? 0 : 1 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.listTitle, { color: theme.primary }]}>
          {policyNumber}
        </Text>
        <Text style={[styles.listSubtitle, { color: theme.textMuted }]}>
          {customer}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>
          {daysRemaining}d
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Quick Actions
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Metric Card
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16, // More rounded
    borderWidth: 1,
    padding: 20, // More padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Deeper shadow
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricCard: {
    width: width / 2 - 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metricIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricFooter: {
    // Legacy support if needed, though structure changed
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricSubtitle: {
    fontSize: 11,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 11,
    color: '#9ca3af',
  },

  // Generic List Row (Notifications & Renewals)
  listRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  listDate: {
    fontSize: 10,
    color: '#9ca3af',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Policy Mix
  mixContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  mixItem: {
    marginBottom: 4,
  },
  mixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mixLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  mixValue: {
    fontSize: 13,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
