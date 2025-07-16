import { render, screen } from '@testing-library/react';
import ChatBox from '../ChatBox';
import { vi } from 'vitest';

// Mock the SingleChat component
vi.mock('../SingleChat', () => ({
  __esModule: true,
  default: () => <div data-testid="single-chat">SingleChat Component</div>,
}));

// Mock the ChatState context
const mockChatState = vi.fn();
vi.mock('../../context/ChatProvider', () => ({
  ChatState: () => mockChatState(),
}));

describe('ChatBox Component', () => {
  it('should display "Click on a user to start chatting" when no chat is selected', () => {
    mockChatState.mockReturnValue({ selectedChat: null });
    render(<ChatBox />);
    expect(screen.getByText('Click on a user to start chatting')).toBeInTheDocument();
    expect(screen.queryByTestId('single-chat')).not.toBeInTheDocument();
  });

  it('should display the SingleChat component when a chat is selected', () => {
    const selectedChat = {
      _id: 'chat123',
      chatName: 'Test Chat',
      isGroupChat: false,
      users: [],
      createdAt: '',
      updatedAt: '',
    };
    mockChatState.mockReturnValue({ selectedChat });
    render(<ChatBox />);
    expect(screen.getByTestId('single-chat')).toBeInTheDocument();
    expect(screen.queryByText('Click on a user to start chatting')).not.toBeInTheDocument();
  });
});
