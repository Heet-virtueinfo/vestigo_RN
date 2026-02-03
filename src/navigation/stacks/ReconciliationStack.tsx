import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReconciliationScreen from '../../screens/reconciliation/ReconciliationScreen';
import CustomHeader from '../../components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function ReconciliationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ route, options }) => (
          <CustomHeader
            title={options.title || 'Reconciliation'}
            showMenu={true}
          />
        ),
      }}
    >
      <Stack.Screen
        name="ReconciliationHome"
        component={ReconciliationScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Reconciliation" showMenu={true} />,
        }}
      />
    </Stack.Navigator>
  );
}
