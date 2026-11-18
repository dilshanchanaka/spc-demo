import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PlantStockHistory() {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/plant/stock/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load stock history:", err);
        setError("❌ Could not fetch stock history");
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📜 Plant Stock History</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading plant stock history...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {history.length === 0 ? (
            <p>No internal stock history found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Drug</th>
                    <th>Quantity</th>
                    <th>Source</th>
                    <th>Added By</th>
                    <th>Added At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      <td>{entry.drug?.name}</td>
                      <td>{entry.quantity}</td>
                      <td>{entry.sourceType}</td>
                      <td>{entry.addedBy}</td>
                      <td>{entry.addedAt?.split("T")[0]}</td>
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
