import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { vi } from 'vitest';

// Mock the page components to prevent full rendering and focus on routing
vi.mock('./pages/HomePage', () => ({
  default: vi.fn(() => <div>Home Page Mock</div>),
}));
vi.mock('./pages/ChatPage', () => ({
  default: vi.fn(() => <div>Chat Page Mock</div>),
}));

// Import the mocked modules to access their default exports
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';

describe('App Routing', () => {
  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders HomePage component when navigating to "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Home Page Mock')).toBeInTheDocument();
    // Check if the mock was called
    expect(HomePage).toHaveBeenCalledTimes(1);
    expect(ChatPage).not.toHaveBeenCalled();
  });

  it('renders ChatPage component when navigating to "/chats"', () => {
    render(
      <MemoryRouter initialEntries={['/chats']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Chat Page Mock')).toBeInTheDocument();
    // Check if the mock was called
    expect(ChatPage).toHaveBeenCalledTimes(1);
    expect(HomePage).not.toHaveBeenCalled();
  });
});
