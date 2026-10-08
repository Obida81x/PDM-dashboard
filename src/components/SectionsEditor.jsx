import { useState } from 'react';
import { getIn, setIn } from '../utils';
import SchemaFields from './SchemaEditor';
import { Card } from './Fields';

/** شريط أقسام جانبي + نموذج تحرير القسم المختار */
export default function SectionsEditor({ sections, site, setSite }) {
  const [id, setId] = useState(sections[0].id);
  const sec = sections.find((s) => s.id === id) || sections[0];
  const value = getIn(site, sec.path) || {};
  return (
    <div className="split">
      <nav className="subnav" aria-label="الأقسام">
        {sections.map((s) => (
          <button key={s.id} type="button" className={`subnav-item ${s.id === sec.id ? 'on' : ''}`} onClick={() => { setId(s.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{s.title}</button>
        ))}
      </nav>
      <Card title={sec.title} desc={sec.desc} className="grow">
        <SchemaFields fields={sec.fields} value={value} onChange={(v) => setSite(setIn(site, sec.path, v))} />
      </Card>
    </div>
  );
}
