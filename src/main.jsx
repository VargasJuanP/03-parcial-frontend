import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import initSentry, { Sentry } from './components/sentry/sentry.js'
import { configureSentryTags } from './lib/sentryUtils'

initSentry();

configureSentryTags({
  framework: 'react',
  vite_version: '__VITE_VERSION__',  
  react_version: '__REACT_VERSION__' 
});

const FallbackComponent = ({ error, componentStack, resetError }) => (
  <div className="sentry-error-boundary">
    <h2>¡Algo salió mal!</h2>
    <p>Hemos registrado el error y estamos trabajando para solucionarlo.</p>
    <details>
      <summary>Detalles del error (sólo visible en desarrollo)</summary>
      <pre>{error.toString()}</pre>
      <pre>{componentStack}</pre>
    </details>
    <button onClick={resetError}>Intentar de nuevo</button>
    <button onClick={() => window.location.reload()}>Recargar página</button>
  </div>
);

const SentryErrorBoundary = ({ children }) => (
  <Sentry.ErrorBoundary
    fallback={FallbackComponent}
    beforeCapture={(scope) => {
      scope.setTag("errorLocation", "global-error-boundary");
      scope.setLevel("fatal");
    }}
    onError={(error) => {
      console.error("Error capturado por Error Boundary global:", error);
      
      Sentry.captureMessage("Error crítico en la aplicación", {
        level: "fatal",
        extra: {
          timestamp: new Date().toISOString()
        }
      });
    }}
  >
    {children}
  </Sentry.ErrorBoundary>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SentryErrorBoundary>
      <App />
    </SentryErrorBoundary>
  </StrictMode>,
)
