import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import CreatePost from "../../../components/createPost";
import Post from "../../../components/post";
import "../../../styles/profile.css";

function Profile({ user }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(
          "Error al cargar las publicaciones. Por favor, intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="profile-container">
      <div>
        <h3>Crear nueva publicación</h3>
        <CreatePost user={user} />
      </div>

      <div className="posts-container">
        <h3>Mis publicaciones</h3>

        {loading && <p>Cargando publicaciones...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p>No hay publicaciones para mostrar.</p>
        )}

        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Profile;
