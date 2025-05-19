// Mock for @sentry/react
const withProfiler = jest.fn((component) => component);
const withScope = jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() }));
const ErrorBoundary = ({ children }) => children;

const captureException = jest.fn();
const captureMessage = jest.fn();
const addBreadcrumb = jest.fn();
const setUser = jest.fn();
const setTag = jest.fn();
const init = jest.fn();

// Default export for ESM imports
export default {
  withProfiler,
  withScope,
  ErrorBoundary,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  init,
  browserTracingIntegration: jest.fn(),
  replayIntegration: jest.fn(),
  feedbackIntegration: jest.fn()
}

// Named exports for * as Sentry
export {
  withProfiler,
  withScope,
  ErrorBoundary,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  init
}
