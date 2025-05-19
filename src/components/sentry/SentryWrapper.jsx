import React from 'react';
import * as Sentry from '@sentry/react';

export const withSentry = (Component, options = {}) => {
  const componentName = Component.displayName || Component.name || 'UnknownComponent';
  
  const defaultOptions = {
    componentName,
    shouldProfile: true, 
    traceProps: true       
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  const WrappedComponent = (props) => {
    React.useEffect(() => {
      Sentry.addBreadcrumb({
        category: 'component',
        message: `${componentName} montado`,
        level: 'info'
      });
      
      return () => {
        Sentry.addBreadcrumb({
          category: 'component',
          message: `${componentName} desmontado`,
          level: 'info'
        });
      };
    }, []);

    return (
      <Sentry.ErrorBoundary 
        name={finalOptions.componentName}
        beforeCapture={(scope) => {
          scope.setTag("component", finalOptions.componentName);
          scope.setContext("props", { ...props });
        }}
      >
        <Component {...props} />
      </Sentry.ErrorBoundary>
    );
  };
  
  let ExportedComponent = WrappedComponent;
  if (finalOptions.shouldProfile) {
    ExportedComponent = Sentry.withProfiler(WrappedComponent, { name: finalOptions.componentName });
  }
  
  ExportedComponent.displayName = `WithSentry(${componentName})`;
  
  return ExportedComponent;
};

export const SentryComponentErrorBoundary = ({ children, componentName }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="component-error">
          <p>Error en {componentName || 'componente'}</p>
          <button onClick={resetError}>Reintentar</button>
        </div>
      )}
      beforeCapture={(scope) => {
        scope.setTag("componentError", componentName || 'unknown');
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export const useSentryMonitor = (componentName) => {
  React.useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'component-hook',
      message: `${componentName} iniciado`,
      level: 'info'
    });
    
    return () => {
      Sentry.addBreadcrumb({
        category: 'component-hook',
        message: `${componentName} finalizado`,
        level: 'info'
      });
    };
  }, [componentName]);
  
  const captureComponentError = (error, context = {}) => {
    Sentry.withScope(scope => {
      scope.setTag("source", "component-hook");
      scope.setTag("component", componentName);
      scope.setContext("additionalData", context);
      Sentry.captureException(error);
    });
  };
  
  return { captureComponentError };
};

export default { withSentry, SentryComponentErrorBoundary, useSentryMonitor };
