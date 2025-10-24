import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { SearchIcon } from '../Icons';

const SearchBar = ({ value, onChange }) => (
    <View style={styles.container}>
        <SearchIcon color="#75685a" style={styles.icon} size={20} />
        <TextInput
            placeholder="Search"
            style={styles.input}
            placeholderTextColor="#75685a"
            value={value}
            onChangeText={onChange}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginVertical: 16,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        backgroundColor: 'transparent',
        color: '#3C3633',
    },
});

export default SearchBar;
