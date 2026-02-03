import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/theme';
import { Toast } from '../../components/GlobalToast';

// Matching functionality from web: frontend/vestigo_frontend/src/pages/settings/Settings.jsx
const settingsSections = [
  {
    title: 'General',
    description: 'Manage account preferences and profile.',
    actions: [
      {
        label: 'Profile (coming soon)',
        icon: 'shield-checkmark-outline',
        disabled: true,
      },
    ],
  },
  {
    title: 'Notifications',
    description: 'Control how you receive alerts.',
    actions: [
      {
        label: 'Notification Preferences (coming soon)',
        icon: 'notifications-outline',
        disabled: true,
      },
    ],
  },
  {
    title: 'Support',
    description: 'Find docs and get help.',
    actions: [
      {
        label: 'Late Charge Policies',
        route: 'LateChargePolicies',
        icon: 'document-text-outline',
      },
      {
        label: 'Help Center',
        url: 'https://vestigo.com/help',
        icon: 'help-circle-outline',
      },
      {
        label: 'Contact Support (coming soon)',
        icon: 'chatbubble-ellipses-outline',
        disabled: true,
      },
    ],
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const theme = Colors[systemScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(theme);

  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  const handleAction = (action: any) => {
    if (action.disabled) {
      return;
    }

    if (action.url) {
      Linking.openURL(action.url);
    } else if (action.route) {
      if (action.label === 'Late Charge Policies') {
        Toast.info('Policies info would open here');
      } else {
        navigation.navigate(action.route);
      }
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    setTimeout(() => {
      Toast.success('Logged out successfully');
      // In a real app: logout();
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>
            Organized place for infrequent links and preferences.
          </Text>
        </View>

        <View style={styles.grid}>
          {settingsSections.map((section, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDesc}>{section.description}</Text>
              </View>

              <View style={styles.actionsList}>
                {section.actions.map((action: any, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={action.disabled ? 1 : 0.7}
                    onPress={() => handleAction(action)}
                    style={[
                      styles.actionBtn,
                      action.disabled
                        ? styles.actionDisabled
                        : styles.actionEnabled,
                    ]}
                  >
                    <Ionicons
                      name={action.icon}
                      size={20}
                      color={action.disabled ? theme.textMuted : theme.primary}
                    />
                    <Text
                      style={[
                        styles.actionLabel,
                        action.disabled
                          ? { color: theme.textMuted }
                          : { color: theme.primary },
                      ]}
                    >
                      {action.label.replace(' (coming soon)', '')}
                    </Text>
                    {action.disabled && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Soon</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDestructive}
                onPress={confirmLogout}
              >
                <Text style={styles.modalDestructiveText}>Logout</Text>
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
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    headerBlock: {
      marginBottom: 24,
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    pageSubtitle: {
      fontSize: 14,
      color: theme.textMuted,
    },
    grid: {
      gap: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    cardHeader: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    sectionDesc: {
      fontSize: 13,
      color: theme.textMuted,
    },
    actionsList: {
      gap: 12,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionEnabled: {
      backgroundColor: theme.primary + '10', // 10% opacity
      borderColor: theme.primary + '30',
    },
    actionDisabled: {
      backgroundColor: theme.background,
      borderColor: theme.border,
    },
    actionLabel: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    badge: {
      marginLeft: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: theme.border,
    },
    badgeText: {
      fontSize: 10,
      color: theme.textMuted,
      fontWeight: '600',
    },
    logoutBtn: {
      marginTop: 32,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.danger + '30',
      backgroundColor: theme.danger + '10',
      gap: 8,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.danger,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
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
      marginBottom: 24,
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
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalDestructive: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.danger,
      alignItems: 'center',
    },
    modalCancelText: {
      color: theme.text,
      fontWeight: '600',
    },
    modalDestructiveText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
