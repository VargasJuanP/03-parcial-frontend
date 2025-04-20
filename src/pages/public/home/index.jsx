function Home({ user }) {
  return (
    <div>
      <h1>Twitter 2</h1>
      {user ? (
        <p>Bienvenido, {user.displayName}</p>
      ) : (
        <p>Inicia sesión para continuar</p>
      )}
    </div>
  );
}

export default Home;
