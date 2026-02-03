import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import Colors from '../../constants/theme';
import { getAdvancedReports } from '../../services/service';
import LoadingScreen from '../../components/LoadingScreen';
import { Toast } from '../../components/GlobalToast';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>(
    'month',
  );
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getAdvancedReports(timeRange);
      setData(response);
      processChartData(response.performance_data || []);
    } catch (error) {
      console.error(error);
      Toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (perfData: any[]) => {
    if (!perfData.length) {
      setChartData(null);
      return;
    }
    const labels = perfData.map((d: any) => d.name);
    // Divide by 1000 to show in 'k' units
    const sales = perfData.map((d: any) => d.sales / 1000);
    const claims = perfData.map((d: any) => d.claims / 1000);

    setChartData({
      labels,
      datasets: [
        {
          data: sales,
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo
          strokeWidth: 2,
        },
        {
          data: claims,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red
          strokeWidth: 2,
        },
      ],
      legend: ['New Sales', 'Claims Paid'],
    });
  };

  if (loading && !data) return <LoadingScreen />;

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.textMuted,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.card,
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.segmentContainer}>
            {(['month', 'quarter', 'year'] as const).map(r => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.segmentBtn,
                  timeRange === r && styles.segmentBtnActive,
                ]}
                onPress={() => setTimeRange(r)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    timeRange === r && styles.segmentTextActive,
                  ]}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <View style={styles.chartTypeToggle}>
              <TouchableOpacity
                onPress={() => setChartType('bar')}
                style={[
                  styles.toggleBtn,
                  chartType === 'bar' && styles.toggleBtnActive,
                ]}
              >
                <Ionicons
                  name="bar-chart"
                  size={16}
                  color={chartType === 'bar' ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('line')}
                style={[
                  styles.toggleBtn,
                  chartType === 'line' && styles.toggleBtnActive,
                ]}
              >
                <Ionicons
                  name="pulse"
                  size={16}
                  color={chartType === 'line' ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {chartData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {chartType === 'bar' ? (
                <BarChart
                  data={chartData}
                  width={Math.max(width - 48, chartData.labels.length * 80)}
                  height={250}
                  yAxisLabel=""
                  yAxisSuffix="k"
                  chartConfig={chartConfig}
                  verticalLabelRotation={0}
                  showBarTops={false}
                  fromZero
                  segments={4}
                />
              ) : (
                <LineChart
                  data={chartData}
                  width={Math.max(width - 48, chartData.labels.length * 80)}
                  height={250}
                  yAxisLabel=""
                  yAxisSuffix="k"
                  chartConfig={chartConfig}
                  bezier
                  fromZero
                  segments={4}
                />
              )}
            </ScrollView>
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>
                No data available for this period
              </Text>
            </View>
          )}
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Gross Written Premium"
            value={`$${(data?.total_premium || 0).toLocaleString()}`}
            percent={70}
            subtext="70% of yearly target"
            color={theme.accent.green}
            theme={theme}
            styles={styles}
          />
          <MetricCard
            title="Avg Claim Processing"
            value={`${data?.avg_claim_processing || 0} Days`}
            percent={Math.min(
              ((10 - (data?.avg_claim_processing || 0)) / 10) * 100,
              100,
            )}
            subtext={data?.processing_benchmark || 'Calculating...'}
            color={theme.accent.blue}
            theme={theme}
            styles={styles}
          />
          <MetricCard
            title="Customer Retention"
            value={`${data?.customer_retention || 0}%`}
            percent={data?.customer_retention || 0}
            subtext={`${data?.retention_change || '0%'} from last period`}
            color={theme.accent.purple}
            theme={theme}
            styles={styles}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MetricCard = ({
  title,
  value,
  percent,
  subtext,
  color,
  theme,
  styles,
}: any) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <View style={styles.progressContainer}>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
    <Text style={styles.metricSubtext}>{subtext}</Text>
  </View>
);

function getStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitleContainer: {},
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textMuted,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    controlsContainer: {
      marginBottom: 16,
    },
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
    },
    segmentBtnActive: {
      backgroundColor: theme.primary,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },
    segmentTextActive: {
      color: '#fff',
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
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    chartTypeToggle: {
      flexDirection: 'row',
      gap: 8,
    },
    toggleBtn: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: theme.background,
    },
    toggleBtnActive: {
      backgroundColor: theme.primary + '20',
    },
    noData: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noDataText: {
      color: theme.textMuted,
    },
    metricsGrid: {
      gap: 16,
    },
    metricCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    metricTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textMuted,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    progressContainer: {
      marginBottom: 8,
    },
    progressBg: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    metricSubtext: {
      fontSize: 12,
      color: theme.textMuted,
    },
  });
}
