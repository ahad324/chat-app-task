
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import SingleChat from '../SingleChat';
import { ChatState } from '../../context/ChatProvider';
import { User } from '../../types';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

vi.mock('../../context/ChatProvider', () => ({
    ChatState: vi.fn(),
}));

const mockUser: User = {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    pic: 'url',
    token: 'fake-token',
};

const mockSelectedChat = {
    _id: 'chat1',
    chatName: 'Test Chat',
    users: [mockUser, { _id: 'user2', name: 'Other User', email: 'other@example.com', pic: 'url2' }],
    isGroupChat: false,
};

describe('SingleChat Component', () => {
    it('renders chat interface and fetches messages', () => {
        (ChatState as vi.Mock).mockReturnValue({
            user: mockUser,
            selectedChat: mockSelectedChat,
            setSelectedChat: vi.fn(),
            chats: [],
            setChats: vi.fn(),
            socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
            latestMessage: null,
        });

        mockedAxios.get.mockResolvedValue({ data: [] });

        render(<SingleChat />);
        
        expect(screen.getByPlaceholderText(/enter a message../i)).toBeInTheDocument();
        expect(screen.getByText('Other User')).toBeInTheDocument();
        expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/message/chat1'), expect.any(Object));
    });
});
