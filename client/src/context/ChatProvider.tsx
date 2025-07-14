import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Chat } from '../types';

interface ChatContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    selectedChat: Chat | null;
    setSelectedChat: (chat: Chat | null) => void;
    chats: Chat[];
    setChats: (chats: Chat[]) => void;
    notification: any[];
    setNotification: (notification: any[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [notification, setNotification] = useState<any[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        setUser(userInfo);

        if (!userInfo) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <ChatContext.Provider
            value={{
                user,
                setUser,
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                notification,
                setNotification
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('ChatState must be used within a ChatProvider');
    }
    return context;
};

export default ChatProvider;
