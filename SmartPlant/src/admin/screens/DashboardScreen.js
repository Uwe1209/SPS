import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { UserIcon, MailIcon, FeedbackIcon } from '../Icons';

const DashboardScreen = ({ navigation }) => {
    const navigate = (screen) => navigation.navigate(screen);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: "https://placehold.co/48x48/c8b6a6/FFF?text=B" }} style={styles.avatar} />
                <View>
                    <Text style={styles.greetingText}>Good Morning</Text>
                    <Text style={styles.userName}>Bryan</Text>
                </View>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => navigate('AccountManagement')} style={styles.menuItem}>
                    <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                        <UserIcon size={24} color="#ef4444" />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Accounts</Text>
                        <Text style={styles.menuSubtitle}>99 users</Text>
                    </View>
                    <Text style={styles.menuValue}>99</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('MailManagement')} style={styles.menuItem}>
                    <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                        <MailIcon size={24} color="#3b82f6" />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Mailbox</Text>
                        <Text style={styles.menuSubtitle}>2 unread</Text>
                    </View>
                    <Text style={styles.menuValue}>02</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('FeedbackManagement')} style={styles.menuItem}>
                    <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                        <FeedbackIcon size={24} color="#22c55e" />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Feedback</Text>
                        <Text style={styles.menuSubtitle}>2 pending</Text>
                    </View>
                    <Text style={styles.menuValue}>02</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.distributionContainer}>
                <Text style={styles.distributionTitle}>Plant Rarity Distribution</Text>
                <View style={styles.progressItemsContainer}>
                    <View>
                        <View style={styles.progressLabelContainer}>
                            <Text style={styles.progressLabel}>Common</Text>
                            <Text style={styles.progressValue}>1250 / 1550</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBar, { width: '80.6%', backgroundColor: '#A59480' }]} />
                        </View>
                    </View>
                    <View>
                        <View style={styles.progressLabelContainer}>
                            <Text style={styles.progressLabel}>Rare</Text>
                            <Text style={styles.progressValue}>250 / 1550</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBar, { width: '16.1%', backgroundColor: '#C8B6A6' }]} />
                        </View>
                    </View>
                    <View>
                        <View style={styles.progressLabelContainer}>
                            <Text style={styles.progressLabel}>Endangered</Text>
                            <Text style={styles.progressValue}>50 / 1550</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBar, { width: '3.2%', backgroundColor: '#f87171' }]} />
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
    },
    greetingText: {
        fontSize: 16,
        color: '#75685a',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    menuContainer: {
        gap: 16,
    },
    menuItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 8,
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontWeight: 'bold',
        color: '#3C3633',
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#75685a',
    },
    menuValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    distributionContainer: {
        marginTop: 24,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    distributionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3C3633',
        marginBottom: 16,
    },
    progressItemsContainer: {
        gap: 16,
    },
    progressLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontWeight: '600',
        color: '#4b5563',
        fontSize: 14,
    },
    progressValue: {
        color: '#6b7280',
        fontSize: 14,
    },
    progressBarBackground: {
        width: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: 9999,
        height: 10,
    },
    progressBar: {
        height: 10,
        borderRadius: 9999,
    },
});

export default DashboardScreen;
