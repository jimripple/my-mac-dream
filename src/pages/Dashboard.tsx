import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  ArrowUpRight,
  Check,
  CircleDot,
  Clock,
  FilePlus2,
  MapPin,
  Radio,
  ScanLine,
  ShieldAlert,
  Signal,
  UserRoundSearch,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { alertVolume, glyphPattern, intelItems, sourceStatuses, watchEntities } from '@/lib/intelData';
import { IntelItem, IntelSeverity, SourceStatus, WatchEntity } from '@/types';
import { cn } from '@/lib/utils';

const severityRank: Record<IntelSeverity, number> = {
  low: 1,
  moderate: 2,
  elevated: 3,
  critical: 4,
};

const severityTone: Record<IntelSeverity, string> = {
  low: 'text-[var(--success)]',
  moderate: 'text-[var(--warning)]',
  elevated: 'text-[var(--warning)]',
  critical: 'text-[var(--text-display)]',
};

const pipeline = [
  { label: 'New', value: intelItems.filter((item) => item.status === 'new').length },
  { label: 'Triaging', value: intelItems.filter((item) => item.status === 'triaging').length },
  { label: 'Monitor', value: intelItems.filter((item) => item.status === 'monitoring').length },
  { label: 'Escalated', value: intelItems.filter((item) => item.status === 'escalated').length },
  { label: 'Closed', value: intelItems.filter((item) => item.status === 'closed').length },
];

type CardDetailId = 'posture' | 'incidents' | 'sources' | 'glyph' | 'geo' | 'pipeline' | 'events' | 'watchlist' | 'heatmap' | 'pulse';

interface DetailData {
  kicker: string;
  title: string;
  metrics: Array<{ label: string; value: string }>;
  summary: string;
  items: IntelItem[];
  action: string;
}

type DetailSelection =
  | { type: 'card'; id: CardDetailId }
  | { type: 'incident'; id: string }
  | { type: 'source'; id: string }
  | { type: 'entity'; id: string }
  | null;

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, target]);

  return value;
}

function getRiskScore(items: IntelItem[]) {
  const weighted = items.reduce((sum, item) => sum + severityRank[item.severity] * item.confidence, 0);
  return Math.min(99, Math.round(weighted / 9.6));
}

function getMostUrgent(items: IntelItem[]) {
  return [...items].sort((a, b) => {
    const severityDelta = severityRank[b.severity] - severityRank[a.severity];
    if (severityDelta !== 0) return severityDelta;
    return b.confidence - a.confidence;
  })[0];
}

export default function Dashboard() {
  const [drift, setDrift] = useState(0);
  const [intake, setIntake] = useState('');
  const [detail, setDetail] = useState<DetailSelection>(null);
  const riskScore = getRiskScore(intelItems) + drift;
  const animatedRisk = useCountUp(riskScore);
  const urgent = getMostUrgent(intelItems);
  const openItems = intelItems.filter((item) => item.status !== 'closed');
  const now = new Date();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDrift((current) => (current === 2 ? -1 : current + 1));
    }, 3200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="nd-label">Threat Triage / Prototype Feed</div>
          <h1 className="mt-2 font-grotesk text-[32px] font-medium leading-none tracking-[-0.01em] text-[var(--text-display)] md:text-[44px]">
            Safety intelligence command center
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[var(--text-disabled)]">/</span>
          <span>{openItems.length} open signals</span>
          <span className="text-[var(--text-disabled)]">/</span>
          <span>Manual source mode</span>
        </div>
      </header>

      <section className="grid auto-rows-[minmax(168px,auto)] grid-cols-1 gap-3 xl:grid-cols-4">
        <ThreatPostureCard score={animatedRisk} urgent={urgent} onOpen={() => setDetail({ type: 'card', id: 'posture' })} />
        <IncidentQueueCard
          items={intelItems.slice(0, 5)}
          onOpen={() => setDetail({ type: 'card', id: 'incidents' })}
          onOpenItem={(id) => setDetail({ type: 'incident', id })}
        />
        <SourceHealthCard
          onOpen={() => setDetail({ type: 'card', id: 'sources' })}
          onOpenSource={(id) => setDetail({ type: 'source', id })}
        />
        <GlyphCard drift={drift} onOpen={() => setDetail({ type: 'card', id: 'glyph' })} />
        <GeoWatchCard onOpen={() => setDetail({ type: 'card', id: 'geo' })} />
        <PipelineCard onOpen={() => setDetail({ type: 'card', id: 'pipeline' })} />
        <EventRiskCard onOpen={() => setDetail({ type: 'card', id: 'events' })} />
        <WatchlistCard
          onOpen={() => setDetail({ type: 'card', id: 'watchlist' })}
          onOpenEntity={(id) => setDetail({ type: 'entity', id })}
        />
        <HeatmapCard onOpen={() => setDetail({ type: 'card', id: 'heatmap' })} />
        <SystemPulseCard onOpen={() => setDetail({ type: 'card', id: 'pulse' })} />
        <IntakeCard intake={intake} setIntake={setIntake} />
      </section>

      {detail && <DetailPanel selection={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function ThreatPostureCard({ score, urgent, onOpen }: { score: number; urgent: IntelItem; onOpen: () => void }) {
  return (
    <article
      className="nd-card nd-clickable self-start xl:col-span-2 min-h-[260px] p-6 dot-grid-subtle"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => handleCardKey(event, onOpen)}
    >
      <div className="relative z-10 flex flex-col gap-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="nd-label">Current Posture</div>
            <div className="mt-4 flex items-start gap-4">
              <span className="h-4 w-4 rounded-full bg-[var(--accent)] pulse-led" aria-hidden="true" />
              <div className="-mb-10 font-display text-[88px] leading-[0.72] tracking-[-0.03em] text-[var(--text-display)] sm:-mb-12 sm:text-[104px]">
                {score}
              </div>
            </div>
          </div>
          <div className="rounded-full border border-[var(--border-visible)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-primary)]">
            Watch Level 03
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_180px] md:items-end">
          <div>
            <h2 className="font-grotesk text-[24px] font-medium leading-tight text-[var(--text-display)]">
              {urgent.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              {urgent.summary}
            </p>
          </div>
          <div className="space-y-3">
            <Metric label="Confidence" value={`${urgent.confidence}%`} tone="text-[var(--text-display)]" />
            <Metric label="Location" value={urgent.location} />
            <Metric label="Source" value={urgent.sourceType.replace('_', ' ')} />
          </div>
        </div>
      </div>
    </article>
  );
}

function IncidentQueueCard({ items, onOpen, onOpenItem }: { items: IntelItem[]; onOpen: () => void; onOpenItem: (id: string) => void }) {
  return (
    <article className="nd-card xl:col-span-2 min-h-[320px] p-5">
      <CardHeader icon={ShieldAlert} label="Live Incident Queue" value={`${items.length} signals`} onOpen={onOpen} />
      <div className="mt-4 divide-y divide-[var(--border)]">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onOpenItem(item.id)}
            className="grid w-full gap-3 py-3 text-left transition-colors hover:text-[var(--text-display)] md:grid-cols-[1fr_86px_92px] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('font-mono text-[11px] uppercase tracking-[0.08em]', severityTone[item.severity])}>
                  {item.severity}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-1 truncate font-grotesk text-[15px] text-[var(--text-display)]">
                {item.title}
              </div>
              <div className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                {item.location}
              </div>
            </div>
            <SegmentedBar value={item.confidence} segments={10} />
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              {item.status}
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

function SourceHealthCard({ onOpen, onOpenSource }: { onOpen: () => void; onOpenSource: (id: string) => void }) {
  return (
    <article className="nd-card p-5">
      <CardHeader icon={Signal} label="Source Health" value="4 feeds" onOpen={onOpen} />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {sourceStatuses.map((source, index) => (
          <button
            key={source.id}
            type="button"
            onClick={() => onOpenSource(source.id)}
            className="border border-[var(--border)] p-3 text-left transition-colors hover:border-[var(--border-visible)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                {source.health}
              </span>
              <span
                className="h-2 w-2 rounded-full bg-[var(--text-display)] pulse-led"
                style={{ animationDelay: `${index * 160}ms` }}
              />
            </div>
            <div className="mt-4 font-grotesk text-sm text-[var(--text-display)]">{source.name}</div>
            <div className="mt-1 font-mono text-[22px] tracking-[-0.02em] text-[var(--text-primary)]">
              {source.itemCount}
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

function GlyphCard({ drift, onOpen }: { drift: number; onOpen: () => void }) {
  return (
    <article className="nd-card nd-clickable p-5" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => handleCardKey(event, onOpen)}>
      <CardHeader icon={Radio} label="Glyph Scan" value="pattern" />
      <div className="mt-5 grid grid-cols-8 gap-2">
        {glyphPattern.map((dot, index) => {
          const active = (dot + index + drift) % 3 !== 0;
          return (
            <span
              key={`${dot}-${index}`}
              className={cn(
                'aspect-square rounded-full transition-colors duration-300',
                active ? 'bg-[var(--text-display)]' : 'bg-[var(--border)]'
              )}
              style={{ opacity: active ? 0.95 - (index % 4) * 0.14 : 1 }}
            />
          );
        })}
      </div>
      <div className="mt-5 typewriter-reveal font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
        perimeter pattern stable / manual review active
      </div>
    </article>
  );
}

function GeoWatchCard({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="nd-card nd-clickable p-5" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => handleCardKey(event, onOpen)}>
      <CardHeader icon={MapPin} label="Geographic Watch" value="campus" />
      <div className="relative mt-5 aspect-[4/3] border border-[var(--border)] dot-grid-subtle">
        <span className="absolute left-[28%] top-[42%] h-3 w-3 rounded-full bg-[var(--text-display)] pulse-led" />
        <span className="absolute left-[62%] top-[36%] h-2 w-2 rounded-full bg-[var(--warning)] pulse-led" style={{ animationDelay: '240ms' }} />
        <span className="absolute left-[52%] top-[70%] h-2 w-2 rounded-full bg-[var(--text-secondary)] pulse-led" style={{ animationDelay: '420ms' }} />
        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          <span>North lot</span>
          <span>West gate</span>
          <span>Lobby</span>
        </div>
      </div>
    </article>
  );
}

function PipelineCard({ onOpen }: { onOpen: () => void }) {
  const max = Math.max(...pipeline.map((item) => item.value), 1);

  return (
    <article className="nd-card nd-clickable p-5" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => handleCardKey(event, onOpen)}>
      <CardHeader icon={ScanLine} label="Triage Pipeline" value="status" />
      <div className="mt-5 space-y-4">
        {pipeline.map((item, index) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between">
              <span className="nd-label">{item.label}</span>
              <span className="font-mono text-sm text-[var(--text-display)]">{item.value}</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 8 }).map((_, segment) => (
                <span
                  key={segment}
                  className={cn(
                    'h-2 segment-fill',
                    segment < Math.ceil((item.value / max) * 8) ? 'bg-[var(--text-display)]' : 'bg-[var(--border)]'
                  )}
                  style={{ animationDelay: `${index * 80 + segment * 35}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function EventRiskCard({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="nd-card nd-clickable xl:col-span-2 p-5" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => handleCardKey(event, onOpen)}>
      <CardHeader icon={Clock} label="Upcoming Event Strip" value="72 hr" />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ['Sunday Service', 'Wind advisory / arrivals', 'MODERATE'],
          ['Youth Night', 'Road restriction west side', 'MODERATE'],
          ['Choir Rehearsal', 'North lot observation', 'ELEVATED'],
        ].map(([name, context, level]) => (
          <div key={name} className="border border-[var(--border)] p-4">
            <div className="nd-label">{level}</div>
            <div className="mt-4 font-grotesk text-lg font-medium text-[var(--text-display)]">{name}</div>
            <div className="mt-2 text-sm text-[var(--text-secondary)]">{context}</div>
          </div>
        ))}
      </div>
    </article>
  );
}

function WatchlistCard({ onOpen, onOpenEntity }: { onOpen: () => void; onOpenEntity: (id: string) => void }) {
  return (
    <article className="nd-card p-5">
      <CardHeader icon={UserRoundSearch} label="Watchlist" value={`${watchEntities.length} entities`} onOpen={onOpen} />
      <div className="mt-5 divide-y divide-[var(--border)]">
        {watchEntities.map((entity) => (
          <button
            key={entity.id}
            type="button"
            onClick={() => onOpenEntity(entity.id)}
            className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:text-[var(--text-display)]"
          >
            <div className="min-w-0">
              <div className="truncate font-grotesk text-sm text-[var(--text-display)]">{entity.name}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
                {entity.type} / {entity.relatedItemIds.length} links
              </div>
            </div>
            <div className={cn('font-mono text-[11px] uppercase tracking-[0.08em]', severityTone[entity.riskLevel])}>
              {entity.riskLevel}
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

function HeatmapCard({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="nd-card nd-clickable p-5" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => handleCardKey(event, onOpen)}>
      <CardHeader icon={Activity} label="Alert Volume" value="28 slots" />
      <div className="mt-5 grid grid-cols-7 gap-2">
        {alertVolume.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="aspect-square border border-[var(--border)] bg-[var(--text-display)]"
            style={{ opacity: 0.16 + value / 16 }}
            title={`${value} records`}
          />
        ))}
      </div>
    </article>
  );
}

function SystemPulseCard({ onOpen }: { onOpen: () => void }) {
  const points = '0,44 20,44 30,24 43,62 58,16 74,44 92,44 106,34 120,50 140,44 160,44';

  return (
    <article className="nd-card nd-clickable p-5" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => handleCardKey(event, onOpen)}>
      <CardHeader icon={CircleDot} label="System Pulse" value="sample" />
      <svg viewBox="0 0 160 80" className="mt-5 h-24 w-full overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="var(--text-display)"
          strokeWidth="2"
          strokeLinejoin="miter"
          strokeLinecap="square"
          className="sparkline-draw"
        />
        <line x1="0" x2="160" y1="44" y2="44" stroke="var(--border-visible)" strokeDasharray="4 6" />
      </svg>
      <div className="mt-3 flex h-12 items-end gap-1">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className="wave-bar flex-1 bg-[var(--text-display)]"
            style={{ height: `${28 + ((index * 17) % 32)}px`, animationDelay: `${index * 42}ms`, opacity: 0.35 + (index % 5) * 0.12 }}
          />
        ))}
      </div>
    </article>
  );
}

function IntakeCard({ intake, setIntake }: { intake: string; setIntake: (value: string) => void }) {
  return (
    <article className="nd-card xl:col-span-2 p-5">
      <CardHeader icon={FilePlus2} label="Manual Intake" value="local draft" />
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <textarea
          value={intake}
          onChange={(event) => setIntake(event.target.value)}
          placeholder="Record a sample observation..."
          className="min-h-28 resize-none rounded-lg border border-[var(--border-visible)] bg-transparent p-4 font-mono text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-disabled)] focus:border-[var(--text-display)]"
        />
        <div className="flex flex-col justify-between gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--text-display)] px-5 font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--black)]"
          >
            <Check className="h-4 w-4" />
            Stage
          </button>
          <div className="font-mono text-[10px] uppercase leading-5 tracking-[0.08em] text-[var(--text-disabled)]">
            Prototype only. Draft is not persisted.
          </div>
        </div>
      </div>
    </article>
  );
}

function CardHeader({ icon: Icon, label, value, onOpen }: { icon: LucideIcon; label: string; value: string; onOpen?: () => void }) {
  const valueNode = (
    <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
      {value}
      <ArrowUpRight className="h-3 w-3" />
    </div>
  );

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
        <span className="nd-label">{label}</span>
      </div>
      {onOpen ? (
        <button type="button" onClick={onOpen} className="transition-colors hover:text-[var(--text-display)]">
          {valueNode}
        </button>
      ) : valueNode}
    </div>
  );
}

function Metric({ label, value, tone = 'text-[var(--text-primary)]' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="border-t border-[var(--border)] pt-3">
      <div className="nd-label">{label}</div>
      <div className={cn('mt-1 font-mono text-[16px] tracking-[-0.02em]', tone)}>{value}</div>
    </div>
  );
}

function SegmentedBar({ value, segments }: { value: number; segments: number }) {
  const filled = Math.round((value / 100) * segments);

  return (
    <div>
      <div className="mb-1 text-right font-mono text-[11px] text-[var(--text-secondary)]">{value}%</div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: segments }).map((_, index) => (
          <span
            key={index}
            className={cn('h-2 segment-fill', index < filled ? 'bg-[var(--text-display)]' : 'bg-[var(--border)]')}
            style={{ animationDelay: `${index * 45}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ selection, onClose }: { selection: DetailSelection; onClose: () => void }) {
  const detail = resolveDetail(selection);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<number>();

  useEffect(() => {
    setIsClosing(false);
  }, [selection]);

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  const requestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(onClose, 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [requestClose]);

  return (
    <div
      className={cn(
        'detail-backdrop fixed inset-0 z-50 bg-[rgba(0,0,0,0.82)] p-3 sm:p-6',
        isClosing ? 'detail-backdrop-out' : 'detail-backdrop-in'
      )}
      onClick={requestClose}
    >
      <aside
        className={cn(
          'nd-card detail-panel ml-auto flex h-full w-full max-w-[560px] flex-col bg-[var(--surface)] p-0',
          isClosing ? 'detail-panel-out' : 'detail-panel-in'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={detail.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div>
            <div className="nd-label">{detail.kicker}</div>
            <h2 className="mt-3 font-grotesk text-[28px] font-medium leading-tight text-[var(--text-display)]">
              {detail.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--border-visible)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-display)] hover:text-[var(--text-display)]"
            aria-label="Close detail panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-auto p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {detail.metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="detail-stagger border border-[var(--border)] p-3"
                style={{ animationDelay: `${90 + index * 45}ms` }}
              >
                <div className="nd-label">{metric.label}</div>
                <div className="mt-4 font-mono text-[20px] tracking-[-0.02em] text-[var(--text-display)]">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          <div className="detail-stagger mt-6 border-t border-[var(--border)] pt-5" style={{ animationDelay: '230ms' }}>
            <div className="nd-label">Analyst Readout</div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{detail.summary}</p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="nd-label">Relevant Records</div>
            {detail.items.map((item, index) => (
              <div
                key={item.id}
                className="detail-stagger border border-[var(--border)] p-4"
                style={{ animationDelay: `${290 + index * 55}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={cn('font-mono text-[11px] uppercase tracking-[0.08em]', severityTone[item.severity])}>
                    {item.severity}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-disabled)]">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-3 font-grotesk text-[17px] font-medium text-[var(--text-display)]">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[var(--border-visible)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ActionBlock label="Next action" value={detail.action} delay="420ms" />
            <ActionBlock label="Boundary" value="Prototype data only. Verify before escalation." delay="475ms" />
          </div>
        </div>
      </aside>
    </div>
  );
}

function ActionBlock({ label, value, delay = '0ms' }: { label: string; value: string; delay?: string }) {
  return (
    <div className="detail-stagger border border-[var(--border-visible)] p-4" style={{ animationDelay: delay }}>
      <div className="nd-label">{label}</div>
      <div className="mt-3 text-sm leading-6 text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

function resolveDetail(selection: NonNullable<DetailSelection>): DetailData {
  if (selection.type === 'incident') {
    const item = intelItems.find((candidate) => candidate.id === selection.id) ?? intelItems[0];
    return incidentDetail(item);
  }

  if (selection.type === 'source') {
    const source = sourceStatuses.find((candidate) => candidate.id === selection.id) ?? sourceStatuses[0];
    return sourceDetail(source);
  }

  if (selection.type === 'entity') {
    const entity = watchEntities.find((candidate) => candidate.id === selection.id) ?? watchEntities[0];
    return entityDetail(entity);
  }

  const byCard = {
    posture: postureDetail(),
    incidents: {
      kicker: 'Queue Detail',
      title: 'Live incident queue',
      metrics: [
        { label: 'Open', value: String(intelItems.filter((item) => item.status !== 'closed').length) },
        { label: 'Elevated', value: String(intelItems.filter((item) => item.severity === 'elevated').length) },
        { label: 'Avg conf', value: `${Math.round(intelItems.reduce((sum, item) => sum + item.confidence, 0) / intelItems.length)}%` },
      ],
      summary: 'A working list of signals that need analyst review. Rows are deliberately compact; the detail view is where source notes, tags, and next actions live.',
      items: intelItems,
      action: 'Sort by severity, confidence, and recency. Move confirmed non-issues to closed so the queue stays usable.',
    },
    sources: sourceDetail(sourceStatuses[0]),
    glyph: {
      kicker: 'Sensor Surface',
      title: 'Glyph scan pattern',
      metrics: [
        { label: 'Mode', value: 'Sample' },
        { label: 'Pattern', value: 'Stable' },
        { label: 'Inputs', value: 'Manual' },
      ],
      summary: 'A visual pulse for the command center. It is intentionally mechanical and abstract, used as a status instrument rather than a decorative graphic.',
      items: intelItems.filter((item) => item.status !== 'closed').slice(0, 3),
      action: 'Replace this with real source heartbeat data once collectors exist.',
    },
    geo: {
      kicker: 'Location Detail',
      title: 'Campus geographic watch',
      metrics: [
        { label: 'Zones', value: '3' },
        { label: 'Hot zone', value: 'North lot' },
        { label: 'Open', value: '2' },
      ],
      summary: 'Campus zones show where current signals cluster. This should become the map-based entry point for parking, entrances, routes, and event-specific watch areas.',
      items: intelItems.filter((item) => ['North Parking Lot', 'West Entrance Corridor', 'Campus Wide'].includes(item.location)),
      action: 'Attach each signal to a campus zone and review before service windows.',
    },
    pipeline: {
      kicker: 'Workflow Detail',
      title: 'Triage pipeline',
      metrics: pipeline.slice(0, 3).map((item) => ({ label: item.label, value: String(item.value) })),
      summary: 'The pipeline keeps analysis from turning into a pile of alerts. Each record should have one status, one owner, and one next action.',
      items: intelItems,
      action: 'Add owner and due-time fields before this becomes an operational workflow.',
    },
    events: {
      kicker: 'Event Detail',
      title: 'Upcoming event strip',
      metrics: [
        { label: 'Window', value: '72 hr' },
        { label: 'Events', value: '3' },
        { label: 'Peak', value: 'Elevated' },
      ],
      summary: 'Events are the safest way to make OSINT practical for a church team: filter everything through what could affect arrivals, dismissal, staffing, weather, and facility access.',
      items: intelItems.filter((item) => item.tags.some((tag) => ['sunday', 'youth-night', 'after-hours'].includes(tag))),
      action: 'Generate a pre-event safety brief from open records.',
    },
    watchlist: entityDetail(watchEntities[0]),
    heatmap: {
      kicker: 'Volume Detail',
      title: 'Alert volume heatmap',
      metrics: [
        { label: 'Slots', value: String(alertVolume.length) },
        { label: 'Peak', value: String(Math.max(...alertVolume)) },
        { label: 'Trend', value: '+18%' },
      ],
      summary: 'The heatmap is a density instrument. It should help the operator see when alerts are clustering and whether a spike is real or caused by training/manual entry.',
      items: intelItems.slice(0, 4),
      action: 'Tie each square to a real time bucket after persistent records exist.',
    },
    pulse: {
      kicker: 'System Detail',
      title: 'System pulse',
      metrics: [
        { label: 'State', value: 'Nominal' },
        { label: 'Feeds', value: '4' },
        { label: 'Errors', value: '0' },
      ],
      summary: 'System pulse is the command center heartbeat. It should later combine collector health, stale sources, failed syncs, and operator activity.',
      items: intelItems.filter((item) => item.status !== 'closed').slice(0, 3),
      action: 'Connect to real collector health before adding automated source ingestion.',
    },
  } satisfies Record<CardDetailId, DetailData>;

  return byCard[selection.id];
}

function postureDetail() {
  const urgent = getMostUrgent(intelItems);
  return {
    kicker: 'Posture Detail',
    title: 'Current threat posture',
    metrics: [
      { label: 'Score', value: String(getRiskScore(intelItems)) },
      { label: 'Watch', value: '03' },
      { label: 'Open', value: String(intelItems.filter((item) => item.status !== 'closed').length) },
    ],
    summary: 'The posture score is a prototype composite of severity and confidence. It is meant to orient the operator quickly, then push them into the specific records behind the number.',
    items: [urgent, ...intelItems.filter((item) => item.id !== urgent.id && item.status !== 'closed').slice(0, 3)],
    action: 'Review the highest-severity open signal and confirm whether it needs escalation or monitoring.',
  };
}

function incidentDetail(item: IntelItem) {
  return {
    kicker: 'Incident Detail',
    title: item.title,
    metrics: [
      { label: 'Severity', value: item.severity },
      { label: 'Confidence', value: `${item.confidence}%` },
      { label: 'Status', value: item.status },
    ],
    summary: `${item.summary} Source: ${item.source}. Location: ${item.location}.`,
    items: [item],
    action: 'Corroborate with a second source or assign a safety-team follow-up before changing severity.',
  };
}

function sourceDetail(source: SourceStatus) {
  const items = intelItems.filter((item) => item.sourceType === source.type || item.source.includes(source.name.split(' ')[0]));
  return {
    kicker: 'Source Detail',
    title: source.name,
    metrics: [
      { label: 'Health', value: source.health },
      { label: 'Records', value: String(source.itemCount) },
      { label: 'Type', value: source.type.replace('_', ' ') },
    ],
    summary: `This source is currently marked ${source.health}. Last sync is represented by sample data at ${formatDistanceToNow(new Date(source.lastSync), { addSuffix: true })}.`,
    items: items.length > 0 ? items : intelItems.slice(0, 2),
    action: 'Define the official source URL, refresh cadence, owner, and failure behavior before making it live.',
  };
}

function entityDetail(entity: WatchEntity) {
  const items = intelItems.filter((item) => entity.relatedItemIds.includes(item.id));
  return {
    kicker: 'Entity Detail',
    title: entity.name,
    metrics: [
      { label: 'Type', value: entity.type },
      { label: 'Risk', value: entity.riskLevel },
      { label: 'Links', value: String(entity.relatedItemIds.length) },
    ],
    summary: `Watch entities group related records into something an analyst can track over time. Last seen ${formatDistanceToNow(new Date(entity.lastSeen), { addSuffix: true })}.`,
    items: items.length > 0 ? items : intelItems.slice(0, 2),
    action: 'Keep watch entities narrow: one place, one event, one organization, or one keyword pattern.',
  };
}

function handleCardKey(event: ReactKeyboardEvent<HTMLElement>, onOpen: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onOpen();
  }
}
