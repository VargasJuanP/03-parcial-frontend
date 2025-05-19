export const Sentry = {
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() })),
  ErrorBoundary: ({ children }) => children,
  withProfiler: (Component) => Component,
};
