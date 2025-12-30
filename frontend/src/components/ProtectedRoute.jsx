import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../auth";

export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  return children;
}
