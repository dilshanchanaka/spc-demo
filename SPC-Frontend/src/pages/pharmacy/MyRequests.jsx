import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/pharmacy/orders/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("❌ Failed to load requests", err));
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📋 My Stock Requests</h2>

      {requests.length === 0 ? (
        <p>🚫 No orders found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Drug</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Requested On</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <tr key={req.id}>
                  <td>{index + 1}</td>
                  <td>{req.drug}</td>
                  <td>{req.quantity}</td>
                  <td>
                    <span
                      className={`badge ${
                        req.status === "Approved"
                          ? "bg-success"
                          : req.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>{new Date(req.orderedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
