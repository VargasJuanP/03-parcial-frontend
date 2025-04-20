import "../../styles/post.css";
import {
  deleteDoc,
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useState, useEffect } from "react";
import CreateReply from "./createReply";

function Post({ user, post, handleRefresh }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    // Chequear si el usuario ha dado like a este post
    const checkIfLiked = async () => {
      try {
        const q = query(
          collection(db, "tweets_likes"),
          where("authorId", "==", user.uid),
          where("tweetId", "==", post.id)
        );
        const querySnapshot = await getDocs(q);
        setIsLiked(!querySnapshot.empty);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkIfLiked();
  }, [post.id]);

  useEffect(() => {
    // Obtener el numero de likes para este post
    const likesQuery = query(
      collection(db, "tweets_likes"),
      where("tweetId", "==", post.id)
    );

    // Escuchar los cambios en los likes
    const unsubscribe = onSnapshot(
      likesQuery,
      (snapshot) => {
        setLikeCount(snapshot.docs.length);
      },
      (error) => {
        console.error("Error fetching likes:", error);
      }
    );

    return () => unsubscribe();
  }, [post.id]);

  // Convertir el timestamp a un formato de fecha legible
  const formatDate = (timestamp) => {
    if (timestamp.seconds && timestamp.nanoseconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return new Date(timestamp).toLocaleString();
  };

  // Eliminar el post
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "tweets", post.id));
      handleRefresh();
    } catch (error) {
      console.error("Error al eliminar el post:", error);
    }
  };

  // Dar like al post
  const handleLike = async () => {
    if (!user) return;

    try {
      const likeId = `${user.uid}_${post.id}`;
      const likeRef = doc(db, "tweets_likes", likeId);

      if (isLiked) {
        // Eliminar el like
        await deleteDoc(likeRef);
      } else {
        // Agregar like
        await setDoc(likeRef, {
          authorId: user.uid,
          tweetId: post.id,
        });
      }

      setIsLiked(!isLiked);
      handleRefresh();
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <span className="author-name">@{post.authorName}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
        <button className="delete-post" onClick={handleDelete}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-footer">
        <div className="like-container">
          <button
            className={`like-button ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
            </svg>
          </button>
          <span className="like-count">{likeCount}</span>
        </div>
        <div className="replies">
          <h3>Respuestas</h3>
          <div className="replies-container">
            <CreateReply user={user} postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
