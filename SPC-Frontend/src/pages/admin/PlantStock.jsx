import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PlantStock() {
  const { token } = useContext(AuthContext);
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/admin/plant/stock`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/api/admin/pharmacy-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([stockRes, ordersRes]) => {
        setStock(stockRes.data);
        setOrders(ordersRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading plant stock data:", err);
        setError("❌ Failed to load plant stock or orders");
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">🏭 Plant Stock & Orders</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading plant stock data...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {/* Stock Section */}
          <h4 className="mt-4">📦 Current Stock</h4>
          {stock.length === 0 ? (
            <p>No stock data available.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Drug</th>
                    <th>Description</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((drug) => (
                    <tr key={drug.id}>
                      <td>{drug.name}</td>
                      <td>{drug.description}</td>
                      <td>{drug.totalQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders Section */}
          <h4 className="mt-5">📥 Incoming Pharmacy Orders</h4>
          {orders.length === 0 ? (
            <p>No pharmacy orders found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Drug</th>
                    <th>Pharmacy</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Ordered At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.drug}</td>
                      <td>{order.pharmacyUser}</td>
                      <td>{order.quantity}</td>
                      <td>{order.status}</td>
                      <td>{order.orderedAt?.split("T")[0]}</td>
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
