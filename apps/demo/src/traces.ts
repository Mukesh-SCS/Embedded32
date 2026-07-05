// AUTO-GENERATED from examples/traces/ by apps/demo/scripts/generate-traces.mjs
// Do not edit by hand - run `node apps/demo/scripts/generate-traces.mjs` to refresh.

import type { Trace } from './types';

export const TRACES: Trace[] = [
  {
    "format": "embedded32-trace-v1",
    "source": "synthetic",
    "scenario": "normal-operation",
    "description": "Engine and transmission broadcasts at cruise-like values",
    "frames": [
      {
        "timestampMs": 0,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          64,
          31,
          0,
          0
        ]
      },
      {
        "timestampMs": 100,
        "id": "0x18F00003",
        "extended": true,
        "data": [
          160,
          1,
          128,
          1,
          0,
          255,
          128,
          128
        ]
      },
      {
        "timestampMs": 200,
        "id": "0x18FEEE00",
        "extended": true,
        "data": [
          125,
          255,
          255,
          255,
          255,
          255,
          255,
          255
        ]
      },
      {
        "timestampMs": 300,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          65,
          31,
          0,
          0
        ]
      }
    ]
  },
  {
    "format": "embedded32-trace-v1",
    "source": "synthetic",
    "scenario": "engine-overheat",
    "description": "Coolant temperature elevated followed by DM1 active fault from engine ECU",
    "frames": [
      {
        "timestampMs": 0,
        "id": "0x18FEEE00",
        "extended": true,
        "data": [
          150,
          255,
          255,
          255,
          255,
          255,
          255,
          255
        ]
      },
      {
        "timestampMs": 100,
        "id": "0x18FECA00",
        "extended": true,
        "data": [
          4,
          26,
          0,
          0,
          32,
          0,
          0,
          0
        ]
      },
      {
        "timestampMs": 200,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          100,
          50,
          20,
          0,
          0
        ]
      }
    ]
  },
  {
    "format": "embedded32-trace-v1",
    "source": "synthetic",
    "scenario": "sensor-failure",
    "description": "Barometric pressure SPN reports erratic above-normal reading",
    "frames": [
      {
        "timestampMs": 0,
        "id": "0x18FEF500",
        "extended": true,
        "data": [
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255
        ]
      },
      {
        "timestampMs": 100,
        "id": "0x18FECA00",
        "extended": true,
        "data": [
          4,
          110,
          0,
          0,
          0,
          0,
          0,
          0
        ]
      }
    ]
  },
  {
    "format": "embedded32-trace-v1",
    "source": "synthetic",
    "scenario": "high-bus-load",
    "description": "Rapid alternating EEC1 and ETC1 frames for bus load discussion",
    "frames": [
      {
        "timestampMs": 0,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          40,
          20,
          0,
          0
        ]
      },
      {
        "timestampMs": 10,
        "id": "0x18F00003",
        "extended": true,
        "data": [
          100,
          0,
          100,
          0,
          0,
          255,
          125,
          125
        ]
      },
      {
        "timestampMs": 20,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          41,
          20,
          0,
          0
        ]
      },
      {
        "timestampMs": 30,
        "id": "0x18F00003",
        "extended": true,
        "data": [
          101,
          0,
          101,
          0,
          0,
          255,
          125,
          125
        ]
      },
      {
        "timestampMs": 40,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          42,
          20,
          0,
          0
        ]
      },
      {
        "timestampMs": 50,
        "id": "0x18F00003",
        "extended": true,
        "data": [
          102,
          0,
          102,
          0,
          0,
          255,
          125,
          125
        ]
      },
      {
        "timestampMs": 60,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          43,
          20,
          0,
          0
        ]
      },
      {
        "timestampMs": 70,
        "id": "0x18F00003",
        "extended": true,
        "data": [
          103,
          0,
          103,
          0,
          0,
          255,
          125,
          125
        ]
      }
    ]
  },
  {
    "format": "embedded32-trace-v1",
    "source": "synthetic",
    "scenario": "address-conflict",
    "description": "Two devices broadcasting EEC1 from the same source address 0x00",
    "frames": [
      {
        "timestampMs": 0,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          40,
          25,
          0,
          0
        ]
      },
      {
        "timestampMs": 50,
        "id": "0x18F00400",
        "extended": true,
        "data": [
          0,
          0,
          0,
          125,
          200,
          80,
          0,
          0
        ]
      }
    ]
  },
  {
    "format": "embedded32-trace-v1",
    "source": "synthetic",
    "scenario": "multi-packet-message",
    "description": "Simplified TP.BAM announce and data frames for teaching (not full transport validation)",
    "frames": [
      {
        "timestampMs": 0,
        "id": "0x18ECFF00",
        "extended": true,
        "data": [
          32,
          16,
          0,
          3,
          255,
          202,
          254,
          0
        ]
      },
      {
        "timestampMs": 20,
        "id": "0x18EBFF00",
        "extended": true,
        "data": [
          1,
          1,
          2,
          3,
          4,
          5,
          6,
          7
        ]
      },
      {
        "timestampMs": 40,
        "id": "0x18EBFF00",
        "extended": true,
        "data": [
          2,
          8,
          9,
          10,
          11,
          12,
          13,
          14
        ]
      },
      {
        "timestampMs": 60,
        "id": "0x18EBFF00",
        "extended": true,
        "data": [
          3,
          15,
          16,
          255,
          255,
          255,
          255,
          255
        ]
      }
    ]
  }
];

export function getTrace(scenario: string): Trace | undefined {
  return TRACES.find((t) => t.scenario === scenario);
}
