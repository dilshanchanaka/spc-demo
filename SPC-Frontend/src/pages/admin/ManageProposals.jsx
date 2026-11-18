import { API_URL } from "../../config";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageProposals() {
  const { token } = useContext(AuthContext);
  const [tenders, setTenders] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState("");

  // Load tenders
  const loadTenders = () => {
    axios
      .get(`${API_URL}/api/admin/tenders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTenders(res.data))
      .catch(() => setMessage("❌ Failed to load tenders."));
  };

  // Load proposals
  const loadProposals = (tenderId) => {
    axios
      .get(`${API_URL}/api/admin/tenders/${tenderId}/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProposals(res.data);
        setMessage("");
      })
      .catch(() => {
        setProposals([]);
        setMessage("⚠️ Failed to load proposals for selected tender.");
      });
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const handleTenderChange = (e) => {
    const tenderId = e.target.value;
    setSelectedTenderId(tenderId);
    loadProposals(tenderId);
  };

  const approveProposal = (proposalId) => {
    if (!window.confirm("Approve this proposal? Tender will be closed.")) return;

    axios
      .put(`${API_URL}/api/admin/proposals/${proposalId}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("✅ Proposal approved and tender closed.");
        loadProposals(selectedTenderId);
      })
      .catch(() => {
        alert("❌ Failed to approve proposal.");
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">📋 Manage Tender Proposals</h2>

      {/* Tender Selection */}
      <div className="mb-4">
        <label htmlFor="tenderSelect" className="form-label fw-bold">
          Select Tender:
        </label>
        <select
          id="tenderSelect"
          className="form-select"
          onChange={handleTenderChange}
          value={selectedTenderId || ""}
        >
          <option value="" disabled>Select a tender</option>
          {tenders.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} {t.isOpen ? "(Open)" : "(Closed)"}
            </option>
          ))}
        </select>
      </div>

      {/* Error or Info Message */}
      {message && <div className="alert alert-danger">{message}</div>}

      {/* Proposal Table */}
      {proposals.length === 0 ? (
        <p>🔍 No proposals for selected tender.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Supplier</th>
                <th>Quoted Price</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Document</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>{p.supplier}</td>
                  <td>Rs. {p.quotedPrice}</td>
                  <td>{new Date(p.submittedAt).toLocaleString()}</td>
                  <td>{p.status}</td>
                  <td>
                    {p.proposalDocumentUrl ? (
                      <a
                        href={p.proposalDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        📄 View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {p.status.toLowerCase() === "pending" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => approveProposal(p.id)}
                      >
                        ✅ Approve
                      </button>
                    )}
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
