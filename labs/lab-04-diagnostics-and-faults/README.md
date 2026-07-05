# Lab 4 - Diagnostics and fault injection

**Time:** 2 hours  
**Hardware:** None

## Learning objectives

- Construct a synthetic DM1 (active DTC) payload
- Decode lamp status and SPN/FMI with `DiagnosticsManager`
- Identify the faulted ECU by source address
- Produce a one-paragraph diagnostic summary suitable for a work order

## Prerequisites

- Labs 1–3
- Read [Diagnostics concepts](../../docs/concepts/diagnostics.md)

## Scenario

The engine ECU (SA `0x00`) reports **coolant temperature above normal** (SPN 26, FMI 0). Your code simulates the DM1 frame bytes and processes them locally.

## Tasks

1. Implement `buildCoolantFaultDm1()` in `starter/lab.ts`.
2. Verify `LAB04_MIL=true` and `LAB04_DTC_SPN=26`.
3. Submit a diagnostic summary answering:
   - Which lamp is illuminated?
   - What parameter failed?
   - What failure mode does FMI 0 indicate?

## Run

```bash
npx tsx labs/lab-04-diagnostics-and-faults/starter/lab.ts
```

## Reference

See [examples/j1939-diagnostics.ts](../../examples/j1939-diagnostics.ts) for additional DM1 examples.

## Scope note

This lab uses a **subset** DTC catalog - not a production scan tool.

## Check your work

```bash
npm run test:labs
```
