import { use, useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const response = await loginUser(form);

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setShowModal(true);
    } else {
      setError("Invalid email or password. Please try again or register.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

  return (
    <>
      {showModal && (
        <SuccessModal 
          message="Login successful! Welcome to BradBoard." 
          onClose={handleModalClose}
        />
      )}
      <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          width: '320px'
        }}
      >
        <h1 style={{
        fontSize: "32px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "20px",
        color: "#293141ff"
      }}
      >
        BradBoard
      </h1>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>Login</h2>

        {error && (
          <p style={{
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '8px'
          }}>{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          style={{
            border: '1px solid #d1d5db',
            padding: '8px',
            width: '100%',
            marginBottom: '12px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            border: '1px solid #d1d5db',
            padding: '8px',
            width: '100%',
            marginBottom: '12px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Login
        </button>

        <p style={{
          marginTop: '12px',
          fontSize: '14px'
        }}>
          New user?{" "}
          <span
            style={{
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </form>
      </div>
    </>
  );
}

export default Login; 