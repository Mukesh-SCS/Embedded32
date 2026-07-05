'use client';

import { useMemo, useState } from 'react';
import type { DecodedFrame } from '@embedded32/demo';
import styles from '../demo.module.css';

const PAGE_SIZE = 50;

type Props = {
  frames: DecodedFrame[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function FrameTable({ frames, selectedIndex, onSelect }: Props) {
  const [pgnFilter, setPgnFilter] = useState('');
  const [saFilter, setSaFilter] = useState('');
  const [faultOnly, setFaultOnly] = useState(false);
  const [knownOnly, setKnownOnly] = useState<'all' | 'known' | 'unknown'>('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = pgnFilter.trim().toLowerCase().replace(/^0x/, '');
    const saNeedle = saFilter.trim().toLowerCase().replace(/^0x/, '');
    return frames.filter((f, idx) => {
      if (needle) {
        const match =
          f.pgnHex.toLowerCase().includes(needle) ||
          f.pgn.toString(16).includes(needle) ||
          f.name.toLowerCase().includes(needle);
        if (!match) return false;
      }
      if (saNeedle && !f.sourceAddress.toString(16).includes(saNeedle)) return false;
      if (faultOnly && !f.isFault) return false;
      if (knownOnly === 'known' && !f.isKnown) return false;
      if (knownOnly === 'unknown' && f.isKnown) return false;
      return true;
    }).map((f, _, arr) => {
      const originalIndex = frames.indexOf(f);
      return { frame: f, originalIndex };
    });
  }, [frames, pgnFilter, saFilter, faultOnly, knownOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className={styles.frameLog} data-testid="demo-frame-log">
      <div className={styles.filters}>
        <label>
          PGN / name
          <input
            data-testid="demo-pgn-filter"
            type="text"
            placeholder="f004 or EEC1"
            value={pgnFilter}
            onChange={(e) => {
              setPgnFilter(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label>
          Source address
          <input
            data-testid="demo-sa-filter"
            type="text"
            placeholder="00"
            value={saFilter}
            onChange={(e) => {
              setSaFilter(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            data-testid="demo-fault-filter"
            checked={faultOnly}
            onChange={(e) => setFaultOnly(e.target.checked)}
          />
          Fault only
        </label>
        <label>
          Known
          <select
            data-testid="demo-known-filter"
            value={knownOnly}
            onChange={(e) => setKnownOnly(e.target.value as 'all' | 'known' | 'unknown')}
          >
            <option value="all">All</option>
            <option value="known">Known</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table data-testid="demo-frame-table">
          <thead>
            <tr>
              <th>t (ms)</th>
              <th>CAN ID</th>
              <th>PGN</th>
              <th>SA</th>
              <th>Message</th>
              <th>Decoded</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Press <strong>Play</strong> or adjust filters.
                </td>
              </tr>
            )}
            {pageItems.map(({ frame, originalIndex }) => (
              <tr
                key={`${frame.timestampMs}-${originalIndex}`}
                data-testid="demo-frame-row"
                className={[
                  frame.isFault ? styles.faultRow : '',
                  selectedIndex === originalIndex ? styles.selectedRow : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(originalIndex)}
              >
                <td>{frame.timestampMs}</td>
                <td>
                  <code>{frame.rawId}</code>
                </td>
                <td>
                  <code>{frame.pgnHex}</code>
                </td>
                <td>
                  <code>0x{frame.sourceAddress.toString(16).padStart(2, '0')}</code>
                </td>
                <td>
                  {frame.name}
                  {frame.isFault && <span aria-label="Fault"> ⚠</span>}
                </td>
                <td>
                  {frame.signals.length === 0
                    ? '—'
                    : frame.signals
                        .slice(0, 2)
                        .map((s) => `${s.label}: ${s.value}`)
                        .join('; ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className={styles.pagination}>
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {page + 1} / {totalPages} ({filtered.length} frames)
          </span>
          <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </section>
  );
}
