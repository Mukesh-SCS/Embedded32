import {
  buildJ1939Id,
  parseJ1939Id,
  isPDU1,
  getPF,
  getPS,
  filterByPGN,
  filterBySA,
  decodeJ1939,
} from '../src/index.js';

describe('J1939 ID construction and parsing', () => {
  it('round-trips PDU2 broadcast PGNs', () => {
    const pgn = 0xf004;
    const sa = 0x01;
    const id = buildJ1939Id({ pgn, sa, priority: 3 });
    const parsed = parseJ1939Id(id);

    expect(parsed.pgn).toBe(pgn);
    expect(parsed.sa).toBe(sa);
    expect(parsed.priority).toBe(3);
    expect(isPDU1(pgn)).toBe(false);
  });

  it('encodes PDU1 destination in PS field', () => {
    const pgn = 0x002000;
    const sa = 0x10;
    const da = 0x03;
    const id = buildJ1939Id({ pgn, sa, da, priority: 6 });
    const parsed = parseJ1939Id(id);

    expect(parsed.pf).toBe(0x20);
    expect(parsed.ps).toBe(da);
    expect(parsed.sa).toBe(sa);
    expect(isPDU1(pgn)).toBe(true);
    expect(getPF(pgn)).toBe(0x20);
    expect(getPS(pgn)).toBe(0);
  });

  it('handles priority boundaries 0 and 7', () => {
    const low = buildJ1939Id({ pgn: 0xfeee, sa: 0x20, priority: 0 });
    const high = buildJ1939Id({ pgn: 0xfeee, sa: 0x20, priority: 7 });

    expect(parseJ1939Id(low).priority).toBe(0);
    expect(parseJ1939Id(high).priority).toBe(7);
  });

  it('masks priority overflow to 3 bits', () => {
    const id = buildJ1939Id({ pgn: 0xf004, sa: 0x01, priority: 99 });
    expect(parseJ1939Id(id).priority).toBe(3);
  });

  it('decodes unknown PGN frames without throwing', () => {
    const frame = { id: buildJ1939Id({ pgn: 0xabcde, sa: 0x55 }), data: [1, 2], extended: true };
    const msg = decodeJ1939(frame);

    expect(msg.name).toBe('Unknown PGN');
    expect(msg.raw).toEqual([1, 2]);
  });

  it('filters frames by PGN and source address', () => {
    const target = {
      id: buildJ1939Id({ pgn: 0xf004, sa: 0x0e }),
      data: [0, 0, 0, 0x10, 0x20],
      extended: true,
    };
    const other = {
      id: buildJ1939Id({ pgn: 0xfeee, sa: 0x0e }),
      data: [0x50],
      extended: true,
    };

    expect(filterByPGN(target, 0xf004)).toBe(true);
    expect(filterByPGN(other, 0xf004)).toBe(false);
    expect(filterBySA(target, 0x0e)).toBe(true);
    expect(filterBySA(target, 0x01)).toBe(false);
  });
});
