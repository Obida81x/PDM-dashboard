import { useSite } from '../hooks/useSite';
import PageShell from '../components/PageShell';
import SectionsEditor from '../components/SectionsEditor';
import { CONTENT_SECTIONS } from '../data/schema';

export default function Content() {
  const ed = useSite();
  return (
    <PageShell ed={ed} title="النصوص والأقسام" desc="كل نص بالموقع بالعربي والإنجليزي: القائمة، الواجهة، الخدمات، الأعمال، من نحن، التواصل، الفوتر… اختر القسم من اليمين.">
      {ed.site && <SectionsEditor sections={CONTENT_SECTIONS} site={ed.site} setSite={ed.setSite} />}
    </PageShell>
  );
}
