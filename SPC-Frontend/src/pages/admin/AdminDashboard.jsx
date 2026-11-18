import { API_URL } from "../../config";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/Card";
import ProposalChart from "../../components/ProposalChart";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [proposalChartData, setProposalChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Load stats and chart data
    axios
      .get(`${API_URL}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats(res.data);
        setProposalChartData([
          { status: "Approved", count: res.data.approvedProposals || 0 },
          { status: "Pending", count: res.data.pendingProposals || 0 },
          { status: "Rejected", count: res.data.rejectedProposals || 0 },
        ]);
      })
      .catch((err) => console.error("Failed to fetch stats:", err));

    // Load recent orders
    axios
      .get(`${API_URL}/api/admin/orders/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRecentOrders(res.data.slice(0, 5)))
      .catch((err) => console.error("Failed to fetch recent orders:", err))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Admin Dashboard</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <Card title="Total Suppliers" value={stats?.totalSuppliers || 0} icon="👥" />
            </div>
            <div className="col-md-4 mb-3">
              <Card title="Total Proposals" value={stats?.totalProposals || 0} icon="📑" />
            </div>
            <div className="col-md-4 mb-3">
              <Card title="Total Orders" value={stats?.totalOrders || 0} icon="🛍️" />
            </div>
          </div>

          {/* Proposal Chart */}
          <div className="card mb-4 p-3">
            <h5 className="text-center text-success mb-3">Proposal Summary</h5>
            <ProposalChart data={proposalChartData} />
          </div>

          {/* Recent Orders */}
          <div className="card p-3">
            <h5 className="mb-3">🕒 Recent Pending Orders</h5>
            {recentOrders.length === 0 ? (
              <p>No pending orders found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Drug</th>
                      <th>Pharmacy</th>
                      <th>Quantity</th>
                      <th>Ordered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.drug}</td>
                        <td>{order.pharmacy}</td>
                        <td>{order.quantity}</td>
                        <td>{order.orderedAt?.split("T")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
