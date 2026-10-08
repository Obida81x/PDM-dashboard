import { useEffect, useState } from 'react';
import { isImg } from './Fields';

/** معاينة حيّة للسلايدر بنفس إعدادات الموقع */
export default function SliderPreview({ cfg }) {
  const slides = (cfg.slides || []).filter((s) => s.active && isImg(s.image));
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const n = slides.length;
  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    if (!cfg.autoplay || n < 2 || (cfg.pauseOnHover && hover)) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % n), Math.max(2, cfg.interval || 5) * 1000);
    return () => clearInterval(t);
  }, [cfg.autoplay, cfg.interval, cfg.pauseOnHover, hover, n]);

  if (!n) return <div className="sp empty"><span>أضف صورة فعّالة لتظهر المعاينة هنا</span></div>;
  return (
    <div className={`sp t-${cfg.transition}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {slides.map((s, k) => (
        <figure key={s.id || k} className={`sp-slide ${k === i ? 'on' : ''} ${k < i ? 'before' : ''}`}>
          <img src={s.image} alt={s.alt?.ar || ''} />
          {(s.title?.ar || s.subtitle?.ar) && <figcaption><strong>{s.title?.ar}</strong><span>{s.subtitle?.ar}</span></figcaption>}
        </figure>
      ))}
      {cfg.showArrows && n > 1 && (<>
        <button type="button" className="sp-arrow prev" onClick={() => setI((i + 1) % n)} aria-label="التالي">›</button>
        <button type="button" className="sp-arrow next" onClick={() => setI((i - 1 + n) % n)} aria-label="السابق">‹</button>
      </>)}
      {cfg.showDots && n > 1 && <div className="sp-dots">{slides.map((_, k) => (<button type="button" key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`صورة ${k + 1}`} />))}</div>}
    </div>
  );
}
