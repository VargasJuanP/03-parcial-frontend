import CreatePost from "../../../components/createPost";
import Post from "../../../components/post";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import "../../../styles/home.css";
import { useState, useEffect } from "react";
import { db } from "../../../firebase/config";

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Para que se actualice la lista de posts cuando se crea un nuevo post
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Ordenadas segun la mas reciente
        const q = query(collection(db, "tweets"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } catch (err) {
        console.error("Error al cargar el timeline:", err);
        setError("Error al cargar el timeline. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <div>
      <h1>Twitter 2</h1>
      {user ? (
        <p>Bienvenido, {user.displayName}</p>
      ) : (
        <p>Inicia sesión para continuar</p>
      )}
      <div className="content">
        {user && <CreatePost user={user} handleRefresh={handleRefresh} />}
        <div className="timeline">
          <h3>Timeline</h3>

          {loading && <p>Cargando publicaciones...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && posts.length === 0 && (
            <p>No hay publicaciones para mostrar.</p>
          )}

          {posts.map((post) => (
            <Post
              key={post.id}
              user={user}
              post={post}
              handleRefresh={handleRefresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
