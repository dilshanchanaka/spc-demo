
import Card from "./Card";

export default function SummaryStats({ stats }) {
  return (
    <div className="summary-stats">
      <Card title="Total Suppliers" value={stats.totalSuppliers} icon="👥" />
      <Card title="Total Proposals" value={stats.totalProposals} icon="📑" />
      <Card title="Total Orders" value={stats.totalOrders} icon="🛍️" />
    </div>
  );
}
