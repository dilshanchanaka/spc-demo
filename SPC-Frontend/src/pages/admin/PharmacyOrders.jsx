import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PharmacyOrders() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/pharmacy-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load pharmacy orders:", err);
        setError("❌ Failed to fetch pharmacy orders.");
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">🧾 All Pharmacy Orders</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading pharmacy orders...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <p>No pharmacy orders found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Drug</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Ordered At</th>
                    <th>Pharmacy User</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order.id}>
                      <td>{index + 1}</td>
                      <td>{order.drug}</td>
                      <td>{order.quantity}</td>
                      <td>{order.status}</td>
                      <td>{order.orderedAt?.split("T")[0]}</td>
                      <td>{order.pharmacyUser}</td>
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
