import Icon from './Icon';

export default function SaveBar({ dirty, saving, onSave, onDiscard, label = 'حفظ ونشر' }) {
  return (
    <div className={`savebar ${dirty ? 'show' : ''}`} role="region" aria-label="حفظ التعديلات">
      <span className="savebar-msg"><i className="dot" />لديك تعديلات غير محفوظة</span>
      <div className="savebar-actions">
        <button type="button" className="btn ghost" onClick={onDiscard} disabled={saving}>تراجع</button>
        <button type="button" className="btn primary" onClick={onSave} disabled={saving}><Icon name="save" size={16} />{saving ? 'جاري الحفظ…' : label}</button>
      </div>
    </div>
  );
}
