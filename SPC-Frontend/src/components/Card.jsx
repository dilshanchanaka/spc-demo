export default function Card({ title, value, icon }) {
  return (
    <div className="card text-center shadow-sm p-3 mb-4">
      <div className="card-body">
        <div className="mb-2 fs-2">{icon}</div>
        <h5 className="card-title">{title}</h5>
        <p className="card-text fs-4 fw-semibold">{value}</p>
      </div>
    </div>
  );
}
