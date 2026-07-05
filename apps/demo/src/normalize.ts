/** Maximum import payload size in bytes. */
export const MAX_TRACE_BYTES = 2 * 1024 * 1024;
/** Maximum number of frames per imported trace. */
export const MAX_FRAME_COUNT = 5000;
export const MAX_SCENARIO_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 1000;

export type NormalizedCanId = {
  /** Uppercase hex without 0x prefix. */
  hex: string;
  numeric: number;
  extended: boolean;
};

/**
 * Strip optional 0x/0X prefix and validate hex digits.
 */
export function stripHexPrefix(id: string): string {
  return id.replace(/^0x/i, '').trim();
}

/**
 * Parse and normalize a CAN identifier from bundled trace formats.
 * Supports `0x18F00400` and `18F00400`.
 */
export function normalizeCanId(raw: string, extendedHint?: boolean): NormalizedCanId | null {
  const hex = stripHexPrefix(raw);
  if (!/^[0-9a-fA-F]+$/.test(hex)) return null;

  const numeric = parseInt(hex, 16) >>> 0;
  const extended =
    typeof extendedHint === 'boolean' ? extendedHint : hex.length > 3 || numeric > 0x7ff;

  if (extended) {
    if (numeric > 0x1fffffff) return null;
  } else if (numeric > 0x7ff) {
    return null;
  }

  return {
    hex: hex.toUpperCase(),
    numeric,
    extended,
  };
}

export function normalizeTraceFrameId(
  id: unknown,
  extendedHint?: unknown
): { ok: true; id: string; extended: boolean } | { ok: false; error: string } {
  if (typeof id !== 'string' || !id.trim()) {
    return { ok: false, error: 'id must be a non-empty hex string' };
  }

  const hint = typeof extendedHint === 'boolean' ? extendedHint : undefined;
  const parsed = normalizeCanId(id, hint);
  if (!parsed) {
    return { ok: false, error: `invalid CAN id: ${id}` };
  }

  return { ok: true, id: parsed.hex, extended: parsed.extended };
}

/** Neutralize spreadsheet formula injection in CSV cells. */
export function sanitizeCsvCell(value: string | number): string {
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  const needsQuote = /[",\n\r]/.test(str) || /^[=+\-@]/.test(str);
  const neutralized = /^[=+\-@]/.test(str) ? `'${escaped}` : escaped;
  return needsQuote || /^[=+\-@]/.test(str) ? `"${neutralized}"` : neutralized;
}
