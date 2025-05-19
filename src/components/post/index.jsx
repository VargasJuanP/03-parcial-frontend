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
import Reply from "./reply";
import { formatDate } from "../../lib/utils";
import * as Sentry from "@sentry/react";
import { startTransaction } from "../../lib/sentryUtils";
import { withSentry, useSentryMonitor } from "../../components/sentry/SentryWrapper";

function Post({ user, post, handleRefresh }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [replies, setReplies] = useState([]);
  const [refreshReplies, setRefreshReplies] = useState(0);
  
  const { captureComponentError } = useSentryMonitor("Post");

  useEffect(() => {
    if (!user) return;

    // Chequear si el usuario ha dado like a este post
    const checkIfLiked = async () => {
      const transaction = startTransaction({
        name: "post-check-like-status",
        op: "firebase.query",
        data: { postId: post.id }
      });
      
      try {
        const q = query(
          collection(db, "tweets_likes"),
          where("authorId", "==", user.uid),
          where("tweetId", "==", post.id)
        );
        const querySnapshot = await getDocs(q);
        setIsLiked(!querySnapshot.empty);
        transaction.setStatus("ok");
      } catch (error) {
        console.error("Error checking like status:", error);
        captureComponentError(error, {
          action: "check_like_status", 
          postId: post.id
        });
        transaction.setStatus("error");
      } finally {
        transaction.finish();
      }
    };

    checkIfLiked();
  }, []);

  useEffect(() => {
    // Obtener el numero de likes para este post
    const transaction = startTransaction({
      name: "post-get-likes-count",
      op: "firebase.subscribe",
      data: { postId: post.id }
    });
    
    const likesQuery = query(
      collection(db, "tweets_likes"),
      where("tweetId", "==", post.id)
    );

    // Escuchar los cambios en los likes
    const unsubscribe = onSnapshot(
      likesQuery,
      (snapshot) => {
        setLikeCount(snapshot.docs.length);
        transaction.setStatus("ok");
      },
      (error) => {
        console.error("Error fetching likes:", error);
        captureComponentError(error, {
          action: "fetch_likes_count", 
          postId: post.id
        });
        transaction.setStatus("error");
      }
    );

    return () => {
      unsubscribe();
      transaction.finish();
    };
  }, []);

  useEffect(() => {
    const fetchReplies = async () => {
      const transaction = startTransaction({
        name: "post-fetch-replies",
        op: "firebase.query",
        data: { postId: post.id }
      });
      
      try {
        const q = query(
          collection(db, "tweets_replies"),
          where("tweetId", "==", post.id)
        );
        const querySnapshot = await getDocs(q);
        setReplies(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        transaction.setData("replies_count", querySnapshot.docs.length);
        transaction.setStatus("ok");
      } catch (error) {
        console.error("Error fetching replies:", error);
        captureComponentError(error, {
          action: "fetch_replies", 
          postId: post.id
        });
        transaction.setStatus("error");
      } finally {
        transaction.finish();
      }
    };

    fetchReplies();
  }, [refreshReplies]);

  const handleRefreshReplies = () => {
    setRefreshReplies((prev) => prev + 1);
  };

  // Eliminar el post
  const handleDelete = async () => {
    const transaction = startTransaction({
      name: "post-delete",
      op: "firebase.delete",
      data: { postId: post.id }
    });
    
    try {
      await deleteDoc(doc(db, "tweets", post.id));
      handleRefresh();
      
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: 'Post eliminado',
        level: 'info',
        data: { postId: post.id }
      });
      
      transaction.setStatus("ok");
    } catch (error) {
      console.error("Error al eliminar el post:", error);
      captureComponentError(error, {
        action: "delete_post", 
        postId: post.id
      });
      transaction.setStatus("error");
    } finally {
      transaction.finish();
    }
  };

  // Dar like al post
  const handleLike = async () => {
    if (!user) return;

    const transaction = startTransaction({
      name: "post-toggle-like",
      op: "firebase.write",
      data: { 
        postId: post.id,
        action: isLiked ? "unlike" : "like"
      }
    });
    
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

      Sentry.addBreadcrumb({
        category: 'user-action',
        message: isLiked ? 'Post unliked' : 'Post liked',
        level: 'info',
        data: { postId: post.id }
      });
      
      setIsLiked(!isLiked);
      handleRefresh();
      transaction.setStatus("ok");
    } catch (error) {
      console.error("Error updating like:", error);
      captureComponentError(error, {
        action: "toggle_like", 
        postId: post.id,
        isLiked
      });
      transaction.setStatus("error");
    } finally {
      transaction.finish();
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <span className="author-name">@{post.authorName}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
        {user && user.uid === post.authorId && (
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
        )}
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-footer">
        <div className="like-container">
          <button
            className={`like-button ${user && isLiked ? "liked" : ""}`}
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
          {(replies.length > 0 || user) && (
            <h3>Respuestas ({replies.length})</h3>
          )}
          <div className="replies-container">
            {user && (
              <CreateReply
                user={user}
                postId={post.id}
                handleRefresh={handleRefreshReplies}
              />
            )}
            {replies.map((reply) => (
              <Reply key={reply.id} reply={reply} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withSentry(Post, { 
  componentName: "Post", 
  shouldProfile: true
});
