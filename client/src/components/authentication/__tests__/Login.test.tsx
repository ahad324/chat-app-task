import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import Login from '../Login';
import { renderWithProviders } from '../../../tests/mocks';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set user to null for login tests
    renderWithProviders(<Login />, { providerProps: { user: null } });
  });

  it('renders the login form correctly', () => {
    expect(screen.getByPlaceholderText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', () => {
    const emailInput = screen.getByPlaceholderText(/enter your email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it.skip('shows an error message if fields are empty on submit', async () => {
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.click(loginButton);
    expect(await screen.findByText(/please fill all the fields/i)).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('calls the login API and navigates to /chats on successful login', async () => {
    const mockUserData = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      token: 'fake-token',
    };
    mockedAxios.post.mockResolvedValue({ data: mockUserData });

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/user/login'),
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object),
      );
    });

    await waitFor(() => {
      expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(mockUserData));
      expect(mockNavigate).toHaveBeenCalledWith('/chats');
    });
  });

  it('shows an error message on failed login', async () => {
    const errorMessage = 'Invalid Email or Password';
    mockedAxios.post.mockRejectedValue({
      response: {
        data: { message: errorMessage },
      },
    });

    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
