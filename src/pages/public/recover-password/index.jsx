import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { Navigate } from "react-router-dom";
import "../../../styles/login.css";

function RecoverPassword({ user }) {
  if (user) {
    return <Navigate to="/profile" />;
  }

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        "Se ha enviado un correo para restablecer tu contraseña. Por favor revisa tu bandeja de entrada."
      );
      setEmail("");
    } catch (err) {
      
      if (err.code === "auth/user-not-found") {
        setError("No existe una cuenta con este correo electrónico");
      } else {
        setError("Error al enviar el correo. Inténtalo de nuevo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Recuperar contraseña</h1>
      
      <form onSubmit={handleSubmit}>
        <p>Ingresa tu correo electrónico para recibir un enlace de recuperación</p>
        <input
          type="email"
          value={email}
          placeholder="Correo electrónico"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Recuperar contraseña"}
        </button>
      </form>
    </div>
  );
}

export default RecoverPassword;
