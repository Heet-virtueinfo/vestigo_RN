import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from '../../components/CustomHeader';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import ClaimsStack from './ClaimsStack';
import UnderwritingStack from './UnderwritingStack';
import ReconciliationStack from './ReconciliationStack';
import ReportsStack from './ReportsStack';
import SettingsStack from './SettingsStack';
import LateChargesStack from './LateChargesStack';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Dashboard" showMenu={true} />,
        }}
      />
      <Stack.Screen
        name="Claims"
        component={ClaimsStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Underwriting"
        component={UnderwritingStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reconciliation"
        component={ReconciliationStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LateCharges"
        component={LateChargesStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
