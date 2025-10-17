import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { BackIcon, PlusIcon } from '../Icons';
import SearchBar from '../components/SearchBar';

// Note: Data will be managed by a higher-level component in a later step.
const allUsers = [
    { id: 1, name: 'Gibson', status: 'active', favourite: true, color: '#fca5a5', details: { age: 32, gender: 'Male', contact: '555-0101', address: '123 Apple St', email: 'gibson@example.com', plantId: 10, role: 'Expert' } },
    { id: 2, name: 'Esther', status: 'active', favourite: false, color: '#16a34a', details: { age: 28, gender: 'Female', contact: '555-0102', address: '456 Oak Ave', email: 'esther@example.com', plantId: 12, role: 'User' } },
    { id: 3, name: 'Nothing', status: 'deactive', favourite: false, color: '#a3e635', details: { age: 45, gender: 'Other', contact: '555-0103', address: '789 Pine Ln', email: 'nothing@example.com', plantId: 5, role: 'User' } },
    { id: 4, name: 'Eric Wee', status: 'active', favourite: true, color: '#fef08a', details: { age: 25, gender: 'Male', contact: '555-0104', address: '321 Birch Rd', email: 'eric.w@example.com', plantId: 8, role: 'Expert' } },
    { id: 5, name: 'Gibson Lee', status: 'deactive', favourite: false, color: '#16a34a', details: { age: 32, gender: 'Male', contact: '555-0105', address: '654 Maple Ct', email: 'gibson.l@example.com', plantId: 15, role: 'User' } },
    { id: 6, name: 'Eric', status: 'active', favourite: false, color: '#9ca3af', details: { age: 29, gender: 'Male', contact: '555-0106', address: '987 Cedar Blvd', email: 'eric@example.com', plantId: 7, role: 'User' } },
    { id: 7, name: 'Samantha', status: 'active', favourite: true, color: '#c084fc', details: { age: 35, gender: 'Female', contact: '555-0107', address: '111 Rosewood Dr', email: 'samantha@example.com', plantId: 22, role: 'Expert' } },
    { id: 8, name: 'Ben Carter', status: 'deactive', favourite: false, color: '#60a5fa', details: { age: 41, gender: 'Male', contact: '555-0108', address: '222 Willow Way', email: 'ben.c@example.com', plantId: 3, role: 'User' } },
    { id: 9, name: 'Olivia', status: 'active', favourite: false, color: '#f9a8d4', details: { age: 22, gender: 'Female', contact: '555-0109', address: '333 Daisy Pl', email: 'olivia@example.com', plantId: 18, role: 'User' } },
];

const AccountManagementScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [users, setUsers] = useState(allUsers);

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
