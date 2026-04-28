import './AnalyticsCard.css';

export default function AnalyticsCard({ icon, label, value, sub, color = '#1a56db' }) {
  return (
    <div className="analytics-card">
      <div className="analytics-card__icon" style={{ background: `${color}1a`, color }}>
        {icon}
      </div>
      <div className="analytics-card__body">
        <p className="analytics-card__label">{label}</p>
        <p className="analytics-card__value">{value}</p>
        {sub && <p className="analytics-card__sub">{sub}</p>}
      </div>
    </div>
  );
}
