import { useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../../styles/createPost.css";
import { Sentry } from "../sentry/sentry";
import { startTransaction } from "../sentry/transaction";
import { withSentry, useSentryMonitor } from "../sentry/SentryWrapper";

function CreatePost({ user, handleRefresh }) {
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { captureComponentError } = useSentryMonitor("CreatePost");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const transaction = startTransaction({
        name: "create-post",
      });
      
      transaction.setData("postLength", postContent.length);
      transaction.setData("userId", user.uid);
      
      await addDoc(collection(db, "tweets"), {
        content: postContent,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
      });
      
      Sentry.captureMessage("Post creado con éxito", {
        level: "info",
        tags: {
          action: "create_post",
          user_id: user.uid
        },
        extra: {
          contentLength: postContent.length
        }
      });
      
      transaction.finish();
      
      setPostContent("");

      // Actualizar los posts
      handleRefresh();
    } catch (err) {
      setError("Error al publicar. Inténtalo de nuevo.");
      
      captureComponentError(err, {
        action: "create_post",
        userId: user.uid,
        displayName: user.displayName,
        contentLength: postContent.length
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
      <textarea
        name="post"
        id="post"
        placeholder="¿En qué estás pensando hoy?"
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
      ></textarea>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
}

export default withSentry(CreatePost, {
  componentName: "CreatePost",
  shouldProfile: true
});
