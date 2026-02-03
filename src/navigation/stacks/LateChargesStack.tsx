import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LateChargesListScreen from '../../screens/lateCharges/LateChargesListScreen';
import LateChargeDetailScreen from '../../screens/lateCharges/LateChargeDetailScreen';
import CustomHeader from '../../components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function LateChargesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="LateCharges"
        component={LateChargesListScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Late Charges" showMenu={true} />,
        }}
      />
      <Stack.Screen
        name="LateChargeDetail"
        component={LateChargeDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
