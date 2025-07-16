import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserListItem from '../UserListItem';
import { User } from '../../../types';

const mockUser: User = {
  _id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  pic: 'some-pic-url',
};

describe('UserListItem Component', () => {
  it('renders user information correctly', () => {
    render(<UserListItem user={mockUser} handleFunction={() => {}} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute('src', 'some-pic-url');
  });

  it('calls the handleFunction on click', () => {
    const handleClick = vi.fn();
    render(<UserListItem user={mockUser} handleFunction={handleClick} />);

    const item = screen.getByText('John Doe').parentElement.parentElement;
    fireEvent.click(item);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
