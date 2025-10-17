import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { BackIcon, PlusIcon } from '../Icons';
import SearchBar from '../components/SearchBar';
import { useAdminContext } from '../AdminContext';

const AccountManagementScreen = ({ navigation }) => {
    const { users } = useAdminContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const navigate = (screen, params) => navigation.navigate(screen, params);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (filter === 'all') return true;
        if (filter === 'favourite') return user.favourite;
        return user.status === filter;
    });

    const renderUser = ({ item }) => (
        <TouchableOpacity onPress={() => navigate('UserProfile', { user: item })} style={[styles.userTile, { backgroundColor: item.color }]}>
            <Text style={styles.userNameText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('Dashboard')}><BackIcon color="#3C3633" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Account Management</Text>
                <TouchableOpacity onPress={() => navigate('AddUser')}><PlusIcon color="#3C3633" /></TouchableOpacity>
            </View>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('active')} style={[styles.filterButton, filter === 'active' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('deactive')} style={[styles.filterButton, filter === 'deactive' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'deactive' && styles.activeFilterText]}>Deactive</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('favourite')} style={[styles.filterButton, filter === 'favourite' && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === 'favourite' && styles.activeFilterText]}>Favourite</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                ListEmptyComponent={<Text style={styles.noUsersText}>No accounts found.</Text>}
                contentContainerStyle={{ flexGrow: 1 }}
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
        gap: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    activeFilter: {
        backgroundColor: '#A59480',
    },
    filterText: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 14,
        color: '#75685a',
    },
    activeFilterText: {
        color: 'white',
    },
    row: {
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 16,
    },
    userTile: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 16,
        justifyContent: 'flex-end',
        padding: 16,
    },
    userNameText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    noUsersText: {
        textAlign: 'center',
        color: '#75685a',
        marginTop: 32,
    },
});

export default AccountManagementScreen;
