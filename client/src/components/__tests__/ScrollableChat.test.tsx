
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScrollableChat from '../ScrollableChat';
import { ChatState } from '../../context/ChatProvider';
import { Message } from '../../types';

vi.mock('../../context/ChatProvider', () => ({
    ChatState: vi.fn(),
}));

const mockMessages: Message[] = [
    {
        _id: '1',
        content: 'Hello',
        sender: { _id: 'user1', name: 'John Doe', email: 'john@example.com', pic: 'url' },
        chat: { _id: 'chat1', chatName: 'Test Chat', users: [], isGroupChat: false, groupAdmin: undefined, latestMessage: undefined },
        isDeleted: false,
    },
    {
        _id: '2',
        content: 'Hi there',
        sender: { _id: 'user2', name: 'Jane Doe', email: 'jane@example.com', pic: 'url' },
        chat: { _id: 'chat1', chatName: 'Test Chat', users: [], isGroupChat: false, groupAdmin: undefined, latestMessage: undefined },
        isDeleted: false,
    },
];

describe('ScrollableChat Component', () => {
    it('renders messages correctly', () => {
        (ChatState as vi.Mock).mockReturnValue({
            user: { _id: 'user2' },
        });

        render(<ScrollableChat messages={mockMessages} onEdit={vi.fn()} onDelete={vi.fn()} />);
        
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there')).toBeInTheDocument();
    });
});
