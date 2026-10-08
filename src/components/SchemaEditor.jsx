import { getIn, setIn } from '../utils';
import { ImageField, ListEditor, LText, NumberInput, Select, TextInput, Toggle } from './Fields';

/** يرسم حقولاً من وصف schema ويعدّل كائن `value` */
export default function SchemaFields({ fields, value, onChange }) {
  const set = (key, v) => onChange({ ...value, [key]: v });
  return (
    <div className="fields">
      {fields.map((fd) => {
        const v = value?.[fd.key];
        switch (fd.type) {
          case 'l': return <LText key={fd.key} label={fd.label} hint={fd.hint} value={v} onChange={(x) => set(fd.key, x)} />;
          case 'la': return <LText key={fd.key} label={fd.label} hint={fd.hint} area rows={fd.rows || 3} value={v} onChange={(x) => set(fd.key, x)} />;
          case 'll':
            return (
              <ListEditor key={fd.key} label={fd.label} hint={fd.hint} compact items={v || []} onChange={(x) => set(fd.key, x)} addLabel="إضافة سطر" makeItem={() => ({ ar: '', en: '' })} itemTitle={(it) => it?.ar?.slice(0, 40)} renderItem={(it, up) => <LText value={it} onChange={up} />} />
            );
          case 'lla':
            return (
              <ListEditor key={fd.key} label={fd.label} hint={fd.hint} items={v || []} onChange={(x) => set(fd.key, x)} addLabel="إضافة عنصر" makeItem={() => ({ ar: '', en: '' })} itemTitle={(it) => it?.ar?.slice(0, 40)} renderItem={(it, up) => <LText area rows={fd.rows || 3} value={it} onChange={up} />} />
            );
          case 't': return <TextInput key={fd.key} label={fd.label} hint={fd.hint} ltr={fd.ltr} value={v} onChange={(x) => set(fd.key, x)} />;
          case 'n': return <NumberInput key={fd.key} label={fd.label} hint={fd.hint} value={v} onChange={(x) => set(fd.key, x)} />;
          case 'bool': return <Toggle key={fd.key} label={fd.label} hint={fd.hint} value={v} onChange={(x) => set(fd.key, x)} />;
          case 'img': return <ImageField key={fd.key} label={fd.label} hint={fd.hint} value={v} onChange={(x) => set(fd.key, x)} />;
          case 'sel': return <Select key={fd.key} label={fd.label} hint={fd.hint} options={fd.options} value={v} onChange={(x) => set(fd.key, x)} />;
          case 'tl':
            return (
              <ListEditor key={fd.key} label={fd.label} hint={fd.hint} compact items={v || []} onChange={(x) => set(fd.key, x)} addLabel="إضافة" makeItem={() => ''} itemTitle={(it) => it} renderItem={(it, up) => <TextInput ltr value={it} onChange={up} />} />
            );
          case 'group':
            return (
              <fieldset key={fd.key} className="group"><legend>{fd.label}</legend>
                <SchemaFields fields={fd.fields} value={v || {}} onChange={(x) => set(fd.key, x)} />
              </fieldset>
            );
          case 'list':
            return (
              <ListEditor key={fd.key} label={fd.label} hint={fd.hint} items={v || []} min={fd.fixed ? fd.min : 0} fixed={fd.fixed} onChange={(x) => set(fd.key, x)} addLabel={fd.addLabel || 'إضافة عنصر'} itemTitle={fd.itemTitle} makeItem={fd.makeItem || (() => ({}))}
                renderItem={(it, up) => <SchemaFields fields={fd.fields} value={it} onChange={up} />} />
            );
          default: return null;
        }
      })}
    </div>
  );
}

export { getIn, setIn };
