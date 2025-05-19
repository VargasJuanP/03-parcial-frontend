import { GrowthBook } from "@growthbook/growthbook-react";

// Crear instancia de GrowthBook
export const growthbook = new GrowthBook({
  apiHost: import.meta.env.VITE_GROWTHBOOK_API_HOST || "https://cdn.growthbook.io",
  clientKey: import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY,
  enableDevMode: import.meta.env.DEV, // Facilita la depuración en desarrollo
  subscribeToChanges: true, // Actualiza automáticamente cuando los features cambian
  trackingCallback: (experiment, result) => {
    // Aquí podemos enviar eventos de tracking a una herramienta analítica
    console.log("Experimento visto:", experiment.key, "Variante:", result.variationId);
    
    // Integración con Sentry si es necesario
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'experiment',
        message: `Experimento: ${experiment.key}, Variante: ${result.variationId}`,
        level: 'info'
      });
    }
  }
});

// Función para inicializar GrowthBook con los atributos del usuario
export const initGrowthBook = (user) => {
  // Configurar atributos del usuario
  growthbook.setAttributes({
    id: user?.uid || "anonymous",
    loggedIn: !!user,
    email: user?.email,
    displayName: user?.displayName,
    // Otros atributos que quieras usar para segmentación
    date: new Date().toISOString(),
    environment: import.meta.env.MODE
  });

  // Cargar las definiciones de features desde GrowthBook
  growthbook.loadFeatures();
};