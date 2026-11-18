import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SupplierSidebarLayout() {
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
        <div className="col-md-3 col-lg-2 bg-secondary text-white d-flex flex-column p-3">
          <h4 className="text-center mb-4">Supplier Panel</h4>
          <div className="nav nav-pills flex-column mb-auto">
            <Link to="/supplier/dashboard" className="nav-link text-white">
              📊 Dashboard
            </Link>
            <Link to="/supplier/proposals" className="nav-link text-white">
              📝 My Proposals
            </Link>
            <Link to="/supplier/submit" className="nav-link text-white">
              ➕ Submit Proposal
            </Link>
            <Link to="/supplier/add-tender" className="nav-link text-white">
              📤 Add Tender
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
