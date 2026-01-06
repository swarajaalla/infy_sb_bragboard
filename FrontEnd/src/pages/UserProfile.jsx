import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function UserProfile() {
  const { id } = useParams();
  const token = localStorage.getItem("access_token");
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/shoutouts/", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setData(res.data.filter(
        s => s.sender_id == id || s.recipients_ids?.includes(Number(id))
      ));
    });
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h2>User Shoutout Activity</h2>
      {data.map(s => (
        <div key={s.id}>{s.message}</div>
      ))}
    </div>
  );
}

export default UserProfile;
