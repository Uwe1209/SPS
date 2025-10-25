import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BackIcon, TrashIcon } from '../Icons';
import { useAdminContext } from '../AdminContext';

const MailDetailScreen = ({ route, navigation }) => {
    const { mail } = route.params;
    const { handleDeleteMail } = useAdminContext();

    const onDelete = () => {
        handleDeleteMail(mail.id);
        navigation.goBack();
    };

    if (!mail) {
        return (
            <View style={styles.container}>
                <Text>Mail not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.outerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackIcon color="#3C3633" />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                    <TrashIcon color="#ef4444" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.subject}>{mail.subject}</Text>
                <View style={styles.fromContainer}>
                    <View style={styles.fromAvatar} />
                    <View style={styles.fromInfo}>
                        <Text style={styles.fromName}>{mail.from}</Text>
                    </View>
                    <Text style={styles.date}>{mail.date}</Text>
                </View>
                <Text style={styles.body}>{mail.body}</Text>
            </ScrollView>
            <View style={styles.replyButtonContainer}>
                <TouchableOpacity style={styles.replyButton}>
                    <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#FFFBF5',
    },
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    actionButton: {
        padding: 8,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    subject: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3C3633',
        marginBottom: 16,
    },
    fromContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    fromAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        marginRight: 16,
    },
    fromInfo: {
        flex: 1,
    },
    fromName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    date: {
        fontSize: 14,
        color: '#75685a',
    },
    body: {
        marginTop: 20,
        color: '#3C3633',
        fontSize: 16,
        lineHeight: 24,
    },
    replyButtonContainer: {
        padding: 16,
    },
    replyButton: {
        width: '100%',
        backgroundColor: '#A59480',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    replyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MailDetailScreen;
