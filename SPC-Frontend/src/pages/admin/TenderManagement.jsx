import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TenderManagement() {
  const { token } = useContext(AuthContext);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTenders = () => {
    axios
      .get(`${API_URL}/api/admin/tenders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTenders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tenders:", err);
        setError("❌ Failed to load tenders.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTenders();
  }, [token]);

  const toggleTenderStatus = (tenderId, currentStatus) => {
    axios
      .put(
        `${API_URL}/api/admin/tenders/${tenderId}/status`,
        !currentStatus,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        fetchTenders(); // Refresh data
      })
      .catch((err) => {
        console.error("Failed to update tender status:", err);
        alert("❌ Failed to update tender status.");
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📑 Tender Management</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading tenders...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {tenders.length === 0 ? (
            <p>No tenders found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {tenders.map((tender) => (
                    <tr key={tender.id}>
                      <td>{tender.id}</td>
                      <td>{tender.title}</td>
                      <td>{tender.description}</td>
                      <td>
                        <span
                          className={`badge ${
                            tender.isOpen ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {tender.isOpen ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            tender.isOpen ? "btn-danger" : "btn-success"
                          }`}
                          onClick={() =>
                            toggleTenderStatus(tender.id, tender.isOpen)
                          }
                        >
                          {tender.isOpen ? "❌ Close" : "✅ Open"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
