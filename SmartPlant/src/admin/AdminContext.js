import React, { createContext, useState, useContext } from 'react';

// --- Initial Data ---
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

const allMails = [
    { id: 1, from: 'Feedback', to: 'me', subject: 'Regarding the new UI', body: 'The new user interface is fantastic! Very intuitive and easy to navigate.', date: 'Tuesday', status: 'unread', flagged: true, timeGroup: 'Yesterday' },
    { id: 2, from: 'Service Report', to: 'not-me', subject: 'Weekly System Performance', body: 'Please find the attached weekly performance report. Overall system health is at 99.8%.', date: 'Tuesday', status: 'read', flagged: true, timeGroup: 'Yesterday' },
    { id: 3, from: 'System Alert', to: 'me', subject: 'New login detected', body: 'A new device has logged into your account. If this was not you, please secure your account immediately.', date: '07/05/2025', status: 'read', flagged: false, timeGroup: 'This Week' },
];

const allFeedbacks = [
    { id: 1, subject: 'UI Suggestion', body: 'The dashboard looks great, but maybe the colors could be a bit brighter.', time: 'Yesterday', replies: [] },
    { id: 2, subject: 'Feature Request', body: 'Can we add a dark mode? It would be easier on the eyes at night.', time: '2 days ago', replies: [{ text: "That's a great idea! We'll look into it for a future update.", time: 'Yesterday'}]}
];

const AdminContext = createContext();

export const useAdminContext = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const [users, setUsers] = useState(allUsers);
    const [mails, setMails] = useState(allMails);
    const [feedbacks, setFeedbacks] = useState(allFeedbacks);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleDeleteUser = (userId) => {
        setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
        showToast("User deleted successfully!");
    };

    const handleAddNewUser = (newUser) => {
        const userWithId = {
            ...newUser,
            id: Date.now(),
            favourite: false,
            color: ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'][users.length % 7]
        };
        setUsers(currentUsers => [...currentUsers, userWithId]);
        showToast("User added successfully!");
    };

    const handleToggleMailFavourite = (mailId) => {
        setMails(currentMails =>
            currentMails.map(mail =>
                mail.id === mailId ? { ...mail, flagged: !mail.flagged } : mail
            )
        );
    };

    const handleDeleteFeedback = (id) => {
        setFeedbacks(currentFeedbacks => currentFeedbacks.filter(f => f.id !== id));
        showToast("Feedback deleted successfully!");
    };

    const handleReplyFeedback = (feedbackId, replyText) => {
        const newReply = { text: replyText, time: 'Just now' };
        setFeedbacks(currentFeedbacks =>
            currentFeedbacks.map(fb =>
                fb.id === feedbackId ? { ...fb, replies: [...(fb.replies || []), newReply] } : fb
            )
        );
        showToast("Reply sent!");
    };

    const handleDeleteMail = (id) => {
        setMails(currentMails => currentMails.filter(m => m.id !== id));
        showToast("Mail deleted successfully!");
    };

    const value = {
        users,
        mails,
        feedbacks,
        toastMessage,
        handleDeleteUser,
        handleAddNewUser,
        handleToggleMailFavourite,
        handleDeleteFeedback,
        handleReplyFeedback,
        handleDeleteMail,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
