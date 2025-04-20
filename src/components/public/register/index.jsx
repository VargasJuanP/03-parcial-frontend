import "../../../css/register.css";

function Register() {
  return (
    <div>
      <h1>Registrarse</h1>

      <form>
        <input type="text" id="username" placeholder="Nombre de usuario" />
        <input type="email" id="email" placeholder="Correo electrónico" />
        <input type="password" id="password" placeholder="Contraseña" />
        <button type="submit" id="register-button">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;
