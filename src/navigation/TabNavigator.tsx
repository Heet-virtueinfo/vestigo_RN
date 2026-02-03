import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import CustomHeader from '../components/CustomHeader';
import LeadsStack from './stacks/LeadsStack';
import OpportunityStack from './stacks/OpportunityStack';
import PoliciesStack from './stacks/PoliciesStack';
import DashboardStack from './stacks/DashboardStack';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.background,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Leads') iconName = 'people-outline';
          else if (route.name === 'Opportunity') iconName = 'bulb-outline';
          else if (route.name === 'Policies')
            iconName = 'document-text-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadsStack}
        options={{
          title: 'Leads',
          tabBarLabel: 'Leads',
        }}
      />
      <Tab.Screen
        name="Opportunity"
        component={OpportunityStack}
        options={{
          title: 'Opportunity',
          tabBarLabel: 'Opportunity',
        }}
      />
      <Tab.Screen
        name="Policies"
        component={PoliciesStack}
        options={{
          title: 'Policies',
          tabBarLabel: 'Policies',
        }}
      />
    </Tab.Navigator>
  );
}
