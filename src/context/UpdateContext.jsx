import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const UpdateContext = createContext();

export const useUpdates = () => {
    const context = useContext(UpdateContext);
    if (!context) {
        throw new Error('useUpdates must be used within an UpdateProvider');
    }
    return context;
};

export const UpdateProvider = ({ children }) => {
    const { token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;
        try {
            const response = await api.get('/api/user/updates/unread-count');
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchUnreadCount();
        } else {
            setUnreadCount(0);
        }
    }, [token, fetchUnreadCount]);

    // Real-time: re-fetch accurate count when admin publishes a new update
    useEffect(() => {
        const handleNewUpdate = () => {
            fetchUnreadCount();
        };
        document.addEventListener('socket:newUpdate', handleNewUpdate);
        return () => document.removeEventListener('socket:newUpdate', handleNewUpdate);
    }, [fetchUnreadCount]);

    const markAsRead = async (updateId) => {
        try {
            const response = await api.post(`/api/user/updates/mark-read/${updateId}`);
            if (response.data.success) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return response.data;
        } catch (error) {
            console.error("Failed to mark update as read:", error);
            return { success: false };
        }
    };

    const value = {
        unreadCount,
        fetchUnreadCount,
        markAsRead,
    };

    return (
        <UpdateContext.Provider value={value}>
            {children}
        </UpdateContext.Provider>
    );
};
