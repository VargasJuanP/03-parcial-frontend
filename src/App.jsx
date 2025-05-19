import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./styles/App.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import { Sentry } from "./components/sentry/sentry"; 
import { startTransaction } from "./components/sentry/transaction"; 
import { withSentry, SentryComponentErrorBoundary } from "./components/sentry/SentryWrapper";
import { initGrowthBook } from "./growthbook/config";

import Home from "./pages/public/home";
import Login from "./pages/public/login";
import Register from "./pages/public/register";
import Profile from "./pages/private/profile";
import RecoverPassword from "./pages/public/recover-password";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Crear una transacción para medir el rendimiento de autenticación
    const transaction = startTransaction({
      name: "authentication-flow",
    });
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Inicializar GrowthBook con información del usuario
      initGrowthBook(currentUser);
      
      // Si el usuario inicia sesión, registra el evento en Sentry con información del usuario
      if (currentUser) {
        // Configurar contexto de usuario en Sentry
        Sentry.setUser({
          id: currentUser.uid,
          email: currentUser.email,
          username: currentUser.displayName || "Usuario sin nombre",
        });
        
        // Registrar evento de sesión iniciada
        Sentry.captureMessage("Usuario ha iniciado sesión", {
          level: "info",
          tags: {
            action: "login",
            userId: currentUser.uid
          },
          extra: {
            emailVerified: currentUser.emailVerified,
            lastLogin: new Date().toISOString()
          }
        });
      } else {
        // Si el usuario cierra sesión, limpia la información del usuario en Sentry
        Sentry.setUser(null);
      }
      
      // Finalizar la transacción
      transaction.finish();
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    try {
      const transaction = startTransaction({
        name: "sign-out-flow",
      });
      
      auth.signOut().then(() => {
        setUser(null);
        Sentry.captureMessage("Usuario ha cerrado sesión", {
          level: "info",
          tags: { action: "logout" }
        });
        transaction.finish();
      }).catch(error => {
        // Captura cualquier error durante el cierre de sesión
        Sentry.captureException(error, {
          tags: { action: "logout_error" }
        });
        transaction.finish();
      });
    } catch (error) {
      // Captura excepciones no manejadas
      Sentry.captureException(error, {
        tags: { action: "logout_critical_error" }
      });
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <nav>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/profile">Perfil</Link>
                </li>
                <li>
                  <button onClick={handleSignOut}>Cerrar sesión</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Iniciar sesión</Link>
                </li>
                <li>
                  <Link to="/register">Registrarse</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          {/* Envolver cada ruta con SentryComponentErrorBoundary para capturar errores específicos */}
          <Route path="/" element={
            <SentryComponentErrorBoundary componentName="Home">
              <Home user={user} />
            </SentryComponentErrorBoundary>
          } />
          <Route path="/register" element={
            <SentryComponentErrorBoundary componentName="Register">
              <Register user={user} />
            </SentryComponentErrorBoundary>
          } />
          <Route path="/login" element={
            <SentryComponentErrorBoundary componentName="Login">
              <Login user={user} setUser={setUser} />
            </SentryComponentErrorBoundary>
          } />
          <Route path="/profile" element={
            <SentryComponentErrorBoundary componentName="Profile">
              <Profile user={user} />
            </SentryComponentErrorBoundary>
          } />
          <Route path="/recover-password" element={
            <SentryComponentErrorBoundary componentName="RecoverPassword">
              <RecoverPassword user={user} />
            </SentryComponentErrorBoundary>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default withSentry(App, {
  componentName: "App",
  shouldProfile: true
});