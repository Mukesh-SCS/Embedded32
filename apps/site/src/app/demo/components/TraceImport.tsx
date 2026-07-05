'use client';

import { useRef, useState } from 'react';
import { validateTraceInput, type Trace } from '@embedded32/demo';
import styles from '../demo.module.css';

type Props = {
  onImport: (trace: Trace) => void;
  onClear: () => void;
};

const SAMPLE = `{
  "scenario": "custom-import",
  "description": "Sample imported trace",
  "frames": [
    { "id": "0x18F0040E", "timestampMs": 0, "data": [0, 0, 0, 16, 0] },
    { "id": "18FEEE0E", "timestampMs": 100, "data": [90] }
  ]
}`;

export function TraceImport({ onImport, onClear }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    const result = validateTraceInput(input);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onImport(result.trace);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setInput(text);
      const result = validateTraceInput(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      onImport(result.trace);
    };
    reader.readAsText(file);
  };

  return (
    <section className={styles.importPanel} data-testid="demo-import">
      <h3 className={styles.panelTitle}>Import trace</h3>
      <textarea
        data-testid="demo-trace-input"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste embedded32-trace-v1 JSON…"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'demo-trace-error' : undefined}
      />
      <div className={styles.importActions}>
        <button type="button" data-testid="demo-trace-import" onClick={handleImport}>
          Load trace
        </button>
        <button type="button" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('');
            setError(null);
            onClear();
          }}
        >
          Clear
        </button>
        <label className={styles.fileLabel}>
          Upload .json
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            data-testid="demo-trace-file"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {error && (
        <p id="demo-trace-error" data-testid="demo-trace-error" className={styles.importError} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
