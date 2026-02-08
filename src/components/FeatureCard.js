export default function FeatureCard({ icon, title, description, features }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      {features && features.length > 0 && (
        <ul className="feature-list">
          {features.map((feature, index) => (
            <li key={index}>
              <span className="check-icon">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
