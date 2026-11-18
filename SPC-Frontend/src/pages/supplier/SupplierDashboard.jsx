import { API_URL } from "../../config";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SupplierDashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/api/supplier/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        alert("Unable to load dashboard stats.");
      });
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📊 Supplier Dashboard</h2>

      {stats ? (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card text-center border-success shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Total Proposals</h5>
                <p className="card-text fs-4 fw-bold">{stats.totalProposals}</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card text-center border-primary shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Approved</h5>
                <p className="card-text fs-4 fw-bold">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card text-center border-warning shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Pending</h5>
                <p className="card-text fs-4 fw-bold">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card text-center border-danger shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Rejected</h5>
                <p className="card-text fs-4 fw-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">Loading stats...</div>
      )}
    </div>
  );
}
