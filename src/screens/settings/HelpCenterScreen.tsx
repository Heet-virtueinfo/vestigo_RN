import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/theme';

const CATEGORIES = [
  {
    name: 'Sales & BDM',
    icon: 'chatbubbles-outline',
    steps: [
      {
        title: 'Create a Lead',
        desc: 'Go to Leads > New Lead. Enter prospect details.',
      },
      {
        title: 'Qualify Opportunity',
        desc: 'Convert Lead to Opportunity. Move card to "Qualified".',
      },
      {
        title: 'Generate Quote',
        desc: 'Move to "Quote Sent". This enables the Underwriting submission.',
      },
      {
        title: 'Submit for Review',
        desc: 'Click "Submit for Underwriting" on the Kanban card.',
      },
    ],
  },
  {
    name: 'Underwriting',
    icon: 'shield-checkmark-outline',
    steps: [
      {
        title: 'Receive Request',
        desc: 'Check the Notification bell or go to "Underwriting" from sidebar.',
      },
      {
        title: 'Review Risk',
        desc: 'Analyze applicant data and requested premium.',
      },
      {
        title: 'Approve',
        desc: 'Click "Approve & Issue Policy". This automatically generates the Policy.',
      },
      { title: 'Reject', desc: 'Click Reject. The BDM will be notified.' },
    ],
  },
  {
    name: 'Claims',
    icon: 'clipboard-outline',
    steps: [
      {
        title: 'File Claim',
        desc: 'Go to Claims > File New Claim. Select the active Policy.',
      },
      {
        title: 'Initial Review',
        desc: 'Status starts as "Reported". Review documents.',
      },
      {
        title: 'Process',
        desc: 'Update status to "In Progress" or "Approved".',
      },
    ],
  },
  {
    name: 'Reconciliation',
    icon: 'swap-horizontal-outline',
    steps: [
      {
        title: 'Upload Statement',
        desc: 'Go to Reconciliation. Upload CSV bank statement.',
      },
      {
        title: 'Auto Match',
        desc: 'Click "Run Auto Match". System matches exact amounts.',
      },
      {
        title: 'Manual Match',
        desc: 'For unmatched lines, enter Policy ID manually.',
      },
    ],
  },
];

export default function HelpCenterScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, activeCategory === index && styles.tabActive]}
              onPress={() => setActiveCategory(index)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={activeCategory === index ? '#fff' : theme.primary}
              />
              <Text
                style={[
                  styles.tabText,
                  activeCategory === index && styles.tabTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {CATEGORIES[activeCategory].name} Guide
          </Text>

          <View style={styles.timeline}>
            {CATEGORIES[activeCategory].steps.map((step, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.timelineLeft]}>
                  <View style={styles.timelineCircle}>
                    <Text style={styles.stepNum}>{index + 1}</Text>
                  </View>
                  {index !== CATEGORIES[activeCategory].steps.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    tabsContainer: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    tabsContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tabActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.primary,
    },
    tabTextActive: {
      color: '#fff',
    },
    content: {
      padding: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 24,
    },
    timeline: {},
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 0,
    },
    timelineLeft: {
      alignItems: 'center',
      marginRight: 16,
      width: 30,
    },
    timelineCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    stepNum: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primary,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: theme.border,
      marginVertical: 4,
      minHeight: 40,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: 24,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
      marginTop: 4,
    },
    stepDesc: {
      fontSize: 14,
      color: theme.textMuted,
      lineHeight: 20,
    },
  });
