import { API_URL } from "../../config";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AllOrders() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error("Failed to fetch pharmacy orders:", err);
        setError("Failed to load pharmacy orders.");
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">📦 All Pharmacy Orders</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading pharmacy orders...</p>
        </div>
      )}

      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>Drug</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Pharmacy</th>
                    <th>Ordered At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order.id}>
                      <td>{index + 1}</td>
                      <td>{order.id}</td>
                      <td>{order.drug}</td>
                      <td>{order.quantity}</td>
                      <td>{order.status}</td>
                      <td>{order.pharmacyUser}</td>
                      <td>{new Date(order.orderedAt).toLocaleDateString()}</td>
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
