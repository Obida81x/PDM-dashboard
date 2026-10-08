/**
 * بيانات إحصائيات تجريبية (تُستخدم فقط في الوضع التجريبي).
 * في الوضع الحقيقي الباك إند يرجع نفس الشكل من  GET /analytics?range=30
 */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function mockAnalytics(range = 30, projects = [], messageCount = 0) {
  const days = Number(range) || 30;
  const r = rng(days * 97 + 13);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const weekend = [5, 6].includes(d.getDay()); // الجمعة والسبت
    const trend = 1 + ((days - i) / days) * 0.45;
    const visits = Math.round((90 + r() * 70) * trend * (weekend ? 0.62 : 1));
    const visitors = Math.round(visits * (0.68 + r() * 0.1));
    daily.push({ date: d.toISOString().slice(0, 10), visits, visitors, pageviews: Math.round(visits * (1.9 + r() * 0.6)) });
  }
  const sum = (k) => daily.reduce((a, d) => a + d[k], 0);
  const half = Math.floor(days / 2);
  const part = (k, a, b) => daily.slice(a, b).reduce((x, d) => x + d[k], 0);
  const delta = (k) => {
    const prev = part(k, 0, half) || 1;
    return Math.round(((part(k, half) - prev) / prev) * 100);
  };

  const visits = sum('visits');
  const split = (items, total) => {
    const w = items.map(([n, x]) => [n, x * (0.9 + r() * 0.2)]);
    const t = w.reduce((a, [, x]) => a + x, 0);
    return w.map(([name, x]) => ({ name, value: Math.round((x / t) * total) }));
  };

  const pages = [
    { path: '/', title: 'الرئيسية', share: 0.46 },
    { path: '/story', title: 'قصتنا', share: 0.14 },
    ...projects.filter((p) => p.published !== false).map((p, i) => ({
      path: `/projects/${p.slug}`,
      title: p.title,
      share: 0.4 / Math.max(projects.length, 1) * (1.5 - i * 0.18 > 0.4 ? 1.5 - i * 0.18 : 0.4),
    })),
  ];
  const pv = sum('pageviews');
  const topPages = pages.map((p) => ({ path: p.path, title: p.title, views: Math.round(pv * p.share * (0.9 + r() * 0.2)) })).sort((a, b) => b.views - a.views);

  return {
    range: days,
    totals: {
      visits, visitors: sum('visitors'), pageviews: pv,
      avgDuration: Math.round(95 + r() * 80), bounceRate: Math.round(38 + r() * 14),
      newVisitorsRate: Math.round(58 + r() * 12), online: Math.round(2 + r() * 9),
      deltas: { visits: delta('visits'), visitors: delta('visitors'), pageviews: delta('pageviews') },
    },
    daily,
    topPages,
    projectViews: topPages.filter((p) => p.path.startsWith('/projects/')).map((p) => ({ title: p.title, views: p.views })),
    sources: split([['بحث جوجل', 44], ['مباشر', 26], ['انستجرام', 11], ['لينكدإن', 9], ['مواقع أخرى', 10]], visits),
    devices: split([['جوال', 61], ['حاسوب', 33], ['تابلت', 6]], visits),
    browsers: split([['Chrome', 58], ['Safari', 27], ['Edge', 8], ['Firefox', 5], ['أخرى', 2]], visits),
    countries: split([['فلسطين', 47], ['السعودية', 14], ['الأردن', 11], ['الإمارات', 9], ['مصر', 6], ['الكويت', 5], ['دول أخرى', 8]], visits),
    languages: split([['العربية', 72], ['English', 28]], visits),
    hours: Array.from({ length: 24 }, (_, h) => Math.round((h < 6 ? 2 : h < 9 ? 8 : h < 17 ? 16 : h < 23 ? 12 : 4) * (0.7 + r() * 0.6))),
    form: { messages: messageCount, conversion: Math.round(1.4 + r() * 1.6 * 10) / 10 },
  };
}
