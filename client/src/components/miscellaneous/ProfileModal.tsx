
import React, { useState, Fragment, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { User } from '../../types';
import { ChatState } from '../../context/ChatProvider';
import Spinner from "./Spinner"

interface ProfileModalProps {
    user: User | null;
    children: React.ReactNode;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user: initialUser, children }) => {
    const { user, setUser } = ChatState();
    const [isOpen, setIsOpen] = useState(false);
    const [pic, setPic] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const serverUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPic(e.target.files[0]);
        }
    };

    const handleUpdatePicture = async () => {
        if (!pic) return;
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('pic', pic);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const { data } = await axios.put(`${serverUrl}/api/user/profile`, formData, config);
            
            // Correctly update local storage and context while preserving the token
            const updatedUserInfo = { ...user, pic: data.pic };
            
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            setUser(updatedUserInfo as User); // Update the user in context
            setLoading(false);
            setPic(null); // Reset file input
            closeModal();
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            setError(axiosError.response?.data?.message || "Failed to update picture.");
            setLoading(false);
        }
    };

    function closeModal() {
        setIsOpen(false);
        setError('');
        setPic(null);
        setLoading(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const isCurrentUser = user?._id === initialUser?._id;
    // Use the live user data from context if we are viewing the current user's profile
    const displayUser = isCurrentUser ? user : initialUser;

    return (
        <>
            <div onClick={openModal}>
                {children}
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <button
  onClick={closeModal}
  className="absolute top-3 right-3 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-2.5 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-slate-700 dark:text-blue-200 dark:hover:bg-slate-600"
  aria-label="Close"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>

                                    <div className="mt-4 flex flex-col items-center">
    <div className="relative group">
        <img src={displayUser?.pic} alt={displayUser?.name} className="w-32 h-32 rounded-full object-cover" />
        {isCurrentUser && (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-sm font-semibold">Change</span>
            </div>
        )}
    </div>
    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 dark:text-gray-100 text-center mt-4">
        {displayUser?.name}
    </Dialog.Title>
    <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
        Email: {displayUser?.email}
    </p>
</div>


                                    {isCurrentUser && (
                                        <div className="mt-4">
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                                            {pic && (
                                                <div className="text-center text-sm text-gray-600 dark:text-gray-300 my-2">
                                                    Selected: {pic.name}
                                                </div>
                                            )}
                                            {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}
                                            {pic && 
                                                <button
                                                    type="button"
                                                    onClick={handleUpdatePicture}
                                                    disabled={loading}
                                                    className="w-full mt-2 inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:bg-green-300 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? <Spinner size="sm" color="text-white" /> : 'Confirm Upload'}
                                                </button>
                                            }
                                        </div>
                                    )}

                                    
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default ProfileModal;
