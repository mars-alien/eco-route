export default function Select({ label, error, options = [], ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className="form-input" style={{ cursor: 'pointer' }} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
