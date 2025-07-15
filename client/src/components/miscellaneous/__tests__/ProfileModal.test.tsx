
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileModal from '../ProfileModal';
import { ChatState } from '../../../context/ChatProvider';
import { User } from '../../../types';

vi.mock('../../../context/ChatProvider', () => ({
    ChatState: vi.fn(),
}));

const mockUser: User = {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    pic: 'url',
    token: 'fake-token',
};

describe('ProfileModal Component', () => {
    beforeEach(() => {
        (ChatState as vi.Mock).mockReturnValue({
            user: mockUser,
            setUser: vi.fn(),
        });
    });

    it('opens the modal on click and displays user info', () => {
        render(
            <ProfileModal user={mockUser}>
                <button>Open Profile</button>
            </ProfileModal>
        );

        // Modal is not visible initially
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();

        // Click the trigger
        fireEvent.click(screen.getByText('Open Profile'));

        // Modal should be visible with user info
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText(/email: test@example.com/i)).toBeInTheDocument();
    });
});
