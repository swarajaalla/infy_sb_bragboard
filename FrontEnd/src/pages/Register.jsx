import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department:"",
    password: "",
    confirmPassword: ""
  });
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.department.trim()) {
      newErrors.department = "Department is required";
    } 
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log("Submitting registration with data:", {
        name: form.name,
        email: form.email,
        department: form.department,
        password: form.password
      });

      const response = await registerUser({
        name: form.name,
        email: form.email,
        department: form.department,
        password: form.password
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        setMsg("Registration successful! You can now login.");
        setForm({ name: "", email: "", department: "", password: "", confirmPassword: "" });
        setErrors({});
        setShowModal(true);
      } else {
        try {
          const errorData = await response.json();
          console.log("Error response:", errorData);
          setMsg(errorData.detail || "Registration failed. Please try again.");
        } catch (parseError) {
          console.log("Could not parse error response");
          setMsg("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMsg("An error occurred: " + error.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/");
  };

  const testConnection = async () => {
    try {
      console.log("Testing connection to http://127.0.0.1:8000/health");
      const response = await fetch("http://127.0.0.1:8000/health");
      console.log("Health check response:", response);
      if (response.ok) {
        const data = await response.json();
        console.log("Backend is reachable:", data);
        setMsg("Backend connection successful!");
      } else {
        console.log("Health check failed with status:", response.status);
        setMsg("Backend connection failed with status: " + response.status);
      }
    } catch (error) {
      console.error("Health check error:", error);
      setMsg("Cannot reach backend: " + error.message);
    }
  };

  return (
    <>
      {showModal && (
        <SuccessModal 
          message={msg} 
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
        color: "#3f2a31ff"
      }}
      >
        BradBoard
      </h1>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          Register
        </h2>

        {msg && <p style={{
          color: '#2563eb',
          fontSize: '14px',
          marginBottom: '12px'
        }}>{msg}</p>}

        <button
          type="button"
          onClick={testConnection}
          style={{
            width: '100%',
            padding: '6px',
            marginBottom: '12px',
            backgroundColor: '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test Connection
        </button>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          style={{
            border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
            padding: '8px',
            width: '100%',
            marginBottom: '4px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
        {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 8px 0' }}>{errors.name}</p>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          style={{
            border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
            padding: '8px',
            width: '100%',
            marginBottom: '4px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 8px 0' }}>{errors.email}</p>}

        <input
          type="department"
          placeholder="Department"
          value={form.department}
          style={{
            border: errors.department ? '2px solid #ef4444' : '1px solid #d1d5db',
            padding: '8px',
            width: '100%',
            marginBottom: '4px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onChange={(e) =>
            setForm({ ...form, department: e.target.value })
          }
        />
        {errors.department && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 8px 0' }}>{errors.department}</p>}


        <input
          type="password"
          placeholder="Password"
          value={form.password}
          style={{
            border: errors.password ? '2px solid #ef4444' : '1px solid #d1d5db',
            padding: '8px',
            width: '100%',
            marginBottom: '4px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />
        {errors.password && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 8px 0' }}>{errors.password}</p>}

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          style={{
            border: errors.confirmPassword ? '2px solid #ef4444' : '1px solid #d1d5db',
            padding: '8px',
            width: '100%',
            marginBottom: '12px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />
        {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 8px 0' }}>{errors.confirmPassword}</p>}

        <button style={{
          backgroundColor: '#22c55e',
          color: 'white',
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }} type="submit">
          Register
        </button>

        <p style={{
          marginTop: '12px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Already registered?{" "}
          <span
            style={{
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline',
              textAlign: 'center'
            }}
            onClick={() => navigate("/")}
          >
            Login here
          </span>
        </p>
      </form>
      </div>
    </>
  );
}

export default Register; 