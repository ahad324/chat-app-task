
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SideDrawer from '../SideDrawer';
import { ChatState } from '../../../context/ChatProvider';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../context/ChatProvider', () => ({
    ChatState: vi.fn(),
}));

const mockUser = {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    pic: 'url',
    token: 'fake-token',
};

describe('SideDrawer Component', () => {
    beforeEach(() => {
        (ChatState as vi.Mock).mockReturnValue({
            user: mockUser,
            setSelectedChat: vi.fn(),
            chats: [],
            setChats: vi.fn(),
        });
    });

    it('toggles the drawer visibility on search button click', () => {
        render(
            <MemoryRouter>
                <SideDrawer />
            </MemoryRouter>
        );

        const drawerContainer = screen.getByText('Search Users').parentElement;

        // Drawer should be closed initially
        expect(drawerContainer).toHaveClass('-translate-x-full');

        // Click the search button
        fireEvent.click(screen.getByRole('button', { name: /search user/i }));

        // Drawer should be open
        expect(drawerContainer).toHaveClass('translate-x-0');
        expect(drawerContainer).not.toHaveClass('-translate-x-full');

        // Click the close button
        fireEvent.click(screen.getByRole('button', { name: /close menu/i }));

        // Drawer should be closed again
        expect(drawerContainer).toHaveClass('-translate-x-full');
    });
});
