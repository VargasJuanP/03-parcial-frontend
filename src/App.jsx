import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./styles/App.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

import Home from "./pages/public/home";
import Login from "./pages/public/login";
import Register from "./pages/public/register";
import Profile from "./pages/private/profile";
import RecoverPassword from "./pages/public/recover-password";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      setUser(null);
    });
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
          <Route path="/" element={<Home user={user} />} />
          <Route path="/register" element={<Register user={user} />} />
          <Route
            path="/login"
            element={<Login user={user} setUser={setUser} />}
          />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route
            path="/recover-password"
            element={<RecoverPassword user={user} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
