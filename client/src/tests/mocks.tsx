import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Socket } from 'socket.io-client'; // Import Socket type
import { Chat, User } from '../types';
import { ChatContext, ChatContextType } from '../context/ChatProvider';

// Mock user data
export const mockUser: User = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  pic: 'test.jpg',
  token: 'fake-token',
};

export const mockOtherUser: User = {
  _id: 'user2',
  name: 'Other User',
  email: 'other@example.com',
  pic: 'other.jpg',
};

// Mock chat data
export const mockChat: Chat = {
  _id: 'chat1',
  chatName: 'Test Chat',
  users: [mockUser, mockOtherUser],
  latestMessage: undefined,
  updatedAt: new Date().toISOString(),
};

// Default mock context value
export const mockChatContextValue: ChatContextType = {
  user: mockUser,
  setUser: vi.fn(),
  selectedChat: null,
  setSelectedChat: vi.fn(),
  chats: [],
  setChats: vi.fn(),
  notification: [],
  setNotification: vi.fn(),
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  } as unknown as Socket,
  latestMessage: null,
};

// A custom render function to wrap components with necessary providers
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    providerProps = {},
    route = '/',
    path = '/',
  }: {
    providerProps?: Partial<ChatContextType>;
    route?: string;
    path?: string;
  } = {},
) => {
  const contextValue = { ...mockChatContextValue, ...providerProps };

  return render(
    <MemoryRouter initialEntries={[route]}>
      <ChatContext.Provider value={contextValue}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </ChatContext.Provider>
    </MemoryRouter>,
  );
};
