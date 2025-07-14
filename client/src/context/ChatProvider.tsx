import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Chat, Message } from '../types';
import io, { Socket } from 'socket.io-client';
import Spinner from '../components/miscellaneous/Spinner';

const ENDPOINT = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

interface ChatContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    selectedChat: Chat | null;
    setSelectedChat: (chat: Chat | null) => void;
    chats: Chat[];
    setChats: Dispatch<SetStateAction<Chat[]>>;
    notification: Message[];
    setNotification: Dispatch<SetStateAction<Message[]>>;
    socket: Socket | null;
    latestMessage: Message | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [notification, setNotification] = useState<Message[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [latestMessage, setLatestMessage] = useState<Message | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            setUser(userInfo);

            if (!userInfo) {
                navigate('/');
            }
        } catch (error) {
            console.error("Failed to parse user info from localStorage", error);
            localStorage.removeItem('userInfo');
            setUser(null);
            navigate('/');
        } finally {
            setAuthLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (user) {
            const newSocket = io(ENDPOINT);
            setSocket(newSocket);
            newSocket.emit('setup', user);

            newSocket.on('message recieved', (newMessageRecieved: Message) => {
                // Set latest message for SingleChat to consume and trigger re-render
                setLatestMessage(newMessageRecieved);

                // Update chats list for MyChats
                setChats(prevChats => {
                    const chatExists = prevChats.find(c => c._id === newMessageRecieved.chat._id);

                    let updatedChats: Chat[];
                    if (chatExists) {
                        const updatedChat = { ...chatExists, latestMessage: newMessageRecieved };
                        const otherChats = prevChats.filter(c => c._id !== newMessageRecieved.chat._id);
                        updatedChats = [updatedChat, ...otherChats];
                    } else {
                        // This is a new chat, add it to the list
                        const newChatWithLatestMessage = { ...newMessageRecieved.chat, latestMessage: newMessageRecieved };
                        updatedChats = [newChatWithLatestMessage, ...prevChats];
                    }
                     return updatedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                });

                if (selectedChat?._id !== newMessageRecieved.chat._id) {
                     if (!notification.some(n => n._id === newMessageRecieved._id)) {
                        setNotification(prev => [newMessageRecieved, ...prev]);
                    }
                }
            });
            
             newSocket.on('message updated', (updatedMessage: Message) => {
                setLatestMessage(updatedMessage);
                setChats(prevChats =>
                    prevChats.map(chat => {
                        if (chat.latestMessage?._id === updatedMessage._id) {
                            return { ...chat, latestMessage: updatedMessage };
                        }
                        return chat;
                    })
                );
            });

            return () => {
                newSocket.disconnect();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); 

    if (authLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
                <Spinner size="lg" color="text-blue-500 dark:text-blue-400" />
            </div>
        );
    }


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
                setNotification,
                socket,
                latestMessage,
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