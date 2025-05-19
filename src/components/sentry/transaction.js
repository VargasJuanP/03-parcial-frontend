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
    setData: (key, value) => {},
    setTag: (key, value) => {},
    setStatus: (status) => {},
    finish: () => {},
  };
};

/**
 * Función para medir el rendimiento de una operación asincrónica
 * 
 * @param {string} name - Nombre de la transacción
 * @param {Function} fn - Función asincrónica a medir
 * @param {Object} data - Datos adicionales
 * @returns {Promise} - Resultado de la función medida
 */
export const measureAsync = async (name, fn, data = {}) => {
  const transaction = startTransaction({
    name,
    op: 'function',
    data
  });
  
  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('error');
    Sentry.captureException(error, {
      tags: { transaction: name },
      extra: data
    });
    throw error;
  } finally {
    transaction.finish();
  }
};

export default {
  startTransaction,
  measureAsync
};
