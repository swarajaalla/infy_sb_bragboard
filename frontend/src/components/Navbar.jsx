import { Link } from "react-router-dom";
import { logout } from "../auth";

export default function Navbar() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link> |{" "}
      <Link to="/feed">Feed</Link> |{" "}
      <Link to="/create">Create Shoutout</Link> |{" "}
      <button
        onClick={() => {
          logout();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </nav>
  );
}
