import { useState } from "react";
import api from "../api";

export default function CreateShoutout() {
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState("");

  const submit = async () => {
    await api.post("/shoutouts", { message, department });
    alert("Shoutout created");
  };

  return (
    <div>
      <h2>Create Shoutout</h2>

      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <input
        placeholder="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      />

      <button onClick={submit}>Submit</button>
    </div>
  );
}
