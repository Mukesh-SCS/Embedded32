# System requirements

Hardware and software requirements for the Embedded32 classroom module.

## Required (hardware-free track)

| Component | Requirement                            |
| --------- | -------------------------------------- |
| OS        | Windows 10+, macOS 12+, or Linux       |
| Node.js   | 18.x or newer                          |
| npm       | 9.x or newer                           |
| RAM       | 4 GB minimum (8 GB recommended)        |
| Disk      | 500 MB for repository + `node_modules` |
| Network   | Internet for initial `npm ci`          |

## Software setup

```bash
git clone https://github.com/Mukesh-SCS/Embedded32.git
cd Embedded32
npm ci
npm run build
```

Optional but helpful:

- `npx tsx` (installed on demand) for running TypeScript labs
- Git client

## Verified commands

| Command                                             | Purpose              |
| --------------------------------------------------- | -------------------- |
| `npm run build`                                     | Compile all packages |
| `npx tsx labs/.../starter/lab.ts`                   | Run student lab      |
| `npm run test:labs`                                 | Verify lab solutions |
| `npx embedded32-tools simulate vehicle/basic-truck` | Full simulation demo |

## Optional SocketCAN track

For instructors adding a hardware-oriented bonus session:

| Component  | Requirement                             |
| ---------- | --------------------------------------- |
| OS         | Linux or WSL2 with kernel modules       |
| Interface  | `vcan0` or USB-CAN adapter with drivers |
| Privileges | `sudo` for `ip link` setup              |
| Packages   | `can-utils` (optional, for `candump`)   |

Setup example:

```bash
sudo modprobe vcan
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0
```

Embedded32 SocketCAN support depends on the optional `socketcan` npm module and Linux - not required for graded labs.

## Classroom deployment

| Model                  | Notes                                             |
| ---------------------- | ------------------------------------------------- |
| Student laptops        | Default - each student clones repo                |
| Shared lab VM          | Pre-run `npm ci && npm run build` on golden image |
| Codespaces / cloud IDE | Supported if Node 18+; verify `test:labs` timing  |

## Browser demo (future)

The browser demo at `/demo` runs without local Node for viewing traces; **lab grading** still uses the Node toolchain above.

## Accessibility

Labs are terminal-based. Screen-reader users may prefer enlarged terminal fonts and structured `LABxx_*` output lines for parsing.

## Support matrix

| Environment  | Core labs | SocketCAN bonus     |
| ------------ | --------- | ------------------- |
| Windows      | ✅        | ❌ (use simulation) |
| macOS        | ✅        | ❌                  |
| Linux        | ✅        | ✅                  |
| WSL2         | ✅        | ✅ (vcan)           |
| Raspberry Pi | ✅        | ✅ (optional)       |
