import "../../styles/post.css";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

function Post({ post, handleRefresh }) {
  // Convertir el timestamp a un formato de fecha legible
  const formatDate = (timestamp) => {
    if (timestamp.seconds && timestamp.nanoseconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return new Date(timestamp).toLocaleString();
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "tweets", post.id));
      handleRefresh();
    } catch (error) {
      console.error("Error al eliminar el post:", error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <span className="author-name">{post.authorName}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
        <button className="delete-post" onClick={handleDelete}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm3 2v9h2v-9H8zm4 0v9h2v-9h-2zm4 0v9h2v-9h-2zM9 4V2h6v2h5v2H4V4h5z" />
          </svg>
        </button>
      </div>
      <p className="post-content">{post.content}</p>
    </div>
  );
}

export default Post;
