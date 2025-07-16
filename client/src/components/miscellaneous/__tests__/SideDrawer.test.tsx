import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import SideDrawer from '../SideDrawer';
import { renderWithProviders, mockUser, mockOtherUser } from '../../../tests/mocks';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('SideDrawer Component', () => {
    const setSelectedChatMock = vi.fn();
    const setChatsMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        renderWithProviders(<SideDrawer />, {
            providerProps: {
                setSelectedChat: setSelectedChatMock,
                setChats: setChatsMock,
                chats: [],
            },
        });
    });

    const openDrawer = () => {
        fireEvent.click(screen.getByRole('button', { name: /search user/i }));
    };

    it('toggles the drawer visibility', () => {
        const drawerContainer = screen.getByText('Search Users').parentElement;
        expect(drawerContainer).toHaveClass('-translate-x-full');
        openDrawer();
        expect(drawerContainer).toHaveClass('translate-x-0');
        fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
        expect(drawerContainer).toHaveClass('-translate-x-full');
    });

    it('handles user search and displays results', async () => {
        mockedAxios.get.mockResolvedValue({ data: [mockOtherUser] });
        openDrawer();
        
        const searchInput = screen.getByPlaceholderText(/search by name or email/i);
        const searchButton = screen.getByRole('button', { name: 'Go' });

        fireEvent.change(searchInput, { target: { value: 'Other' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/user?search=Other'), expect.any(Object));
            expect(screen.getByText(mockOtherUser.name)).toBeInTheDocument();
        });
    });

    it('handles accessing a chat with a user from search results', async () => {
        const newChat = { _id: 'chat2', users: [mockUser, mockOtherUser] };
        mockedAxios.get.mockResolvedValue({ data: [mockOtherUser] });
        mockedAxios.post.mockResolvedValue({ data: newChat });
        openDrawer();

        fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), { target: { value: 'Other' } });
        fireEvent.click(screen.getByRole('button', { name: 'Go' }));

        const userItem = await screen.findByText(mockOtherUser.name);
        fireEvent.click(userItem);

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/api/chat'), { userId: mockOtherUser._id }, expect.any(Object));
            expect(setSelectedChatMock).toHaveBeenCalledWith(newChat);
            expect(setChatsMock).toHaveBeenCalled();
        });
    });

    it('logs out the user', () => {
        fireEvent.click(screen.getByRole('button', { name: /logout/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});