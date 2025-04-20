import "../../../styles/reply.css";
import { formatDate } from "../../../lib/utils";

function Reply({ reply }) {
  return <div className="reply">
    <div className="reply-header">
      <span className="reply-author">@{reply.authorName}</span>
      <span className="reply-date">{formatDate(reply.createdAt)}</span>
    </div>
    <div className="reply-content">{reply.content}</div>
  </div>;
}

export default Reply;
