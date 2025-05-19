import { useFeature } from "@growthbook/growthbook-react";
import { Link } from "react-router-dom";

function LoginCTA() {
  const { value } = useFeature("login-cta-experiment", {
    defaultValue: "link" // Si no hay feature flag, usar enlace como default
  });

  console.log(value)

  if (value === "button") {
    return (
      <Link to="/login">
        <button className="login-button-cta">Iniciar sesión</button>
      </Link>
    );
  } else {
    return <Link to="/login" className="login-link-cta">Iniciar sesión</Link>;
  }
}

export default LoginCTA;