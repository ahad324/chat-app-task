import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationModal from '../ConfirmationModal';

describe('ConfirmationModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const props = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Title',
    children: <p>Are you sure?</p>,
  };

  it('renders the modal when isOpen is true', () => {
    render(<ConfirmationModal {...props} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(<ConfirmationModal {...props} isOpen={false} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    render(<ConfirmationModal {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the cancel button is clicked', () => {
    render(<ConfirmationModal {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
