import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsScreen from '../../screens/reports/ReportsScreen';
import CustomHeader from '../../components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function ReportsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ route, options }) => (
          <CustomHeader title={options.title || 'Reports'} showMenu={true} />
        ),
      }}
    >
      <Stack.Screen
        name="ReportsHome"
        component={ReportsScreen}
        options={{
          headerShown: true,
          header: () => (
            <CustomHeader title="Executive Reports" showMenu={true} />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
