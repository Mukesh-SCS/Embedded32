import type { DecodedFrame, Trace, TraceFrame } from './types';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_FRAME_COUNT,
  MAX_SCENARIO_LENGTH,
  MAX_TRACE_BYTES,
  normalizeTraceFrameId,
  sanitizeCsvCell,
} from './normalize';

export function exportTraceJson(trace: Trace): string {
  return JSON.stringify(trace, null, 2);
}

export function exportDecodedJson(frames: DecodedFrame[]): string {
  return JSON.stringify({ frames, exportedAt: new Date().toISOString() }, null, 2);
}

export function exportDecodedCsv(frames: DecodedFrame[]): string {
  const header = 'timestampMs,rawId,pgn,pgnHex,sourceAddress,name,signals';
  const rows = frames.map((f) => {
    const signals = f.signals.map((s) => `${s.label}=${s.value}${s.unit ? s.unit : ''}`).join('|');
    return [
      sanitizeCsvCell(f.timestampMs),
      sanitizeCsvCell(f.rawId),
      sanitizeCsvCell(f.pgn),
      sanitizeCsvCell(f.pgnHex),
      sanitizeCsvCell(f.sourceAddress),
      sanitizeCsvCell(f.name),
      sanitizeCsvCell(signals),
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export type TraceValidationResult =
  | { ok: true; trace: Trace }
  | { ok: false; error: string; field?: string };

function validateFrame(frame: unknown, index: number): { ok: true; frame: TraceFrame } | { ok: false; error: string; field?: string } {
  if (!frame || typeof frame !== 'object') {
    return { ok: false, error: `Frame ${index}: must be an object`, field: `frames[${index}]` };
  }

  const f = frame as Record<string, unknown>;

  if (typeof f.timestampMs !== 'number' || !Number.isFinite(f.timestampMs) || f.timestampMs < 0 || !Number.isInteger(f.timestampMs)) {
    return { ok: false, error: `Frame ${index}: timestampMs must be a non-negative integer`, field: `frames[${index}].timestampMs` };
  }

  const idResult = normalizeTraceFrameId(f.id, f.extended);
  if (!idResult.ok) {
    return { ok: false, error: `Frame ${index}: ${idResult.error}`, field: `frames[${index}].id` };
  }

  if (!Array.isArray(f.data)) {
    return { ok: false, error: `Frame ${index}: data must be an array`, field: `frames[${index}].data` };
  }

  if (f.data.length > 8) {
    return { ok: false, error: `Frame ${index}: data must contain at most 8 bytes`, field: `frames[${index}].data` };
  }

  for (let b = 0; b < f.data.length; b++) {
    const byte = f.data[b];
    if (typeof byte !== 'number' || !Number.isInteger(byte) || byte < 0 || byte > 255) {
      return { ok: false, error: `Frame ${index}: byte ${b} must be an integer 0-255`, field: `frames[${index}].data[${b}]` };
    }
  }

  return {
    ok: true,
    frame: {
      timestampMs: f.timestampMs as number,
      id: idResult.id,
      extended: idResult.extended,
      data: f.data as number[],
    },
  };
}

export function validateTraceInput(raw: string): TraceValidationResult {
  if (!raw.trim()) {
    return { ok: false, error: 'Trace JSON is empty', field: 'trace' };
  }

  if (new TextEncoder().encode(raw).length > MAX_TRACE_BYTES) {
    return { ok: false, error: `Trace exceeds maximum size of ${MAX_TRACE_BYTES} bytes`, field: 'trace' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Invalid JSON', field: 'trace' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Trace must be a JSON object', field: 'trace' };
  }

  const candidate = parsed as Partial<Trace> & { frames?: unknown[] };

  if (typeof candidate.scenario !== 'string' || !candidate.scenario.trim()) {
    return { ok: false, error: 'Missing scenario name', field: 'scenario' };
  }

  if (candidate.scenario.length > MAX_SCENARIO_LENGTH) {
    return { ok: false, error: `scenario must be at most ${MAX_SCENARIO_LENGTH} characters`, field: 'scenario' };
  }

  const description = typeof candidate.description === 'string' ? candidate.description : '';
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { ok: false, error: `description must be at most ${MAX_DESCRIPTION_LENGTH} characters`, field: 'description' };
  }

  if (!Array.isArray(candidate.frames) || candidate.frames.length === 0) {
    return { ok: false, error: 'frames must be a non-empty array', field: 'frames' };
  }

  if (candidate.frames.length > MAX_FRAME_COUNT) {
    return { ok: false, error: `frames exceeds maximum of ${MAX_FRAME_COUNT}`, field: 'frames' };
  }

  const frames: TraceFrame[] = [];
  for (let i = 0; i < candidate.frames.length; i++) {
    const result = validateFrame(candidate.frames[i], i);
    if (!result.ok) return result;
    frames.push(result.frame);
  }

  return {
    ok: true,
    trace: {
      format: 'embedded32-trace-v1',
      source: 'imported',
      scenario: candidate.scenario.trim(),
      description,
      frames,
    },
  };
}
