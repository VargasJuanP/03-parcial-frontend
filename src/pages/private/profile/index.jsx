import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import CreatePost from "../../../components/createPost";
import Post from "../../../components/post";
import "../../../styles/profile.css";
import * as Sentry from "@sentry/react";
import { startTransaction } from "../../../lib/sentryUtils";
import { withSentry, useSentryMonitor, SentryComponentErrorBoundary } from "../../../components/sentry/SentryWrapper";

function Profile({ user }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Para que se actualice la lista de posts cuando se crea un nuevo post
  const [refresh, setRefresh] = useState(0);
  
  const { captureComponentError } = useSentryMonitor("Profile");

  useEffect(() => {
    const fetchPosts = async () => {
      const transaction = startTransaction({
        name: "profile-fetch-user-posts",
        op: "firebase.query",
        data: { userId: user.uid }
      });
      
      try {
        // Ordenadas segun la mas reciente
        const q = query(
          collection(db, "tweets"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setPosts(postsData);
        
        transaction.setData("posts_count", postsData.length);
        transaction.setStatus("ok");
        
        // Agregar breadcrumb para seguimiento de actividad del usuario
        Sentry.addBreadcrumb({
          category: 'user-activity',
          message: `Perfil cargado con ${postsData.length} publicaciones`,
          level: 'info'
        });
      } catch (err) {
        console.error("Error al cargar las publicaciones:", err);
        setError(
          "Error al cargar las publicaciones. Por favor, intenta de nuevo."
        );
        
        captureComponentError(err, {
          action: "fetch_user_posts",
          userId: user.uid
        });
        
        transaction.setStatus("error");
      } finally {
        setLoading(false);
        transaction.finish();
      }
    };

    fetchPosts();
  }, [refresh]);

  const handleRefresh = () => {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: 'Actualizando publicaciones del perfil',
      level: 'info'
    });
    
    setRefresh((prev) => prev + 1);
  };

  return (
    <SentryComponentErrorBoundary componentName="Profile">
      <div className="profile-container">
        <div>
          <CreatePost user={user} handleRefresh={handleRefresh} />
        </div>

        <div className="posts-container">
          <h3>Mis publicaciones</h3>

          {loading && <p>Cargando publicaciones...</p>}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button 
                onClick={handleRefresh}
                className="retry-button"
              >
                Reintentar
              </button>
            </div>
          )}

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
    </SentryComponentErrorBoundary>
  );
}

export default withSentry(Profile, {
  componentName: "ProfilePage",
  shouldProfile: true,
  traceProps: true
});
