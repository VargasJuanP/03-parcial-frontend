import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Home from "./pages/public/home";
import Login from "./pages/public/login";
import Register from "./pages/public/register";
import Profile from "./pages/private/profile";

function App() {
  const [user, setUser] = useState(null);

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
                  <button
                    onClick={() => {
                      setUser(null);
                    }}
                  >
                    Cerrar sesión
                  </button>
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
          <Route path="/" element={<Home user={user} />} />
          <Route path="/register" element={<Register user={user} />} />
          <Route
            path="/login"
            element={<Login user={user} setUser={setUser} />}
          />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
