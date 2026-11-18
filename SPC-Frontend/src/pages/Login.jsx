import { API_URL } from "../config";
import { useState, useContext } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const token = response.data.jwt;
      login(token);

      const decoded = jwtDecode(token);
      const role = decoded.role;

      localStorage.setItem("role", role);
      alert("✅ Login successful!");

      switch (role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "supplier":
          navigate("/supplier/dashboard");
          break;
        case "warehouse":
          navigate("/warehouse/dashboard");
          break;
        case "plant":
          navigate("/plant/dashboard");
          break;
        case "pharmacy":
          navigate("/pharmacy/dashboard");
          break;
        default:
          alert("❌ Unknown role. Contact admin.");
          navigate("/login");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">🔐 Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <a href="/register" className="text-decoration-none">Register</a>
        </p>
      </div>
    </div>
  );
}
