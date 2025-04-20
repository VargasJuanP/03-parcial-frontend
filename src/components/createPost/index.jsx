import { useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../../styles/createPost.css";

function CreatePost({ user }) {
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "tweets"), {
        content: postContent,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
      });
      
      setPostContent("");
    } catch (err) {
      setError("Error al publicar. Inténtalo de nuevo.");
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

export default CreatePost;
