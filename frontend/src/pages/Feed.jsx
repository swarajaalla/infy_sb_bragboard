import { useEffect, useState } from "react";
import api from "../api";

export default function Feed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/shoutouts").then(res => setItems(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Shoutouts</h2>
      {items.map(s => (
        <div key={s.id} style={{ marginBottom: 12, borderBottom: "1px solid #444" }}>
          <strong>{s.department}</strong>
          <p>{s.message}</p>
          <small>{new Date(s.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
