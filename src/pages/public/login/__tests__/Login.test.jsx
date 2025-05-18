// src/pages/public/login/__tests__/Login.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../index';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display the login form when user is not authenticated', () => {
    render(
      <BrowserRouter>
        <Login user={null} />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
  });

  it('should attempt to login when form is submitted with credentials', async () => {
    render(
      <BrowserRouter>
        <Login user={null} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    // Verify that signInWithEmailAndPassword was called with correct params
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
  });

  it('should redirect if user is already authenticated', () => {
    const mockUser = { uid: 'test-uid', displayName: 'Test User' };
    
    render(
      <BrowserRouter>
        <Login user={mockUser} />
      </BrowserRouter>
    );

    // Verify that the form is not displayed (redirected)
    expect(screen.queryByPlaceholderText('Correo electrónico')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Contraseña')).not.toBeInTheDocument();
  });
});