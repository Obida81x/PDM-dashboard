import { PageHead } from './Fields';
import SaveBar from './SaveBar';

/** يغلّف صفحات تحرير مستند الموقع: تحميل / خطأ / شريط الحفظ. bare = الصفحة ترسم عنوانها بنفسها */
export default function PageShell({ ed, title, desc, children, actions, bare }) {
  if (ed.error) return (<>{!bare && <PageHead title={title} />}<div className="card state err"><p>{ed.error.message}</p><button type="button" className="btn primary" onClick={ed.reload}>إعادة المحاولة</button></div></>);
  if (!ed.site) return (<>{!bare && <PageHead title={title} />}<div className="card state"><span className="spinner" /></div></>);
  return (
    <>
      {!bare && <PageHead title={title} desc={desc} actions={actions} />}
      {children}
      <SaveBar dirty={ed.dirty} saving={ed.saving} onSave={ed.save} onDiscard={ed.discard} />
    </>
  );
}
