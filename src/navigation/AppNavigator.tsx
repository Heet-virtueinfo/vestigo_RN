import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LeadsStack from './stacks/LeadsStack';
import ReconciliationStack from './stacks/ReconciliationStack';
import ClaimsStack from './stacks/ClaimsStack';
import ReportsStack from './stacks/ReportsStack';
import SettingsStack from './stacks/SettingsStack';
import UnderwritingStack from './stacks/UnderwritingStack';
import PoliciesStack from './stacks/PoliciesStack';
import OpportunityStack from './stacks/OpportunityStack';
import DrawerNavigator from './DrawerNavigator';
import LateChargesStack from './stacks/LateChargesStack';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      <Stack.Screen name="LeadStack" component={LeadsStack} />
      <Stack.Screen
        name="ReconciliationStack"
        component={ReconciliationStack}
      />
      <Stack.Screen name="ClaimsStack" component={ClaimsStack} />
      <Stack.Screen name="LateChargesStack" component={LateChargesStack} />
      <Stack.Screen name="ReportsStack" component={ReportsStack} />
      <Stack.Screen name="SettingsStack" component={SettingsStack} />
      <Stack.Screen name="UnderwritingStack" component={UnderwritingStack} />
      <Stack.Screen name="PoliciesStack" component={PoliciesStack} />
      <Stack.Screen name="OpportunityStack" component={OpportunityStack} />
    </Stack.Navigator>
  );
}
