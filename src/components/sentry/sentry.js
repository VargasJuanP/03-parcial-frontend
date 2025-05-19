import * as Sentry from "@sentry/react";

const initSentry = () => {
  const isDevelopment = import.meta.env.MODE !== 'production';
  
  const dsn = import.meta.env.VITE_SENTRY_DSN || "YOUR_SENTRY_DSN";
  
  const isSentryDisabled = dsn === "YOUR_SENTRY_DSN";
  
  Sentry.init({
    dsn: isSentryDisabled ? "" : dsn,
  
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: isDevelopment ? false : true,     
        blockAllMedia: isDevelopment ? false : true,   
      }),
      Sentry.feedbackIntegration({
        colorScheme: "system",
        isEmailRequired: false,
        showBranding: false,
        showName: false,
        buttonLabel: "Reportar problema",
        messageLabel: "Describe el problema",
        placement: "bottom-right",
        thanksMessage: "¡Gracias por tu feedback!",
      }),
    ],
    
    // Configuración de muestreo
    tracesSampleRate: isDevelopment ? 1.0 : 0.2,       
    replaysSessionSampleRate: isDevelopment ? 1.0 : 0.1, 
    replaysOnErrorSampleRate: 1.0,                     
    
    // Configuración general
    environment: import.meta.env.MODE,                 
    release: import.meta.env.VITE_APP_VERSION || "1.0.0", 
    debug: isDevelopment,                              
    
    beforeSend: (event, hint) => {
      if (isSentryDisabled || isDevelopment) {
        console.group("🔔 Sentry Event (not sent)");
        console.log("Event:", event);
        console.log("Hint:", hint);
        console.groupEnd();
      }
      
      return event;
    },
    
    beforeBreadcrumb(breadcrumb) {
      return breadcrumb;
    },
  });
  
  Sentry.setTag("app_version", import.meta.env.VITE_APP_VERSION || "1.0.0");
  Sentry.setTag("environment", import.meta.env.MODE);
  
  if (isDevelopment) {
    console.log(`🔔 Sentry initialized in ${import.meta.env.MODE} mode`);
    if (isSentryDisabled) {
      console.warn("⚠️ Sentry is in demo mode - events will not be sent to Sentry");
    }
  }
};

// Export Sentry for direct use
export { Sentry };

// Export the initialization function as default
export default initSentry;
