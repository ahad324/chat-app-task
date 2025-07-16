import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ProfileModal from '../ProfileModal';
import { User } from '../../../types';
import { renderWithProviders, mockUser } from '../../../tests/mocks';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

// Mock the entire ChatProvider module
vi.mock('../../../context/ChatProvider', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../context/ChatProvider')>();
    const mockChatState = vi.fn();
    return {
        ...actual, // Keep other exports from the original module if any
        ChatState: mockChatState, // Mock the ChatState export
    };
});

// Import ChatState after it has been mocked
import { ChatState } from '../../../context/ChatProvider';

describe('ProfileModal Component', () => {
    const setUserMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Now ChatState is a vi.fn() and can be mocked
        (ChatState as vi.Mock).mockReturnValue({
            user: mockUser,
            setUser: setUserMock,
            selectedChat: null,
            setSelectedChat: vi.fn(),
            chats: [],
            setChats: vi.fn(),
            notification: [],
            setNotification: vi.fn(),
            socket: null,
            latestMessage: null,
        });
    });

    const openModal = () => {
        renderWithProviders(
            <ProfileModal user={mockUser}>
                <button>Open Profile</button>
            </ProfileModal>
        );
        fireEvent.click(screen.getByText('Open Profile'));
    };

    it('opens the modal on click and displays user info', () => {
        openModal();
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUser.email}`)).toBeInTheDocument();
    });

    it('allows the current user to select a new profile picture', async () => {
        openModal();
        const file = new File(['(⌐□_□)'], 'chuck-norris.png', { type: 'image/png' });
        
        // The file input is hidden, so we can't use getByLabelText.
        // We'll find it a different way and then "upload" our file to it.
        const input = screen.getByRole('dialog').querySelector('input[type="file"]');
        expect(input).not.toBeNull();

        await waitFor(() => {
            fireEvent.change(input!, { target: { files: [file] } });
        });

        expect(await screen.findByText('Selected: chuck-norris.png')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm upload/i })).toBeInTheDocument();
    });

    it('uploads the new picture and updates context on confirm', async () => {
        mockedAxios.put.mockResolvedValue({ data: { pic: 'new-pic-url' } });
        openModal();

        const file = new File(['(⌐□_□)'], 'chuck-norris.png', { type: 'image/png' });
        const input = screen.getByRole('dialog').querySelector('input[type="file"]');
        
        await waitFor(() => {
            fireEvent.change(input!, { target: { files: [file] } });
        });

        const uploadButton = await screen.findByRole('button', { name: /confirm upload/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(mockedAxios.put).toHaveBeenCalledWith(
                expect.stringContaining('/api/user/profile'),
                expect.any(FormData),
                expect.any(Object)
            );
            expect(setUserMock).toHaveBeenCalledWith({ ...mockUser, pic: 'new-pic-url' });
        });
    });
});