import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DrugsManagement() {
  const { token } = useContext(AuthContext);
  const [drugs, setDrugs] = useState([]);
  const [newDrug, setNewDrug] = useState({
    name: "",
    description: "",
    manufacturer: "",
    expiryDate: "",
  });

  const fetchDrugs = () => {
    axios
      .get(`${API_URL}/api/pharmacy/drugs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDrugs(res.data))
      .catch((err) => {
        console.error("Error fetching drugs:", err);
        alert("❌ Failed to load drugs.");
      });
  };

  useEffect(() => {
    if (token) fetchDrugs();
  }, [token]);

  const handleChange = (e) => {
    setNewDrug({ ...newDrug, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, description, manufacturer, expiryDate } = newDrug;
    if (!name || !description || !manufacturer || !expiryDate) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    axios
      .post(`${API_URL}/api/pharmacy/drugs`, newDrug, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("✅ Drug created successfully!");
        setNewDrug({ name: "", description: "", manufacturer: "", expiryDate: "" });
        fetchDrugs();
      })
      .catch((err) => {
        console.error("Error creating drug:", err);
        alert("❌ Failed to create drug.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this drug?")) return;

    axios
      .delete(`${API_URL}/api/admin/drugs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("🗑️ Drug deleted successfully.");
        fetchDrugs();
      })
      .catch((err) => {
        console.error("Error deleting drug:", err);
        alert("❌ Failed to delete drug.");
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">💊 Drugs Management</h2>

      {/* Form */}
      <form className="card p-4 mb-4" onSubmit={handleSubmit}>
        <h4 className="mb-3">➕ Add New Drug</h4>

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={newDrug.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            rows={2}
            value={newDrug.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Manufacturer</label>
          <input
            type="text"
            className="form-control"
            name="manufacturer"
            value={newDrug.manufacturer}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Expiry Date</label>
          <input
            type="date"
            className="form-control"
            name="expiryDate"
            value={newDrug.expiryDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <button type="submit" className="btn btn-success">
          ➕ Add Drug
        </button>
      </form>

      {/* Table */}
      <h4 className="mb-3">All Drugs</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Manufacturer</th>
              <th>Expiry</th>
              <th>Qty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {drugs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No drugs found.
                </td>
              </tr>
            ) : (
              drugs.map((drug, index) => (
                <tr key={drug.id}>
                  <td>{index + 1}</td>
                  <td>{drug.name}</td>
                  <td>{drug.description}</td>
                  <td>{drug.manufacturer}</td>
                  <td>{new Date(drug.expiryDate).toLocaleDateString()}</td>
                  <td>{drug.totalQuantity}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(drug.id)}
                    >
                      ❌ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
