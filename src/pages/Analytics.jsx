import { useEffect, useState } from 'react';
import { api, IS_MOCK } from '../services/api';
import { useUI } from '../context/UIContext';
import { fmtDur, num } from '../utils';
import { BarList, Donut, Hours, LineChart, Stat } from '../components/Charts';
import { Card, PageHead, Tabs } from '../components/Fields';

export default function Analytics() {
  const { toast } = useUI();
  const [range, setRange] = useState('30');
  const [d, setD] = useState(null);
  useEffect(() => { setD(null); api.getAnalytics(range).then(setD).catch((e) => toast(e.message, 'err')); }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHead title="الإحصائيات والزيارات" desc="مين بيزور الموقع، من وين، وشو بيشوف."
        actions={<Tabs value={range} onChange={setRange} tabs={[{ id: '7', label: '7 أيام' }, { id: '30', label: '30 يوم' }, { id: '90', label: '90 يوم' }]} />} />
      {IS_MOCK && <div className="notice">الأرقام هنا <b>تجريبية</b> لعرض شكل اللوحة. لما يربط الباك إند نقطة <code dir="ltr">GET /analytics</code> بتظهر الزيارات الحقيقية.</div>}
      {!d ? <div className="card state"><span className="spinner" /></div> : (
        <div className="stack">
          <div className="stats">
            <Stat label="الزيارات" value={num(d.totals.visits)} delta={d.totals.deltas.visits} />
            <Stat label="الزوار الفريدون" value={num(d.totals.visitors)} delta={d.totals.deltas.visitors} />
            <Stat label="مشاهدات الصفحات" value={num(d.totals.pageviews)} delta={d.totals.deltas.pageviews} />
            <Stat label="متوسط مدة الزيارة" value={fmtDur(d.totals.avgDuration)} hint="دقيقة:ثانية" />
            <Stat label="معدل الارتداد" value={`${d.totals.bounceRate}%`} hint="زوار غادروا بعد صفحة واحدة" />
            <Stat label="زوار جدد" value={`${d.totals.newVisitorsRate}%`} hint={`${d.totals.online} متصلين الآن`} />
          </div>
          <Card title="الزيارات يوماً بيوم"><LineChart data={d.daily} series={[{ key: 'visits', label: 'الزيارات' }, { key: 'visitors', label: 'الزوار' }, { key: 'pageviews', label: 'المشاهدات' }]} /></Card>
          <div className="grid2 top">
            <Card title="أكثر الصفحات مشاهدة"><BarList items={d.topPages.slice(0, 8)} /></Card>
            <Card title="مصادر الزيارات"><BarList items={d.sources} /></Card>
            <Card title="الأجهزة"><Donut items={d.devices} label="الأجهزة" /></Card>
            <Card title="لغة التصفح"><Donut items={d.languages} label="اللغات" /></Card>
            <Card title="الدول"><BarList items={d.countries} /></Card>
            <Card title="المتصفحات"><Donut items={d.browsers} label="المتصفحات" /></Card>
          </div>
          <Card title="ساعات الذروة" desc="متى بيزور الناس موقعك خلال اليوم (بتوقيت الموقع)."><Hours data={d.hours} /></Card>
        </div>
      )}
    </>
  );
}
