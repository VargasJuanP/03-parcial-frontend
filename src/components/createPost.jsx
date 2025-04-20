import { useState } from "react";
import "../css/createPost.css";

function CreatePost({ user }) {
  return (
    <form className="create-post">
      <textarea
        name="post"
        id="post"
        placeholder="¿En qué estás pensando hoy?"
      ></textarea>
      <button>Publicar</button>
    </form>
  );
}

export default CreatePost;
