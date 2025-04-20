import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../firebase/config";
import "../../../css/register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });

      setFormData({ username: "", email: "", password: "" });
      setSuccess(true);
    } catch (error) {
      setError(error.message);
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

export default Register;
