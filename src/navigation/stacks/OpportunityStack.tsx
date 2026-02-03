import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from '../../components/CustomHeader';
import OpportunitiesListScreen from '../../screens/opportunity/OpportunitiesListScreen';
import EditOpportunityScreen from '../../screens/opportunity/EditOpportunityScreen';

const Stack = createNativeStackNavigator();

export default function OpportunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="OpportunitiesList"
        component={OpportunitiesListScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Sales Pipeline" showMenu={true} />,
        }}
      />
      <Stack.Screen
        name="EditOpportunity"
        component={EditOpportunityScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
