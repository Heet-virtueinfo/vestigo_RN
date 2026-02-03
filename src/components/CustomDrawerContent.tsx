import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
  Image,
} from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import Colors from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawerContent(props: any) {
  const drawerNavigation = props.navigation;
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const { signOut, user } = useAuth();
  const styles = getStyles(theme);

  const drawerState = props.state;
  const tabState = drawerState?.routes?.[drawerState.index || 0]?.state;
  const activeTabName = tabState?.routes?.[tabState.index || 0]?.name;
  const activeTabNestedState = tabState?.routes?.[tabState.index || 0]?.state;
  const activeNestedName =
    activeTabNestedState?.routes?.[activeTabNestedState.index || 0]?.name;

  const isActive = (route: string) => {
    if (activeNestedName) {
      if (route === 'Dashboard' && activeNestedName === 'DashboardHome')
        return true;
      return route === activeNestedName;
    }
    return route === activeTabName;
  };

  const renderDrawerItem = (label: string, route: string, iconName: string) => {
    const active = isActive(route);

    return (
      <DrawerItem
        label={label}
        icon={({ size }) => (
          <Ionicons
            name={active ? iconName : `${iconName}-outline`}
            size={22}
            color={active ? '#fff' : theme.textMuted}
          />
        )}
        focused={active}
        activeTintColor="#fff"
        activeBackgroundColor={theme.primary}
        inactiveTintColor={theme.text}
        labelStyle={{
          fontFamily: 'System',
          fontWeight: '600',
          fontSize: 15,
          color: active ? '#fff' : theme.text,
          marginLeft: -2,
        }}
        style={{
          borderRadius: 12,
          marginHorizontal: 16,
          marginVertical: 2,
          paddingVertical: 2,
          justifyContent: 'center',
        }}
        onPress={() =>
          drawerNavigation.navigate('Home', {
            screen: 'Dashboard',
            params: { screen: route },
          })
        }
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Modern Profile Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            drawerNavigation.navigate('Home', {
              screen: 'Dashboard',
              params: { screen: 'DashboardHome' },
            })
          }
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'Admin'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || 'admin@vestigo.com'}
              </Text>
              <Text style={styles.profileLink}>View profile</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View style={styles.itemsContainer}>
          {renderDrawerItem('Claims', 'Claims', 'albums')}
          {renderDrawerItem('Underwriting', 'Underwriting', 'create')}
          {renderDrawerItem(
            'Reconciliation',
            'Reconciliation',
            'checkmark-done-circle',
          )}
          {renderDrawerItem('Reports', 'Reports', 'bar-chart')}
          {renderDrawerItem('Late Charges', 'LateCharges', 'alert-circle')}
          {renderDrawerItem('Settings', 'Settings', 'settings')}
        </View>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => signOut()}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0 (Build 124)</Text>
      </View>
    </View>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    headerContainer: {
      padding: 24,
      paddingTop: 60,
      backgroundColor: theme.primary,
      marginBottom: 16,
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
    userInfo: {
      marginLeft: 16,
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4,
    },
    profileLink: {
      fontSize: 12,
      color: '#fff',
      fontWeight: '600',
      opacity: 0.9,
      textDecorationLine: 'underline',
    },
    itemsContainer: {
      paddingHorizontal: 4,
    },
    footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    logoutIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.error + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.error,
    },
    versionText: {
      fontSize: 12,
      color: theme.textMuted,
      textAlign: 'center',
      opacity: 0.6,
    },
  });
