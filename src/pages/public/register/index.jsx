import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { Navigate } from "react-router-dom";
import "../../../styles/register.css";
import * as Sentry from "@sentry/react";
import { startTransaction } from "../../../lib/sentryUtils";
import { withSentry, useSentryMonitor } from "../../../components/sentry/SentryWrapper";

function Register({ user }) {
  if (user) {
    return <Navigate to="/profile" />;
  }

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { captureComponentError } = useSentryMonitor("Register");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const transaction = startTransaction({
        name: "register-transaction",
      });
      
      transaction.setData("email_domain", formData.email.split('@')[1]);
      transaction.setData("username_length", formData.username.length);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });
      
      Sentry.captureMessage("Registro de usuario exitoso", {
        level: "info",
        tags: {
          action: "register_success",
          email_domain: formData.email.split('@')[1],
        }
      });
      
      transaction.finish();
      
      // Limpiar formulario y mostrar éxito
      setFormData({ username: "", email: "", password: "" });
      setSuccess(true);
    } catch (error) {
      setError("Error al registrar el usuario. Inténtalo de nuevo.");
      
      captureComponentError(error, {
        action: "register_attempt",
        errorCode: error.code,
        errorMessage: error.message,
        email_domain: formData.email.split('@')[1],
        username_length: formData.username.length
      });
    }
  };

  return (
    <div className="register-container">
      <h1>Registrarse</h1>

      {error && <p className="error-message">{error}</p>}
      {success && (
        <p className="success-message">Usuario registrado exitosamente!</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="username"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          id="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          id="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
        <button type="submit" id="register-button">
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default withSentry(Register, {
  componentName: "Register",
  shouldProfile: true
});
