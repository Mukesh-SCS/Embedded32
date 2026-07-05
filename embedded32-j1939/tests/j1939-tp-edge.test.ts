import { J1939TransportProtocol, parseBAM } from '../src/index.js';

describe('Transport protocol edge cases', () => {
  let tp: J1939TransportProtocol;

  beforeEach(() => {
    tp = new J1939TransportProtocol();
  });

  it('leaves BAM incomplete when packets are missing', () => {
    const pgn = 0xfef1;
    const session = tp.startBAM(pgn, 14, 2);
    tp.addBAMPacket(pgn, 1, [1, 2, 3, 4, 5, 6, 7]);

    expect(session.complete).toBe(false);
    expect(session.assembledData).toHaveLength(0);
  });

  it('assembles out-of-order BAM packets', () => {
    const pgn = 0xfef1;
    const session = tp.startBAM(pgn, 14, 2);
    tp.addBAMPacket(pgn, 2, [8, 9, 10, 11, 12, 13, 14]);
    tp.addBAMPacket(pgn, 1, [1, 2, 3, 4, 5, 6, 7]);

    expect(session.complete).toBe(true);
    expect(session.assembledData[0]).toBe(1);
    expect(session.assembledData[13]).toBe(14);
  });

  it('rejects duplicate packet index until all slots filled', () => {
    const pgn = 0xfef1;
    const session = tp.startBAM(pgn, 14, 2);
    tp.addBAMPacket(pgn, 1, [1, 2, 3, 4, 5, 6, 7]);
    expect(session.complete).toBe(false);
    tp.addBAMPacket(pgn, 1, [9, 9, 9, 9, 9, 9, 9]);
    tp.addBAMPacket(pgn, 2, [8, 9, 10, 11, 12, 13, 14]);

    expect(session.complete).toBe(true);
    expect(session.assembledData[0]).toBe(9);
    expect(session.assembledData[6]).toBe(9);
  });

  it('cleans up timed-out incomplete sessions', () => {
    const pgn = 0xfef9;
    const session = tp.startBAM(pgn, 20, 3);
    session.startTime = Date.now() - 5000;

    tp.cleanup(1000);
    expect(tp.addBAMPacket(pgn, 1, [1])).toBeNull();
  });

  it('handles short BAM parse input without throwing', () => {
    const short = parseBAM([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(short.messageLength).toBeGreaterThanOrEqual(0);
    expect(short.numberOfPackets).toBe(3);
  });
});
