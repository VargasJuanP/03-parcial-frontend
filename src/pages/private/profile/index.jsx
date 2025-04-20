import { useNavigate, Navigate } from "react-router-dom";

function Profile({ user }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <div></div>;
}

export default Profile;
