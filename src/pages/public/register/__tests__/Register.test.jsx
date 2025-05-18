import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../index';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display the registration form when user is not authenticated', () => {
    render(
      <BrowserRouter>
        <Register user={null} />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument();
  });

  it('should attempt to register when form is submitted with valid data', async () => {
    render(
      <BrowserRouter>
        <Register user={null} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    });

    // Assert that the Firebase methods were called
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        'test@example.com',
        'password123'
      );
      expect(updateProfile).toHaveBeenCalledWith(expect.anything(), {
        displayName: 'testuser'
      });
    });
  });

  it('should redirect if user is already authenticated', () => {
    const mockUser = { uid: 'test-uid', displayName: 'Test User' };

    render(
      <BrowserRouter>
        <Register user={mockUser} />
      </BrowserRouter>
    );

    // Form shouldn't be rendered
    expect(screen.queryByPlaceholderText('Nombre de usuario')).not.toBeInTheDocument();
  });
});
