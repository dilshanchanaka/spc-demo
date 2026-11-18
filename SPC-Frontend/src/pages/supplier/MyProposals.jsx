import { API_URL } from "../../config";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyProposals() {
  const { token } = useContext(AuthContext);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_URL}/api/supplier/my-proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProposals(res.data))
      .catch((err) => {
        console.error("Error loading proposals:", err);
        alert("Failed to load your proposals.");
      });
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📑 My Tender Proposals</h2>

      {proposals.length === 0 ? (
        <div className="alert alert-info">No proposals submitted yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tender Title</th>
                <th>Quoted Price (LKR)</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Document</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p, i) => (
                <tr key={p.proposalId}>
                  <td>{i + 1}</td>
                  <td>{p.tenderTitle}</td>
                  <td>{p.quotedPrice}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === "Approved"
                          ? "bg-success"
                          : p.status === "Rejected"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{new Date(p.submittedAt).toLocaleString()}</td>
                  <td>
                    <a
                      href={p.documentUrl}
                      className="btn btn-sm btn-outline-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View 📄
                    </a>
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
