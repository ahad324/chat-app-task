
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChatState } from '../../context/ChatProvider';
import ProfileModal from './ProfileModal';
import UserListItem from '../UserAvatar/UserListItem';
import { User } from '../../types';
import Spinner from "./Spinner"

const SideDrawer = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { user, setSelectedChat, chats, setChats } = ChatState();
    const navigate = useNavigate();
    const serverUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const { data } = await axios.get(`${serverUrl}/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            alert('Error Occurred! Failed to load the search results');
            setLoading(false);
        }
    };

    const accessChat = async (userId: string) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const { data } = await axios.post(`${serverUrl}/api/chat`, { userId }, config);

            if (!chats.find((c) => c._id === data._id)) {
                setChats([data, ...chats]);
            }
            setSelectedChat(data);
            setLoadingChat(false);
            setIsDrawerOpen(false);
        } catch (error) {
            alert('Error fetching the chat');
            setLoadingChat(false);
        }
    };

    return (
        <>
            <header className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 border-b dark:border-slate-700">
                <button onClick={() => setIsDrawerOpen(true)} className="flex items-center space-x-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 px-3 py-1.5 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    <span className="hidden md:inline">Search User</span>
                </button>

                <h1 className="text-xl font-bold">Chat App</h1>

                <div className="flex items-center space-x-4">
                    {/* Notification Icon can be added here */}
                    <ProfileModal user={user}>
                        <img src={user?.pic} alt={user?.name} className="w-8 h-8 rounded-full cursor-pointer" />
                    </ProfileModal>
                     <button onClick={logoutHandler} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm">Logout</button>
                </div>
            </header>
            
            {/* Drawer */}
            <div className={`fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} bg-white w-80 dark:bg-gray-800`}>
                <h5 className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">Search Users</h5>
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    <span className="sr-only">Close menu</span>
                </button>
                <div className="py-4 overflow-y-auto">
                    <div className="flex pb-2">
                        <input
                            placeholder="Search by name or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm"
                        />
                        <button onClick={handleSearch} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md">Go</button>
                    </div>
                    {loading ? (
                        <Spinner size="md" color="text-blue-500 dark:text-blue-400" />
                    ) : (
                        searchResult?.map((u) => (
                            <UserListItem
                                key={u._id}
                                user={u}
                                handleFunction={() => accessChat(u._id)}
                            />
                        ))
                    )}
                    {loadingChat && <Spinner size="md" color="text-blue-500 dark:text-blue-400" />}
                </div>
            </div>
             {isDrawerOpen && <div onClick={() => setIsDrawerOpen(false)} className="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-30"></div>}
        </>
    );
};

export default SideDrawer;
