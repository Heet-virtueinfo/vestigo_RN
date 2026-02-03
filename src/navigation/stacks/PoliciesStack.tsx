import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from '../../components/CustomHeader';
import PoliciesListScreen from '../../screens/policies/PoliciesListScreen';
import PolicyDetailScreen from '../../screens/policies/PolicyDetailScreen';

const Stack = createNativeStackNavigator();

export default function PoliciesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="PoliciesList"
        component={PoliciesListScreen}
        options={{
          header: () => <CustomHeader title="Policies" showMenu={true} />,
        }}
      />
      <Stack.Screen
        name="PolicyDetail"
        component={PolicyDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
