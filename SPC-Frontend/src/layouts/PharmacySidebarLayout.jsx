import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PharmacySidebarLayout() {
  const navigate = useNavigate();
  const { setToken, setRole } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    if (setToken) setToken(null);
    if (setRole) setRole(null);
    navigate("/login");
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 bg-primary text-white d-flex flex-column p-3">
          <h4 className="text-center mb-4">Pharmacy Panel</h4>
          <div className="nav nav-pills flex-column mb-auto">
            <Link to="/pharmacy/dashboard" className="nav-link text-white">
              🏥 Dashboard
            </Link>
            <Link to="/pharmacy/request" className="nav-link text-white">
              📥 Request Stock
            </Link>
            <Link to="/pharmacy/my-requests" className="nav-link text-white">
              📋 My Requests
            </Link>
            <Link to="/pharmacy/drugs" className="nav-link text-white">
              💊 Drugs Management
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline-light mt-auto w-100"
          >
            🚪 Logout
          </button>
        </div>

        {/* Main content */}
        <div className="col-md-9 col-lg-10 p-4 bg-light">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
