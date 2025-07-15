
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import MyChats from '../MyChats';
import { ChatState } from '../../context/ChatProvider';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

vi.mock('../../context/ChatProvider', () => ({
    ChatState: vi.fn(),
}));

describe('MyChats Component', () => {
    it('renders My Chats heading and fetches chats', async () => {
        // Mock the context state
        (ChatState as vi.Mock).mockReturnValue({
            user: { token: 'fake-token' },
            selectedChat: null,
            setSelectedChat: vi.fn(),
            chats: [],
            setChats: vi.fn(),
        });

        mockedAxios.get.mockResolvedValue({ data: [] });

        render(<MyChats />);
        expect(screen.getByText(/my chats/i)).toBeInTheDocument();
        expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/chat'), expect.any(Object));
    });
});
