export type TraceFrame = {
  timestampMs: number;
  id: string;
  extended: boolean;
  data: number[];
};

export type Trace = {
  format: string;
  source: string;
  scenario: string;
  description: string;
  frames: TraceFrame[];
};

export type DecodedSignal = {
  label: string;
  value: string;
  unit?: string;
};

export type DecodedFrame = {
  timestampMs: number;
  rawId: string;
  priority: number;
  pgn: number;
  pgnHex: string;
  sourceAddress: number;
  name: string;
  signals: DecodedSignal[];
  isFault: boolean;
};
