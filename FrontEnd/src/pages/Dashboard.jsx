import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const token = localStorage.getItem("access_token");
  const [peers, setPeers] = useState([]);
  const [department, setDepartment] = useState("");


  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    
    // Get user name from localStorage if available, otherwise show generic welcome
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "User");
      } catch (e) {
        setUserName("User");
      }
    } else {
      setUserName("User");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            BradBoard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Logout
          </button>
        </div>

        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#22c55e',
            marginBottom: '12px'
          }}>
            Welcome, {userName}! 🎉
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            You have successfully logged into BradBoard. More features coming soon!
          </p>
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Department Peers list
          <div style={{
            fontSize: '16px',
            color: '#6b7280',
            marginTop: '8px'
          }}>
             No Peers Found
          </div>
        </div>

        {/* Features Coming Soon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px'
            }}>
              📝
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Posts
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Create and share your thoughts
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px'
            }}>
              👍
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Reactions
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              React to posts with emojis
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px'
            }}>
              🔧
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Admin Panel
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Manage activities and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
