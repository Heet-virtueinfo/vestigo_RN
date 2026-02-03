import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import Colors from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface CustomHeaderProps {
  title?: string;
  showMenu?: boolean;
}

export default function CustomHeader({
  title = 'Vestigo',
  showMenu = true,
}: CustomHeaderProps) {
  const navigation = useNavigation<any>();
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'VS';

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleNotificationPress = () => {
    // Assuming Notification is a screen in the root or main stack
    navigation.navigate('Notification');
  };

  const handleProfilePress = () => {
    // Profile is likely in the Drawer or Main Stack
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Left: Menu Button */}
        <View style={styles.leftContainer}>
          {showMenu && (
            <TouchableOpacity onPress={openDrawer} style={styles.iconButton}>
              <Ionicons name="menu" size={26} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right: Actions (Notification + Avatar) */}
        <View style={styles.rightContainer}>
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.iconButton}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.text}
            />
            {/* Optional: Add a red dot for unread notifications here */}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleProfilePress}
            style={[styles.avatar, { borderColor: theme.border }]}
          >
            <Text style={[styles.avatarText, { color: 'white' }]}>
              {initials}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme.background,
      // Add subtle shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
      zIndex: 10,
    },
    container: {
      height: 60, // Slightly taller for premium feel
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    leftContainer: {
      flex: 1,
      alignItems: 'flex-start',
    },
    titleContainer: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700', // Bolder
      color: theme.text,
      letterSpacing: 0.5,
    },
    iconButton: {
      padding: 4,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    avatarText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
