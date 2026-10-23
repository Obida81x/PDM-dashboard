import { useSite } from '../hooks/useSite';
import PageShell from '../components/PageShell';
import Hub from '../components/Hub';
import { CONTENT_HUB } from '../data/schema';

export default function Content() {
  const ed = useSite();
  return (
    <PageShell ed={ed} bare>
      <Hub ed={ed} config={CONTENT_HUB} base="/content" title="النصوص والأقسام" desc="اختر القسم لتعديل نصوصه بالعربي والإنجليزي. القائمة العلوية (Navbar) ثابتة وما بتتعدّل من هنا." />
    </PageShell>
  );
}
