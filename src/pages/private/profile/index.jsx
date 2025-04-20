import { Navigate } from "react-router-dom";
import CreatePost from "../../../components/createPost";

function Profile({ user }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <div>
    <CreatePost user={user} />
  </div>;
}

export default Profile;
