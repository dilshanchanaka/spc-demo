import { API_URL } from "../../config";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SubmitProposal() {
  const { token } = useContext(AuthContext);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tenderId: "",
    quotedPrice: "",
    proposalDocumentUrl: "",
  });

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_URL}/api/Supplier/tenders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTenders(res.data))
      .catch((err) => {
        console.error("❌ Failed to load tenders:", err);
        alert("⚠️ Failed to load available tenders.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { tenderId, quotedPrice, proposalDocumentUrl } = form;

    if (!tenderId || !quotedPrice || !proposalDocumentUrl) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    axios
      .post(`${API_URL}/api/Supplier/submit-proposal`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("✅ Proposal submitted successfully!");
        setForm({ tenderId: "", quotedPrice: "", proposalDocumentUrl: "" });
      })
      .catch((err) => {
        console.error("❌ Submission error:", err);
        alert(
          err?.response?.data?.message ||
            "Submission failed. Please try again."
        );
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📄 Submit Tender Proposal</h2>

      {loading ? (
        <div className="alert alert-info">Loading available tenders...</div>
      ) : tenders.length === 0 ? (
        <div className="alert alert-warning">
          🚫 No open tenders available at the moment.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border p-4 rounded bg-light">
          <div className="mb-3">
            <label className="form-label">Select Tender:</label>
            <select
              className="form-select"
              name="tenderId"
              value={form.tenderId}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Tender --</option>
              {tenders.map((tender) => (
                <option key={tender.id} value={tender.id}>
                  {tender.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Quoted Price (LKR):</label>
            <input
              type="number"
              className="form-control"
              name="quotedPrice"
              value={form.quotedPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Proposal Document URL:</label>
            <input
              type="url"
              className="form-control"
              name="proposalDocumentUrl"
              value={form.proposalDocumentUrl}
              onChange={handleChange}
              placeholder="https://your-doc-link.com"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            📤 Submit Proposal
          </button>
        </form>
      )}
    </div>
  );
}
