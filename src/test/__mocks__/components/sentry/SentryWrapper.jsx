export const withSentry = (Component) => Component;

export const useSentryMonitor = () => ({
  captureComponentError: jest.fn(),
});

export const SentryComponentErrorBoundary = ({ children }) => children;
