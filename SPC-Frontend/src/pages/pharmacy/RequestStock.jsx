import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RequestStock() {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState("");
  const [quantity, setQuantity] = useState("");
  const { token } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/drugs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDrugs(res.data))
      .catch((err) => {
        console.error("Failed to load drugs", err);
        alert("Failed to load drug list.");
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDrug || !quantity || parseInt(quantity) <= 0) {
      alert("❗ Please select a drug and enter a valid quantity.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/pharmacy/orders`,
        {
          drugId: parseInt(selectedDrug),
          quantity: parseInt(quantity),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Stock request submitted successfully");
      setQuantity("");
      setSelectedDrug("");
    } catch (err) {
      const message =
        err.response?.data?.message || "❌ Error submitting request";
      alert(message);
      console.error("Stock request failed:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📥 Request Stock</h2>

      <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="drugSelect" className="form-label fw-bold">
            Select Drug
          </label>
          <select
            id="drugSelect"
            className="form-select"
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            required
          >
            <option value="">-- Select Drug --</option>
            {drugs.map((drug) => (
              <option key={drug.id} value={drug.id}>
                {drug.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="quantityInput" className="form-label fw-bold">
            Quantity
          </label>
          <input
            id="quantityInput"
            type="number"
            className="form-control"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min={1}
          />
        </div>

        <button type="submit" className="btn btn-success">
          ➕ Submit Request
        </button>
      </form>
    </div>
  );
}
