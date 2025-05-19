import * as Sentry from '@sentry/react';

/**
 * Crea y comienza una nueva transacción para monitoreo de rendimiento
 * 
 * @param {Object} options - Opciones para la transacción
 * @param {string} options.name - Nombre de la transacción (requerido)
 * @param {string} options.op - Tipo de operación (opcional)
 * @param {Object} options.data - Datos adicionales (opcional)
 * @returns {Object} - Objeto de transacción con métodos setData, setTag, setStatus y finish
 */
export const startTransaction = (options) => {
  if (!options || !options.name) {
    console.warn('Se requiere un nombre para iniciar una transacción de Sentry');
    return createNoopTransaction();
  }

  try {
    const transaction = {
      setData: (key, value) => {
        try {
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Data set for transaction ${options.name}: ${key}=${JSON.stringify(value)}`,
            level: 'info',
            data: { [key]: value }
          });
        } catch (e) {
          // No hacer nada si falla
        }
        return transaction;
      },
      setTag: (key, value) => {
        try {
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Tag set for transaction ${options.name}: ${key}=${value}`,
            level: 'info'
          });
        } catch (e) {
          // No hacer nada si falla
        }
        return transaction;
      },
      setStatus: (status) => {
        try {
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Transaction ${options.name} status: ${status}`,
            level: status === 'ok' ? 'info' : 'warning'
          });
        } catch (e) {
          // No hacer nada si falla
        }
        return transaction;
      },
      finish: () => {
        try {
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Transaction ${options.name} finished`,
            level: 'info',
            data: options.data || {}
          });
          
          Sentry.captureMessage(`Performance: ${options.name}`, {
            level: 'info',
            tags: {
              transaction: options.name,
              operation: options.op || 'default'
            },
            extra: options.data || {}
          });
        } catch (e) {
          // No hacer nada si falla
        }
      }
    };
    
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Transaction ${options.name} started`,
      level: 'info'
    });
    
    return transaction;
  } catch (error) {
    console.error('Error al iniciar transacción de Sentry:', error);
    return createNoopTransaction();
  }
};

/**
 * Crea un objeto de transacción que no hace nada (para compatibilidad)
 */
const createNoopTransaction = () => {
  return {
    setData: () => {},
    setTag: () => {},
    setStatus: () => {},
    finish: () => {},
  };
};

/**
 * Configura información del usuario en Sentry
 * @param {Object} user - Usuario de Firebase Auth
 */
export const configureSentryUser = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  
  Sentry.setUser({
    id: user.uid,
    email: user.email,
    username: user.displayName || 'Usuario sin nombre',
    ip_address: '{{auto}}',
  });
};

/**
 * Configura tags comunes para toda la aplicación
 * @param {Object} tags - Etiquetas a configurar globalmente
 */
export const configureSentryTags = (tags = {}) => {
  const defaultTags = {
    app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE,
    platform: 'web',
  };
  
  const allTags = { ...defaultTags, ...tags };
  
  Object.entries(allTags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
};

/**
 * Registra un evento de rendimiento con Sentry
 * @param {string} name - Nombre del evento
 * @param {Function} fn - Función a medir
 * @param {Object} data - Datos adicionales
 */
export const trackPerformance = async (name, fn, data = {}) => {
  const transaction = startTransaction({
    name,
    data,
  });
  
  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('error');
    Sentry.captureException(error, { 
      tags: { 
        transaction: name 
      },
      extra: data
    });
    throw error;
  } finally {
    transaction.finish();
  }
};

/**
 * Añade un rastro de miga de pan al contexto de Sentry
 * @param {string} category - Categoría del rastro 
 * @param {string} message - Mensaje descriptivo
 * @param {Object} data - Datos adicionales
 */
export const addBreadcrumb = (category, message, data = {}) => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: data.level || 'info'
  });
};

export default {
  configureSentryUser,
  configureSentryTags,
  trackPerformance,
  addBreadcrumb,
  startTransaction
};
