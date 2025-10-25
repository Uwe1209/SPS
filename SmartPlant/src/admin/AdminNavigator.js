import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminProvider, useAdminContext } from './AdminContext';
import { View, Text, StyleSheet } from 'react-native';

import DashboardScreen from './screens/DashboardScreen';
import AccountManagementScreen from './screens/AccountManagementScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import AddUserScreen from './screens/AddUserScreen';
import MailManagementScreen from './screens/MailManagementScreen';
import MailDetailScreen from './screens/MailDetailScreen';
import FeedbackManagementScreen from './screens/FeedbackManagementScreen';
import FeedbackDetailScreen from './screens/FeedbackDetailScreen';

const Stack = createStackNavigator();

const Toast = () => {
    const { toastMessage } = useAdminContext();

    if (!toastMessage) return null;

    return (
        <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
    );
};

const AdminScreens = () => {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="AccountManagement" component={AccountManagementScreen} />
                <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                <Stack.Screen name="AddUser" component={AddUserScreen} />
                <Stack.Screen name="MailManagement" component={MailManagementScreen} />
                <Stack.Screen name="MailDetail" component={MailDetailScreen} />
                <Stack.Screen name="FeedbackManagement" component={FeedbackManagementScreen} />
                <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
            </Stack.Navigator>
            <Toast />
        </View>
    );
};

const AdminNavigator = () => {
    return (
        <AdminProvider>
            <AdminScreens />
        </AdminProvider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        bottom: 80, // Position above a potential tab bar
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    toastText: {
        color: 'white',
    },
});

export default AdminNavigator;
