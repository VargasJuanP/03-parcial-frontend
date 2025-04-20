import "../../styles/post.css";

function Post({ post }) {

  // Convertir el timestamp a un formato de fecha legible
  const formatDate = (timestamp) => {
    if (timestamp.seconds && timestamp.nanoseconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="post">
      <div className="post-header">
        <span className="author-name">{post.authorName}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      <p className="post-content">{post.content}</p>
    </div>
  );
}

export default Post;
