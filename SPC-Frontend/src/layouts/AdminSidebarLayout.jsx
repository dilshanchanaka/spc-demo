import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminSidebarLayout() {
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
        <div className="col-md-3 col-lg-2 bg-dark text-white d-flex flex-column p-3">
          <h4 className="text-center mb-4">Admin Panel</h4>
          <div className="nav nav-pills flex-column mb-auto">
            <Link to="/admin/dashboard" className="nav-link text-white">
              📊 Dashboard
            </Link>
            <Link to="/admin/suppliers" className="nav-link text-white">
              🤝 Supplier Approvals
            </Link>
            <Link to="/admin/tenders" className="nav-link text-white">
              📢 Manage Tenders
            </Link>
            <Link to="/admin/proposals" className="nav-link text-white">
              📝 Tender Proposals
            </Link>
            <Link to="/admin/pharmacy-orders" className="nav-link text-white">
              🏪 Pharmacy Orders
            </Link>
            <Link to="/admin/orders" className="nav-link text-white">
              📦 All Drug Orders
            </Link>
            <Link to="/admin/warehouse-stock" className="nav-link text-white">
              🏬 Warehouse Stock
            </Link>
            <Link to="/admin/warehouse-stock-history" className="nav-link text-white">
              📜 Warehouse Stock History
            </Link>
            <Link to="/admin/plant-stock" className="nav-link text-white">
              🏭 Plant Stock
            </Link>
            <Link to="/admin/plant-stock-history" className="nav-link text-white">
              📜 Plant Stock History
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
