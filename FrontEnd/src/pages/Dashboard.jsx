
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const departmentColors = {
  HR: "#9333ea",
  Engineering: "#2563eb",
  Sales: "#f97316",
  Intern: "#16a34a",
  Trainee: "#0ea5e9",
  Employee: "#64748b"
};


function Avatar({ name }) {
  const initials = name
    ?.split(" ")
    .map(s => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{
      height: "40px",
      width: "40px",
      borderRadius: "50%",
      backgroundColor: "#dbeafe",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1d4ed8",
      fontWeight: "600"
    }}>
      {initials || "U"}
    </div>
  );
}


function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const token = localStorage.getItem("access_token");
  const [peers, setPeers] = useState([]);
  const [department, setDepartment] = useState("");
  const [shoutoutMessage, setShoutoutMessage] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);

  const [showProfile, setShowProfile] = useState(false);
const [profileUser, setProfileUser] = useState(null);
const [profileStats, setProfileStats] = useState({
  sent: 0,
  received: 0
});
const [search, setSearch] = useState("");



  const sendShoutout = async () => {
    if (!shoutoutMessage || selectedUserIds.length === 0) {
      alert("Please enter message and select at least one peer");
      return;
    }
    
    try {
      await axios.post(
        "http://127.0.0.1:8000/shoutouts/",
        {
          message: shoutoutMessage,
          recipients: selectedUserIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Shoutout created successfully 🎉");
      setShoutoutMessage("");
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Shoutout error:", error);
      alert("Failed to create shoutout");
    }
  };


  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    setUserName(user.name || "User");
    setDepartment(user.department || "");
    axios.get("http://127.0.0.1:8000/auth/department-peers", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setPeers(res.data.peers || []);
    }).catch(err => {
      console.error("Failed to load peers", err);
      setPeers([]);
    });
    axios.get("http://127.0.0.1:8000/shoutouts/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(res => {
      setShoutouts(res.data || []);
    }).catch(err => {
      console.error("Failed to load shoutouts", err);
    });
  }, [token, navigate]);

  const openProfile = async (user) => {
  setProfileUser(user);
  setShowProfile(true);

  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/shoutouts/user/${user.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setProfileStats({
      sent: res.data.sent?.length || 0,
      received: res.data.received?.length || 0
    });
  } catch {
    setProfileStats({ sent: 0, received: 0 });
  }
};



  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };
  
  const handleSelectAll = (checked) =>{
    if (checked) {
      setSelectedUserIds(peers.map(p => p.id));
    } else {
      setSelectedUserIds([]);
    }
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
        }}>{/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'

          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
              }}>
                BradBoard
                </h1>
                <button onClick={handleLogout} style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
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
                  color: '#16a34a',
                  marginBottom: '12px'
                  }}>
                    Welcome, {userName}! 🎉
                    </h2>
                    <p style={{
                      fontSize: '16px',
                      color: '#475569',
                      marginBottom: '24px'
                      }}>
                        You have successfully logged into BradBoard. More features coming soon!
                        </p>
                  </div>
                  {/* Department Peers */}
        <div style={{
          backgroundColor: "#6e879e10",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "32px",
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "bold",
              backgroundColor: "white",
              boxShadow: "0 1px 3px rgba(87, 66, 172, 0.1)",
              marginBottom: "16px",
              color: "#1f2937"
              }}>
                Department Peers {department && `(${department})`}
                </h3>

                <input
  type="text"
  placeholder="Search by name or email..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "8px 12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px"
  }}
/>


{peers
  .filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )
  .map(user => (

  <div
  key={user.id}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    marginBottom: "8px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb"
  }}
>
  {/* Avatar → Profile Popup */}
  <div
    onClick={(e) => {
      e.stopPropagation();
      openProfile(user);
    }}
    style={{ cursor: "pointer" }}
  >
    <Avatar name={user.name} />
  </div>

  {/* Info */}
  <div style={{ flex: 1 }}>
    <div style={{ fontWeight: "600", color: "#1e293b" }}>
      {user.name}
    </div>
    <div style={{ fontSize: "13px", color: "#64748b" }}>
      {user.email}
    </div>
  </div>

  {/* Department Badge */}
  <span
    style={{
      backgroundColor: departmentColors[user.department] || "#64748b",
      color: "white",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600"
    }}
  >
    {user.department}
  </span>
</div>

))}




          </div>
          {/* Create Shoutout */}
      <div style={{
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: "32px"
        }}>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "12px" }}>
            Create Shoutout
            </h3>
            <textarea
              placeholder="Write a shoutout..."
              value={shoutoutMessage}
              onChange={(e) => setShoutoutMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #263e64ff",
                  marginBottom: "12px"
                }}/>
                {/* Select All */}
                <div style={{ marginBottom: "10px", color: "#1f2937" }}>
                  <label>
                    <input 
                      type="checkbox"
                      checked={selectedUserIds.length === peers.length && peers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      />{" "}
                      Select All Peers
                      </label>
                  </div>
                {/* Multiple Peer Selection */}
                <div style={{
                  border: "1px solid #1f4174ff",
                  borderRadius: "6px",
                  padding: "10px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  color: "#1f2937",
                  marginBottom: "12px"
                  }}>
                    {peers.map(p => (
                    <div key={p.id} style={{ marginBottom: "6px" }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(p.id)}
                          onChange={() =>
                            setSelectedUserIds(prev =>
                              prev.includes(p.id)
                                ? prev.filter(id => id !== p.id)
                                : [...prev, p.id]
                              )
                            }
                            />{" "}
                            {p.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                  onClick={sendShoutout}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}>
                    Create Shoutout 🚀
                    </button>
        </div>
        {/* Features Coming Soon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
          }}>
            <div onClick={() => navigate("/shoutouts")}
              style={{
                  backgroundColor: "white",
                  padding: "24px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  cursor: "pointer"
                  }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>📝</div>
                    <h3 style={{ fontSize: "18px", fontWeight: "bold" , color: "#1f2937" }}>Shoutouts</h3>
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>
                      View & send shoutouts
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

    {showProfile && profileUser && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  }}>
    <div style={{
      width: "340px",
      background: "#fff",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
    }}>
      <div style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "#2563eb",
        color: "#fff",
        fontSize: "24px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px"
      }}>
        {profileUser.name[0]}
      </div>

      <h3 style={{ textAlign: "center", margin: 0 , color: "#262f43ff" }}>
        {profileUser.name}
      </h3>

      <p style={{
        textAlign: "center",
        color: "#64748b",
        fontSize: "14px",
        marginTop: "4px"
      }}>
        {profileUser.role} • {profileUser.department}
      </p>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
                <b style={{color:"black"}}>{profileStats.sent}</b>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Sent</div>
        </div>
        <div>
          <b style={{color:"black"}}>{profileStats.received}</b>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Received</div>
        </div>
      </div>

      <button
        onClick={() => setShowProfile(false)}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
}

export default Dashboard;
