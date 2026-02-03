import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from '../../components/CustomHeader';
import LeadsListScreen from '../../screens/leads/LeadsListScreen';
import AddLeadScreen from '../../screens/leads/AddLeadScreen';
import EditLeadScreen from '../../screens/leads/EditLeadScreen';

const Stack = createNativeStackNavigator();

export default function LeadsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="LeadList"
        component={LeadsListScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Leads" showMenu={true} />,
        }}
      />
      <Stack.Screen
        name="AddLead"
        component={AddLeadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LeadEdit"
        component={EditLeadScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
