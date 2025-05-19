// Mock version of Sentry for testing

export const Sentry = {
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() })),
  ErrorBoundary: ({ children }) => children,
  withProfiler: (Component) => Component,
};

export const startTransaction = () => ({
  setData: jest.fn(),
  setTag: jest.fn(),
  setStatus: jest.fn(),
  finish: jest.fn(),
});

export const withSentry = (Component) => Component;

export const useSentryMonitor = () => ({
  captureComponentError: jest.fn(),
});

export const SentryComponentErrorBoundary = ({ children }) => children;
