import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import Shoutouts from "./pages/Shoutouts";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shoutouts" element={<Shoutouts />} />
        <Route path="/users/:id" element={<UserProfile />} />

      </Routes>
    </BrowserRouter>
  );
}


export default App;

