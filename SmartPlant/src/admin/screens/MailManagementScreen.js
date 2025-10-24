import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import { BackIcon, StarIcon } from '../Icons';
import SearchBar from '../components/SearchBar';
import { useAdminContext } from '../AdminContext';

const MailManagementScreen = ({ navigation }) => {
    const { mails, handleToggleMailFavourite } = useAdminContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const onToggleFavourite = (mailId) => {
        handleToggleMailFavourite(mailId);
    };

    const filteredMails = mails.filter(mail => {
        const matchesSearch = mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) || mail.from.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'unread') return mail.status === 'unread';
        if (filter === 'favourite') return mail.flagged;
        return true;
    });

    const groupedMails = filteredMails.reduce((acc, mail) => {
        (acc[mail.timeGroup] = acc[mail.timeGroup] || []).push(mail);
        return acc;
    }, {});

    const sections = Object.keys(groupedMails).map(group => ({
        title: group,
        data: groupedMails[group]
    }));

    const renderMailItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('MailDetail', { mail: item })} style={styles.mailItem}>
            <View style={[styles.mailStatusIndicator, { backgroundColor: item.status === 'unread' ? '#A59480' : '#e5e7eb' }]} />
            <View style={styles.mailContent}>
                <Text style={styles.mailFrom} numberOfLines={1}>{item.from}</Text>
                <Text style={styles.mailSubject} numberOfLines={1}>{item.subject}</Text>
            </View>
            <View style={styles.mailMeta}>
                <Text style={styles.mailDate}>{item.date}</Text>
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); onToggleFavourite(item.id); }} style={styles.starButton}>
                    <StarIcon filled={item.flagged} size={24} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <BackIcon color="#3C3633" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mail Management</Text>
                <View style={{ width: 24 }} />
            </View>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('unread')} style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>Unread</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('favourite')} style={[styles.filterButton, filter === 'favourite' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'favourite' && styles.activeFilterText]}>Favourite</Text>
                </TouchableOpacity>
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMailItem}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.groupHeader}>{title}</Text>
                )}
                ListEmptyComponent={<Text style={styles.noMailText}>No mail found.</Text>}
                contentContainerStyle={{ flexGrow: 1 }}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#FFFBF5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    activeFilter: {
        backgroundColor: '#A59480',
    },
    filterText: {
        fontWeight: '600',
        color: '#75685a',
    },
    activeFilterText: {
        color: 'white',
    },
    list: {
        marginTop: 16,
    },
    groupHeader: {
        fontWeight: 'bold',
        color: '#3C3633',
        marginVertical: 8,
    },
    mailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    mailStatusIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    mailContent: {
        flex: 1,
        minWidth: 0,
    },
    mailFrom: {
        fontWeight: 'bold',
        color: '#3C3633',
    },
    mailSubject: {
        color: '#75685a',
        fontSize: 14,
    },
    mailMeta: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    mailDate: {
        fontSize: 12,
        color: '#75685a',
        marginBottom: 4,
    },
    starButton: {
        padding: 4,
    },
    noMailText: {
        textAlign: 'center',
        color: '#75685a',
        marginTop: 32,
    },
});

export default MailManagementScreen;
