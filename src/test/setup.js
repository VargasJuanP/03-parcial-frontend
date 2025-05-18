// src/test/setup.js
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Firebase Auth mocks
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(() => Promise.resolve()),
  })),
  onAuthStateChanged: vi.fn((_, callback) => {
    callback(null);
    return vi.fn(); // Unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ 
    user: { uid: 'test-uid', displayName: 'Test User' } 
  })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ 
    user: { uid: 'test-uid' } 
  })),
  updateProfile: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
}));

// Firebase Firestore mocks
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(() => 'collection-mock'),
  doc: vi.fn(() => 'doc-mock'),
  addDoc: vi.fn(() => Promise.resolve({ id: 'doc123' })),
  setDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(() => Promise.resolve({ 
    docs: [],
    empty: true,
    forEach: vi.fn(),
  })),
  query: vi.fn(collection => collection),
  where: vi.fn(() => 'where-mock'),
  orderBy: vi.fn(() => 'orderBy-mock'),
  serverTimestamp: vi.fn(() => new Date()),
  onSnapshot: vi.fn((_, callback) => {
    if (typeof callback === 'function') {
      callback({
        docs: [],
        forEach: vi.fn(),
      });
    }
    return vi.fn(); // Unsubscribe function
  }),
}));

// Firebase config mock
vi.mock('../firebase/config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((_, callback) => {
      callback(null);
      return vi.fn();
    }),
    signOut: vi.fn(() => Promise.resolve()),
  },
  db: {},
}));

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});