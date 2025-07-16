import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import Signup from '../Signup';
import { MemoryRouter } from 'react-router-dom';

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

describe('Signup Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    const renderResult = render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    container = renderResult.container;
  });

  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } });
  };

  it('renders the signup form correctly', () => {
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows an error if fields are empty', async () => {
    fireEvent.submit(container.querySelector('form')!);
    expect(await screen.findByText('Please fill all the fields')).toBeInTheDocument();
  });

  it('shows an error if passwords do not match', async () => {
    fillForm(); // Fill all fields first
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password456' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('shows an error if password is too short', async () => {
    fillForm(); // Fill all fields first
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: '123' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(await screen.findByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const mockUserData = { _id: '123', name: 'Test User', email: 'test@example.com', token: 'fake-token' };
    mockedAxios.post.mockResolvedValue({ data: mockUserData });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/user'),
        expect.any(FormData),
        expect.any(Object),
      );
      expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(mockUserData));
      expect(mockNavigate).toHaveBeenCalledWith('/chats');
    });
  });
});
