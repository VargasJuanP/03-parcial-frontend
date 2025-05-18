// src/components/createPost/__tests__/CreatePost.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatePost from '../index';
import { addDoc } from 'firebase/firestore';

describe('CreatePost Component', () => {
  // Test data
  const mockUser = {
    uid: 'user123',
    displayName: 'Test User',
  };
  const mockHandleRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the post creation form', () => {
    render(<CreatePost user={mockUser} handleRefresh={mockHandleRefresh} />);
    
    // Check if form elements are present
    expect(screen.getByPlaceholderText("¿En qué estás pensando hoy?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument();
  });

  it('should create a post when the form is submitted with content', async () => {
    render(<CreatePost user={mockUser} handleRefresh={mockHandleRefresh} />);

    // Fill the textarea
    const textarea = screen.getByPlaceholderText("¿En qué estás pensando hoy?");
    fireEvent.change(textarea, {
      target: { value: 'This is a test post' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Publicar' });
    fireEvent.click(submitButton);

    // Verify that addDoc was called and the form was reset
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      expect(mockHandleRefresh).toHaveBeenCalled();
      expect(textarea.value).toBe('');
    });
  });

  it('should not create a post when the form is submitted with empty content', async () => {
    render(<CreatePost user={mockUser} handleRefresh={mockHandleRefresh} />);

    // Submit form without filling the textarea
    const submitButton = screen.getByRole('button', { name: 'Publicar' });
    fireEvent.click(submitButton);

    // Wait a bit and verify addDoc was not called
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(addDoc).not.toHaveBeenCalled();
    expect(mockHandleRefresh).not.toHaveBeenCalled();
  });
});