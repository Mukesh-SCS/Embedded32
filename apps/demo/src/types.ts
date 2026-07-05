export type TraceFrame = {
  timestampMs: number;
  id: string;
  extended?: boolean;
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
  dataPage: number;
  pf: number;
  ps: number;
  pgn: number;
  pgnHex: string;
  sourceAddress: number;
  destinationAddress: number;
  isBroadcast: boolean;
  frameFormat: 'standard' | 'extended';
  rawDataHex: string;
  ecuName: string;
  name: string;
  signals: DecodedSignal[];
  isFault: boolean;
  isKnown: boolean;
  explanation: string;
};

export type ScenarioMeta = {
  scenario: string;
  title: string;
  description: string;
  concepts: string[];
  ecus: string[];
  observations: string[];
  faultSeverity: 'none' | 'low' | 'medium' | 'high';
  studentNotice: string;
  relatedLab?: string;
};
