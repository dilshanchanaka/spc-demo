import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageSuppliers() {
  const { token } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/suppliers/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSuppliers(res.data))
      .catch((err) => {
        console.error("Failed to fetch suppliers:", err);
        setError("❌ Could not load supplier list.");
      });
  }, [token]);

  const handleAction = (userId, action) => {
    axios
      .put(
        `${API_URL}/api/admin/suppliers/${userId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert(`Supplier ${action}ed successfully.`);
        setSuppliers((prev) => prev.filter((s) => s.id !== userId));
      })
      .catch((err) => {
        console.error(`Failed to ${action} supplier:`, err);
        alert(`❌ Failed to ${action} supplier.`);
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">🤝 Pending Supplier Accounts</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {suppliers.length === 0 ? (
        <p>No pending supplier accounts.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => (
                <tr key={supplier.id}>
                  <td>{index + 1}</td>
                  <td>{supplier.fullName}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.companyName}</td>
                  <td>{supplier.address}</td>
                  <td>{supplier.phone}</td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAction(supplier.id, "approve")}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleAction(supplier.id, "reject")}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
