
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Signup from '../Signup';
import { MemoryRouter } from 'react-router-dom';

describe('Signup Component', () => {
    it('renders the signup form correctly', () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );
        expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
});
