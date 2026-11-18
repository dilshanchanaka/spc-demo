import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function WarehouseStock() {
  const { token } = useContext(AuthContext);
  const [stock, setStock] = useState([]);
  const [updateQuantities, setUpdateQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/warehouse/stock`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setStock(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load warehouse stock:", err);
        setError("❌ Error loading stock.");
        setLoading(false);
      });
  }, [token]);

  const handleQuantityChange = (id, value) => {
    setUpdateQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = (id) => {
    const newQty = updateQuantities[id];
    if (!newQty || isNaN(newQty)) {
      alert("Please enter a valid number.");
      return;
    }

    axios
      .put(`${API_URL}/api/admin/warehouse/stock/${id}`, parseInt(newQty), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        setStock((prev) =>
          prev.map((drug) =>
            drug.id === id ? { ...drug, totalQuantity: parseInt(newQty) } : drug
          )
        );
        alert("✅ Stock updated successfully.");
        setUpdateQuantities((prev) => ({ ...prev, [id]: "" }));
      })
      .catch((err) => {
        console.error("Update failed:", err);
        alert("❌ Failed to update stock.");
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">🏬 Warehouse Stock</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading warehouse stock...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {stock.length === 0 ? (
            <p>No stock available.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Drug</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Update Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((drug) => (
                    <tr key={drug.id}>
                      <td>{drug.name}</td>
                      <td>{drug.description}</td>
                      <td>{drug.totalQuantity}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ width: "100px" }}
                            placeholder="New Qty"
                            value={updateQuantities[drug.id] || ""}
                            onChange={(e) =>
                              handleQuantityChange(drug.id, e.target.value)
                            }
                          />
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleUpdate(drug.id)}
                          >
                            Update
                          </button>
                        </div>
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
