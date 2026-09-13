import { useStage } from '@/hooks/useStage';
import { STAGES } from '@/lib/progress';

export function ProgressStrip() {
  const { stage, index } = useStage();
  return (
    <div aria-label={`Run progress: ${stage ?? 'not started'}`} className="border-4 border-navy bg-pale p-3 shadow-bevel">
      <p className="mb-2 font-display text-[10px] tracking-[0.3em] text-navy">RUN PROGRESS</p>
      <ol className="relative grid grid-cols-6 gap-1">
        <span aria-hidden className="absolute left-[8%] right-[8%] top-2 h-1.5 bg-navy" />
        <span aria-hidden className="absolute left-[8%] top-2 h-1.5 bg-yellow transition-[width] duration-700" style={{ width: `${Math.max(0, index) / 5 * 84}%` }} />
        {STAGES.map((s, i) => (
          <li key={s} className="relative flex flex-col items-center gap-1 text-center">
            <span aria-hidden className={`z-10 h-5 w-5 border-[3px] border-navy ${i <= index ? 'bg-yellow' : 'bg-white'} ${i === index ? 'ring-4 ring-cyan' : ''}`} />
            <span className={`font-display text-[9px] leading-tight ${i <= index ? 'text-navy' : 'text-navy/50'}`}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
