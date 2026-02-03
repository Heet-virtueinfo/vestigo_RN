import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from '../../components/CustomHeader';
import ClaimsListScreen from '../../screens/claims/ClaimsListScreen';
import ClaimDetailScreen from '../../screens/claims/ClaimDetailScreen';

const Stack = createNativeStackNavigator();

export default function ClaimsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="ClaimsList"
        component={ClaimsListScreen}
        options={{
          header: () => <CustomHeader title="Claims" showMenu={true} />,
        }}
      />
      <Stack.Screen
        name="ClaimDetail"
        component={ClaimDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
