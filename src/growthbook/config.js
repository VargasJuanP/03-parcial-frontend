import { GrowthBook } from "@growthbook/growthbook-react";

// Crear instancia de GrowthBook
export const growthbook = new GrowthBook({
  apiHost: import.meta.env.VITE_GROWTHBOOK_API_HOST || "https://cdn.growthbook.io",
  clientKey: import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY,
  enableDevMode: import.meta.env.DEV,
  subscribeToChanges: true,
  trackingCallback: (experiment, result) => {
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
  // Obtener o generar un ID anónimo si no hay usuario autenticado
  let anonymousId = localStorage.getItem("anonymousId");
  
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem("anonymousId", anonymousId);
  }

  const userId = user?.uid || anonymousId;

  // Configurar atributos del usuario
  growthbook.setAttributes({
    id: userId,
    loggedIn: !!user,
    email: user?.email,
    displayName: user?.displayName,
    date: new Date().toISOString(),
    environment: import.meta.env.MODE
  });

  // Cargar las definiciones de features desde GrowthBook
  growthbook.loadFeatures();
};
