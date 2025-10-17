import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BackIcon } from '../Icons';

const AddUserScreen = ({ navigation, route }) => {
    // Note: The onAddUser function will be fully connected in a later step.
    const onAddUser = (newUser) => console.log("Add new user:", newUser);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('User');
    const [status, setStatus] = useState('active');

    const handleSave = () => {
        if (!name || !email) {
            Alert.alert("Please fill in all fields.");
            return;
        }
        const newUser = {
            name,
            status,
            details: { email, role, age: 0, gender: 'N/A', contact: 'N/A', address: 'N/A', plantId: 0 }
        };
        onAddUser(newUser);
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackIcon color="#3C3633" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New User</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Role</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={role}
                            onValueChange={(itemValue) => setRole(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="User" value="User" />
                            <Picker.Item label="Expert" value="Expert" />
                        </Picker>
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity style={styles.radioOption} onPress={() => setStatus('active')}>
                            <View style={styles.radioOuter}>
                                {status === 'active' && <View style={styles.radioInner} />}
                            </View>
                            <Text>Active</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioOption} onPress={() => setStatus('deactive')}>
                            <View style={styles.radioOuter}>
                                {status === 'deactive' && <View style={styles.radioInner} />}
                            </View>
                            <Text>Deactive</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save User</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    formContainer: {
        flex: 1,
        marginTop: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: 4,
    },
    input: {
        width: '100%',
        marginTop: 4,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        fontSize: 16,
        color: '#3C3633',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        marginTop: 4,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        height: 50,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#A59480',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#A59480',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#A59480',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AddUserScreen;
