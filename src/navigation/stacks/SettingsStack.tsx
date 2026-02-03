import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../../screens/settings/SettingsScreen';
import HelpCenterScreen from '../../screens/settings/HelpCenterScreen';
import CustomHeader from '../../components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ route, options }) => (
          <CustomHeader title={options.title || 'Settings'} showMenu={true} />
        ),
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Settings" showMenu={true} />,
        }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Help Center" showMenu={false} />,
        }}
      />
    </Stack.Navigator>
  );
}
