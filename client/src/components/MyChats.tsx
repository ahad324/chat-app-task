
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChatState } from '../context/ChatProvider';
import { getSenderFull } from '../config/chatLogics';
import { User, Chat } from '../types';

const MyChats = () => {
    const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
    const [loggedUser, setLoggedUser] = useState<User | null>(null);
    const serverUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

    const fetchChats = async () => {
        if (!user) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${serverUrl}/api/chat`, config);
            setChats(data);
        } catch (error) {
            alert('Error Occurred! Failed to load the chats');
        }
    };

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if(userInfo) {
            setLoggedUser(JSON.parse(userInfo));
        }
        fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className={`flex-col items-center p-3 bg-white dark:bg-slate-800 w-full md:w-1/3 rounded-lg border dark:border-slate-700 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="pb-3 px-3 text-2xl md:text-3xl font-work-sans flex w-full justify-between items-center">
                My Chats
                {/* Group Chat Button can be added here */}
            </div>
            <div className="flex flex-col p-3 bg-gray-100 dark:bg-slate-900 w-full h-full rounded-lg overflow-y-hidden">
                {chats ? (
                    <div className="overflow-y-auto">
                        {chats.map((chat: Chat) => {
                             const otherUser = !chat.isGroupChat && loggedUser ? getSenderFull(loggedUser, chat.users) : null;
                             return (
                                <div
                                    onClick={() => setSelectedChat(chat)}
                                    className={`cursor-pointer px-3 py-2 rounded-lg mb-2 flex items-center space-x-3 transition-colors duration-200 ${selectedChat?._id === chat._id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                                    key={chat._id}
                                >
                                    {chat.isGroupChat ? (
                                        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0118 15v3h-2zM4.75 12.094A5.973 5.973 0 004 15v3H2v-3a3.005 3.005 0 012.25-2.906z" /></svg>
                                        </div>
                                    ) : (
                                        <img src={otherUser?.pic} alt={otherUser?.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                    )}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold truncate">
                                            {chat.isGroupChat ? chat.chatName : otherUser?.name}
                                        </p>
                                        {chat.latestMessage ? (
                                            <p className="text-xs truncate text-gray-600 dark:text-gray-400">
                                                {chat.isGroupChat && (
                                                    <b>{chat.latestMessage.sender._id === user?._id ? 'You' : chat.latestMessage.sender.name.split(' ')[0]}: </b>
                                                )}
                                                {chat.latestMessage.isDeleted ? <i>This message was deleted</i> : chat.latestMessage.content}
                                            </p>
                                        ) : <p className="text-xs text-gray-500 italic">No messages yet</p>}
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <div>Loading chats...</div>
                )}
            </div>
        </div>
    );
};

export default MyChats;
