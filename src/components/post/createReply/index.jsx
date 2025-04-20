import "../../../styles/createReply.css";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

function CreateReply({ user, postId, handleRefresh }) {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleReply = async () => {
    if (!reply.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "tweets_replies"), {
        content: reply,
        authorId: user.uid,
        tweetId: postId,
        createdAt: serverTimestamp()
      });
      
      setReply("");
      handleRefresh();
    } catch (err) {
      setError("Error al enviar la respuesta. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-reply">
      <textarea
        placeholder="Escribe una respuesta"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        disabled={isSubmitting}
      ></textarea>
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleReply} disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
    </div>
  );
}

export default CreateReply;
