// src/components/post/__tests__/Post.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Post from '../index';

// Properly mock onSnapshot to avoid act warnings
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    onSnapshot: vi.fn((_, callback) => {
      // Return unsubscribe function
      return vi.fn();
    }),
    query: vi.fn(() => ({})),
    collection: vi.fn(() => ({})),
    where: vi.fn(() => ({})),
    getDocs: vi.fn(() => Promise.resolve({
      empty: true,
      docs: [],
      forEach: vi.fn()
    })),
  };
});

describe('Post Component', () => {
  const mockPost = {
    id: 'post123',
    content: 'This is a test post',
    authorId: 'user123',
    authorName: 'Test User',
    createdAt: { seconds: 1666000000, nanoseconds: 0 }
  };
  
  const mockUser = { uid: 'user123', displayName: 'Test User' };
  const mockHandleRefresh = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should display post content correctly', async () => {
    // Using act to handle async state updates
    await act(async () => {
      render(
        <Post 
          user={mockUser} 
          post={mockPost} 
          handleRefresh={mockHandleRefresh} 
        />
      );
    });
    
    // Check post content
    expect(screen.getByText('This is a test post')).toBeInTheDocument();
  });

  it('should display author information', async () => {
    await act(async () => {
      render(
        <Post 
          user={mockUser} 
          post={mockPost} 
          handleRefresh={mockHandleRefresh} 
        />
      );
    });
    
    // Check author name
    expect(screen.getByText('@Test User')).toBeInTheDocument();
  });
});