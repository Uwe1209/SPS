import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { BackIcon, TrashIcon } from '../Icons';

const FeedbackDetailScreen = ({ route, navigation }) => {
    const { feedback: initialFeedback } = route.params;
    const [feedback, setFeedback] = useState(initialFeedback);
    const [replyText, setReplyText] = useState('');
    const scrollRef = useRef(null);

    // Note: onDelete and onReply will be fully connected later.
    const onDelete = (id) => {
        console.log("Delete feedback:", id);
        navigation.goBack();
    };
    const onReply = (id, text) => {
        const newReply = { text, time: 'Just now' };
        setFeedback(currentFeedback => ({
            ...currentFeedback,
            replies: [...(currentFeedback.replies || []), newReply]
        }));
        console.log("Replied to feedback:", id, "with:", text);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [feedback.replies]);

    const handleReplyClick = () => {
        if (replyText.trim()) {
            onReply(feedback.id, replyText);
            setReplyText('');
        }
    };

    if (!feedback) {
        return (
            <View style={styles.container}>
                <Text>Feedback not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <View style={styles.outerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <BackIcon color="#3C3633" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => onDelete(feedback.id)} style={styles.actionButton}>
                        <TrashIcon color="#ef4444" />
                    </TouchableOpacity>
                </View>
                <ScrollView ref={scrollRef} style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                    <Text style={styles.subject}>{feedback.subject}</Text>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.avatar} />
                            <View style={styles.cardHeaderText}>
                                <Text style={styles.cardTitle}>User Feedback</Text>
                                <Text style={styles.cardTime}>{feedback.time}</Text>
                            </View>
                        </View>
                        <Text style={styles.cardBody}>{feedback.body}</Text>
                    </View>

                    {feedback.replies && feedback.replies.map((reply, index) => (
                        <View key={index} style={[styles.card, styles.replyCard]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.replyAvatar}>
                                    <Text style={styles.replyAvatarText}>YOU</Text>
                                </View>
                                <View style={styles.cardHeaderText}>
                                    <Text style={styles.cardTitle}>Your Reply</Text>
                                    <Text style={styles.cardTime}>{reply.time}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardBody}>{reply.text}</Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.replyContainer}>
                    <TextInput
                        style={styles.replyInput}
                        rows="3"
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChangeText={setReplyText}
                        multiline
                    />
                    <TouchableOpacity 
                        onPress={handleReplyClick} 
                        style={[styles.sendButton, !replyText.trim() && styles.disabledButton]} 
                        disabled={!replyText.trim()}
                    >
                        <Text style={styles.sendButtonText}>Send Reply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

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
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    actionButton: {
        padding: 8,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
    },
    subject: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3C3633',
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    replyCard: {
        backgroundColor: '#f0fdf4',
        marginTop: 16,
        marginLeft: 32,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        marginRight: 16,
    },
    replyAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1f2937',
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    replyAvatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    cardTime: {
        color: '#75685a',
        fontSize: 14,
    },
    cardBody: {
        marginTop: 16,
        color: '#3C3633',
        fontSize: 16,
        lineHeight: 24,
    },
    replyContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#FFFBF5',
    },
    replyInput: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: 'white',
        minHeight: 70,
        textAlignVertical: 'top',
    },
    sendButton: {
        width: '100%',
        marginTop: 8,
        backgroundColor: '#A59480',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#d1d5db',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FeedbackDetailScreen;
