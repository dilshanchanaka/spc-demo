import { API_URL } from "../../config";
import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AddTender() {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    closingDate: "",
    attachmentUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isFutureDate = (date) => {
    return new Date(date) > new Date();
  };

  const validateForm = () => {
    if (!form.title || form.title.trim().length < 5) {
      alert("❗ Title must be at least 5 characters.");
      return false;
    }
    if (!form.description || form.description.trim().length < 10) {
      alert("❗ Description must be at least 10 characters.");
      return false;
    }
    if (!form.closingDate || !isFutureDate(form.closingDate)) {
      alert("❗ Closing Date must be a future date.");
      return false;
    }
    if (form.attachmentUrl && !isValidURL(form.attachmentUrl)) {
      alert("❗ Attachment URL is not valid.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    axios
      .post(`${API_URL}/api/supplier/create-tender`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("✅ Tender created successfully!");
        setForm({ title: "", description: "", closingDate: "", attachmentUrl: "" });
      })
      .catch((err) => {
        console.error("Tender creation failed:", err);
        alert(err?.response?.data?.message || "Failed to create tender. Try again.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📝 Create New Tender</h2>

      <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label fw-bold">Tender Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label fw-bold">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="closingDate" className="form-label fw-bold">Closing Date</label>
          <input
            type="date"
            className="form-control"
            id="closingDate"
            name="closingDate"
            value={form.closingDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="attachmentUrl" className="form-label fw-bold">Attachment URL (optional)</label>
          <input
            type="url"
            className="form-control"
            id="attachmentUrl"
            name="attachmentUrl"
            value={form.attachmentUrl}
            onChange={handleChange}
            placeholder="https://your-file-link.com"
          />
        </div>

        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? "Submitting..." : "➕ Create Tender"}
        </button>
      </form>
    </div>
  );
}
