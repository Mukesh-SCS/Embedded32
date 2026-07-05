import {
  decodeSPNValue,
  decodeSPNsFromFrame,
  validateSPNValue,
  formatSPNValue,
  describeFMI,
  getSPNInfo,
} from '../src/index.js';

describe('SPN decode boundaries', () => {
  it('decodes engine speed at min and scaled max', () => {
    const min = decodeSPNValue(190, [0, 0], 0);
    const max = decodeSPNValue(190, [0xff, 0x1f], 0);

    expect(min.isValid).toBe(true);
    expect(min.value).toBe(0);
    expect(max.isValid).toBe(true);
    expect(max.value).toBeCloseTo(1023.875, 3);
  });

  it('marks 0xFF single-byte SPN as not available', () => {
    const na = decodeSPNValue(110, [0xff], 0);
    expect(na.isError).toBe(true);
    expect(na.isValid).toBe(false);
    expect(formatSPNValue(na)).toContain('NOT AVAILABLE');
  });

  it('returns error for unknown SPN numbers', () => {
    const unknown = decodeSPNValue(99999, [1, 2, 3], 0);
    expect(unknown.isValid).toBe(false);
    expect(unknown.isError).toBe(true);
    expect(getSPNInfo(99999)).toBeUndefined();
  });

  it('decodes multiple SPNs from one frame', () => {
    const frame = [0x50, 0x10, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00];
    const decoded = decodeSPNsFromFrame(frame, [
      { spn: 26, startByte: 0 },
      { spn: 190, startByte: 1 },
    ]);

    expect(decoded).toHaveLength(2);
    expect(decoded[0].spn).toBe(26);
    expect(decoded[1].spn).toBe(190);
  });

  it('validates values inside and outside SPN range', () => {
    expect(validateSPNValue(190, 1000)).toBe(true);
    expect(validateSPNValue(190, 9000)).toBe(false);
    expect(validateSPNValue(99999, 0)).toBe(false);
  });

  it('describes common and reserved FMI codes', () => {
    expect(describeFMI(0)).toContain('Above Normal');
    expect(describeFMI(21)).toContain('CAN Termination');
    expect(describeFMI(200)).toContain('Reserved FMI');
  });
});
