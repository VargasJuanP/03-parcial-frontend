import CreatePost from "../../../components/createPost";
import Post from "../../../components/post";
import LoginCTA from "../../../components/experimentUI/LoginCTA";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import "../../../styles/home.css";
import { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import { startTransaction } from "../../../components/sentry/transaction";
import { withSentry, useSentryMonitor } from "../../../components/sentry/SentryWrapper";

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Para que se actualice la lista de posts cuando se crea un nuevo post
  const [refresh, setRefresh] = useState(0);
  
  const { captureComponentError } = useSentryMonitor("Home");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const transaction = startTransaction({
          name: "fetch-posts",
        });
        
        // Ordenadas segun la mas reciente
        const q = query(collection(db, "tweets"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
        
        transaction.setData("postCount", postsData.length);
        transaction.finish();
      } catch (err) {
        console.error("Error al cargar el timeline:", err);
        setError("Error al cargar el timeline. Por favor, intenta de nuevo.");
        
        captureComponentError(err, {
          action: "fetchPosts",
          userId: user?.uid || "anonymous",
          postsCount: posts.length,
          refreshCount: refresh
        });
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
        <div className="login-prompt">
          <p>¡Únete a la conversación! </p>
          {/* Aquí usamos el componente experimental en lugar del texto fijo */}
          <LoginCTA />
        </div>
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

export default withSentry(Home, {
  componentName: "Home",
  shouldProfile: true
});