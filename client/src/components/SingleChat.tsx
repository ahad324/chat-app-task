import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatState } from '../context/ChatProvider';
import { getSenderFull } from '../config/chatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import ScrollableChat from './ScrollableChat';
import { Message } from '../types';
import ConfirmationModal from './miscellaneous/ConfirmationModal';
import Spinner from './miscellaneous/Spinner';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SingleChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(null);

  const { selectedChat, setSelectedChat, user, socket, latestMessage, setChats } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat || !socket) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      setLoading(true);
      const { data } = await axios.get(`${ENDPOINT}/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      alert(`Error Occurred! Failed to Load the Messages Error:${error}`);
      setLoading(false);
    }
  };

  const updateAndSortChats = (updatedMessage: Message) => {
    setChats((prevChats) => {
      // The server response for a new/updated message (`updatedMessage`) contains the message data
      // and a `chat` object. However, inside that `chat` object, the `latestMessage.sender`
      // field is not populated, which causes a crash in the `MyChats` component.
      // To fix this, we construct a new chat object for the list. We use the `chat` object
      // from the message, but overwrite its `latestMessage` property with the full `updatedMessage`
      // object we received, because `updatedMessage.sender` *is* populated.
      const updatedChatForList = {
        ...updatedMessage.chat,
        latestMessage: updatedMessage,
      };

      const newChats = prevChats.map((chat) => (chat._id === updatedChatForList._id ? updatedChatForList : chat));

      // Sort by the `updatedAt` field to bring the most recently active chat to the top.
      return newChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });
  };

  useEffect(() => {
    fetchMessages();
    setEditingMessage(null);
    setNewMessage('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    if (latestMessage && latestMessage.chat._id === selectedChat?._id) {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.find((m) => m._id === latestMessage._id);
        if (messageExists) {
          return prevMessages.map((m) => (m._id === latestMessage._id ? latestMessage : m));
        } else {
          return [...prevMessages, latestMessage];
        }
      });
    }

    const messageUpdateHandler = (updatedMessage: Message) => {
      // Update the messages list if the updated message belongs to the currently selected chat
      if (selectedChat?._id === updatedMessage.chat._id) {
        setMessages((prev) => prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg)));
      }
      // Update the main chat list on the side
      updateAndSortChats(updatedMessage);
    };

    const messageDeleteHandler = (deletedMessage: Message) => {
      if (selectedChat?._id === deletedMessage.chat._id) {
        setMessages((prev) => {
          const updatedMessages = prev.filter((msg) => msg._id !== deletedMessage._id);
          return [...updatedMessages, deletedMessage].sort(
            (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
          );
        });
      }
      updateAndSortChats(deletedMessage);
    };

    socket.on('message updated', messageUpdateHandler);
    socket.on('message deleted', messageDeleteHandler);

    const typingHandler = () => setIsTyping(true);
    const stopTypingHandler = () => setIsTyping(false);

    socket.on('typing', typingHandler);
    socket.on('stop typing', stopTypingHandler);

    return () => {
      socket.off('message updated', messageUpdateHandler);
      socket.off('message deleted', messageDeleteHandler);
      socket.off('typing', typingHandler);
      socket.off('stop typing', stopTypingHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestMessage, selectedChat, socket]);

  const handleSendMessage = async () => {
    if (newMessage && socket) {
      socket.emit('stop typing', selectedChat?._id);
      setIsSending(true);
      try {
        const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.post(
          `${ENDPOINT}/api/message`,
          { content: newMessage, chatId: selectedChat?._id },
          config,
        );
        setNewMessage('');
        socket.emit('new message', data);
        setMessages((prev) => [...prev, data]);
        updateAndSortChats(data);
      } catch (error) {
        alert(`Error Occurred! Failed to send the Message Error:${error}`);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage || !newMessage || !socket) return;
    socket.emit('stop typing', selectedChat?._id);
    setIsSending(true);
    try {
      const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${user?.token}` } };
      await axios.put<Message>(`${ENDPOINT}/api/message/${editingMessage._id}`, { content: newMessage }, config);
      // The server will emit the 'message updated' event to the room
      handleCancelEdit();
    } catch (error) {
      alert(`Failed to update message Error:${error}`);
    } finally {
      setIsSending(false);
    }
  };

  const requestDeleteConfirmation = (messageId: string) => {
    setMessageIdToDelete(messageId);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageIdToDelete || !socket) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete<Message>(`${ENDPOINT}/api/message/${messageIdToDelete}`, config);
      // The server will emit the 'message deleted' event to the room
    } catch (error) {
      alert(`Failed to delete message Error:${error}`);
    } finally {
      setIsConfirmModalOpen(false);
      setMessageIdToDelete(null);
    }
  };

  const handleStartEdit = (message: Message) => {
    if (message.isDeleted) return;
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isSending) {
      event.preventDefault();
      if (editingMessage) {
        handleUpdateMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat?._id);
    }
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat?._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const otherUser = selectedChat && user ? getSenderFull(user, selectedChat.users) : null;

  return (
    <>
      <div className="text-lg md:text-xl p-2 w-full font-work-sans flex justify-between items-center bg-gray-50 dark:bg-slate-700 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <button className="md:hidden" onClick={() => setSelectedChat(null)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          {otherUser && (
            <ProfileModal user={otherUser}>
              <div className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600">
                <img src={otherUser.pic} alt={otherUser.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-semibold text-base">{otherUser.name}</span>
              </div>
            </ProfileModal>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-end p-3 bg-gray-200 dark:bg-slate-900 w-full h-full rounded-b-lg overflow-y-hidden">
        {loading ? (
          <Spinner size="lg" color="text-blue-500 dark:text-blue-400" />
        ) : (
          <div className="flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
            <ScrollableChat messages={messages} onEdit={handleStartEdit} onDelete={requestDeleteConfirmation} />
          </div>
        )}
        <div className="mt-3">
          {istyping ? (
            <div className="typing-indicator h-5 mb-1">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <div className="h-5 mb-1"></div>
          )}

          {editingMessage && (
            <div className="text-sm bg-gray-300 dark:bg-slate-800 p-2 rounded-t-md flex justify-between items-center">
              <div className="overflow-hidden">
                <p className="font-bold text-gray-700 dark:text-gray-200">Editing message</p>
                <p className="italic truncate text-gray-600 dark:text-gray-400">{editingMessage.content}</p>
              </div>
              <button onClick={handleCancelEdit} className="p-1 rounded-full hover:bg-gray-400 dark:hover:bg-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              className={`w-full p-2 bg-gray-100 dark:bg-slate-700 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingMessage ? 'rounded-b-md' : 'rounded-md'}`}
              placeholder="Enter a message.."
              value={newMessage}
              onKeyDown={handleKeyDown}
              onChange={typingHandler}
            />
            <button
              onClick={editingMessage ? handleUpdateMessage : handleSendMessage}
              disabled={isSending || !newMessage}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {editingMessage ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-6 h-6 transition-transform ${isSending ? 'animate-takeoff' : ''}`}
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Message"
        confirmText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      >
        <p>Are you sure you want to delete this message? This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
};

export default SingleChat;
