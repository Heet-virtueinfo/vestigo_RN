import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UnderwritingListScreen from '../../screens/underwriting/UnderwritingListScreen';
import SubmissionDetailScreen from '../../screens/underwriting/SubmissionDetailScreen';
import CustomHeader from '../../components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function UnderwritingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="UnderwritingList"
        component={UnderwritingListScreen}
        options={{
          header: () => (
            <CustomHeader title="Underwriting Queue" showMenu={true} />
          ),
        }}
      />
      <Stack.Screen
        name="SubmissionDetail"
        component={SubmissionDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
