import { useSite } from '../hooks/useSite';
import PageShell from '../components/PageShell';
import SectionsEditor from '../components/SectionsEditor';
import { STORY_SECTIONS } from '../data/schema';

export default function Story() {
  const ed = useSite();
  return (
    <PageShell ed={ed} title="قصتنا والتسلسل الزمني" desc="كل ما في صفحة «قصتنا»: المقدمة، كيف بدأنا، الاقتباس، المحطات الزمنية، القيم، الأرقام والرؤية.">
      {ed.site && <SectionsEditor sections={STORY_SECTIONS} site={ed.site} setSite={ed.setSite} />}
    </PageShell>
  );
}
