import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useNavigate, Navigate, Link } from "react-router-dom";
import "../../../styles/login.css";
import * as Sentry from "@sentry/react";
import { startTransaction } from "../../../lib/sentryUtils";
import { withSentry, useSentryMonitor } from "../../../components/sentry/SentryWrapper";

function Login({ user }) {
  if (user) {
    return <Navigate to="/profile" />;
  }

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { captureComponentError } = useSentryMonitor("Login");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const transaction = startTransaction({
        name: "login-transaction",
      });
      
      transaction.setData("email_domain", formData.email.split('@')[1]);
      
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      Sentry.captureMessage("Inicio de sesión exitoso", {
        level: "info",
        tags: {
          action: "login_success",
          email_domain: formData.email.split('@')[1]
        }
      });
      
      transaction.finish();
      
      navigate("/");
    } catch (err) {
      console.error("Error signing in:", err);
      
      const errorMessage = err.code === "auth/invalid-credential"
        ? "Correo o contraseña incorrectos"
        : "Error al iniciar sesión. Inténtalo de nuevo.";
      
      setError(errorMessage);
      
      captureComponentError(err, {
        action: "login_attempt",
        errorCode: err.code,
        errorMessage: err.message,
        email_domain: formData.email.split('@')[1]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          id="email"
          value={formData.email}
          placeholder="Correo electrónico"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          id="password"
          value={formData.password}
          placeholder="Contraseña"
          onChange={handleChange}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
        <Link to="/recover-password">¿Olvidaste tu contraseña?</Link>
      </form>
    </div>
  );
}

export default withSentry(Login, {
  componentName: "Login",
  shouldProfile: true
});
