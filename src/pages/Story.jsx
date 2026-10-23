import { useSite } from '../hooks/useSite';
import PageShell from '../components/PageShell';
import Hub from '../components/Hub';
import { STORY_HUB } from '../data/schema';

export default function Story() {
  const ed = useSite();
  return (
    <PageShell ed={ed} bare>
      <Hub ed={ed} config={STORY_HUB} base="/story" title="قصتنا والتسلسل الزمني" desc="كل أقسام صفحة «قصتنا». اختر القسم لتعديله." />
    </PageShell>
  );
}
